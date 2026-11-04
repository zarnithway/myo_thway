-- ============================================================================
-- UMT Construction Group — Hardened Portfolio CMS & Inquiry Schema (Supabase)
-- Run this entire script inside Supabase Dashboard -> SQL Editor -> New Query
-- Safe to re-run at any time (idempotent).
-- ============================================================================

-- 0. Admin Allowlist & Strict Owner Verification (Blocks Unauthorized Sign-Ups)
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Intentionally NO anon/authenticated write policies on admin_users:
-- Only you (via Supabase SQL Editor / Dashboard) can add extra admin emails.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    auth.role() = 'authenticated'
    and auth.uid() is not null
    and (
      -- 1) Explicitly allowlisted admin email in public.admin_users
      exists (
        select 1
        from public.admin_users a
        where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      or (
        -- 2) If admin_users table is empty, ONLY the very first account ever
        --    created in auth.users (the site owner) is granted admin rights.
        not exists (select 1 from public.admin_users)
        and auth.uid() = (
          select u.id
          from auth.users u
          order by u.created_at asc
          limit 1
        )
      )
    );
$$;

-- 1. Structured Portfolio Content Document
create table if not exists public.site_content (
  id text primary key default 'main' check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public visitors can read site_content" on public.site_content;
create policy "Public visitors can read site_content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated admins can manage site_content" on public.site_content;
drop policy if exists "Verified UMT admins can manage site_content" on public.site_content;
create policy "Verified UMT admins can manage site_content"
  on public.site_content
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Hardened Consultation Inquiries Inbox + Per-IP Sliding-Window Rate Limiter
create table if not exists public.rate_limit_logs (
  id bigserial primary key,
  action_key text not null,
  ip_hash text not null,
  fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_logs_lookup
  on public.rate_limit_logs (action_key, ip_hash, created_at desc);

alter table public.rate_limit_logs enable row level security;
-- Intentionally NO public policies on rate_limit_logs: internal to SECURITY DEFINER trigger only.

create or replace function public.request_client_ip_hash()
returns text
language plpgsql
stable
as $$
declare
  headers_raw text;
  headers_json jsonb;
  raw_ip text;
begin
  headers_raw := current_setting('request.headers', true);
  if headers_raw is null or headers_raw = '' then
    return 'local';
  end if;

  headers_json := headers_raw::jsonb;
  raw_ip := coalesce(
    headers_json ->> 'cf-connecting-ip',
    split_part(coalesce(headers_json ->> 'x-forwarded-for', ''), ',', 1),
    headers_json ->> 'x-real-ip',
    'unknown'
  );

  return md5(lower(trim(raw_ip)));
exception
  when others then
    return 'unknown';
end;
$$;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  contact text not null check (char_length(trim(contact)) between 3 and 160),
  message text not null check (char_length(trim(message)) between 5 and 3000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

-- Multi-tier PostgreSQL Rate Limiter (Per-IP burst, Per-IP hourly, Duplicate block & Global cap)
create or replace function public.enforce_inquiry_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_ip text;
  msg_fp text;
  ip_burst_count integer;
  ip_hourly_count integer;
  dup_count integer;
  global_minute_count integer;
begin
  caller_ip := public.request_client_ip_hash();
  msg_fp := md5(lower(trim(new.contact)) || '|' || lower(trim(new.message)));

  -- Prune expired rate-limit records older than 2 hours
  delete from public.rate_limit_logs
   where created_at < now() - interval '2 hours';

  -- Tier 1: Per-IP Burst Limit (max 2 submissions per 2 minutes from same IP)
  select count(*)
    into ip_burst_count
    from public.rate_limit_logs
   where action_key = 'inquiry_submit'
     and ip_hash = caller_ip
     and created_at > now() - interval '2 minutes';

  if ip_burst_count >= 2 then
    raise exception 'Rate limit exceeded: Please wait 2 minutes before sending another inquiry.';
  end if;

  -- Tier 2: Per-IP Hourly Limit (max 5 submissions per hour from same IP)
  select count(*)
    into ip_hourly_count
    from public.rate_limit_logs
   where action_key = 'inquiry_submit'
     and ip_hash = caller_ip
     and created_at > now() - interval '1 hour';

  if ip_hourly_count >= 5 then
    raise exception 'Hourly rate limit reached (max 5 inquiries per hour). Please call or email directly.';
  end if;

  -- Tier 3: Anti-Replay / Duplicate Payload Block (even across rotating proxy IPs)
  select count(*)
    into dup_count
    from public.rate_limit_logs
   where action_key = 'inquiry_submit'
     and fingerprint = msg_fp
     and created_at > now() - interval '15 minutes';

  if dup_count >= 1 then
    raise exception 'Duplicate inquiry detected. Your brief was already received.';
  end if;

  -- Tier 4: Global Distributed Botnet Circuit Breaker (max 20/min globally)
  select count(*)
    into global_minute_count
    from public.rate_limit_logs
   where action_key = 'inquiry_submit'
     and created_at > now() - interval '1 minute';

  if global_minute_count >= 20 then
    raise exception 'Server is busy due to high traffic. Please try again in 1 minute.';
  end if;

  insert into public.rate_limit_logs (action_key, ip_hash, fingerprint)
  values ('inquiry_submit', caller_ip, msg_fp);

  return new;
end;
$$;

drop trigger if exists trg_inquiry_rate_limit on public.contact_inquiries;
create trigger trg_inquiry_rate_limit
  before insert on public.contact_inquiries
  for each row
  execute function public.enforce_inquiry_rate_limit();

drop policy if exists "Public visitors can submit contact_inquiries" on public.contact_inquiries;
create policy "Public visitors can submit contact_inquiries"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and char_length(trim(name)) between 1 and 120
    and char_length(trim(contact)) between 3 and 160
    and char_length(trim(message)) between 5 and 3000
  );

drop policy if exists "Authenticated admins can read contact_inquiries" on public.contact_inquiries;
drop policy if exists "Verified UMT admins can read contact_inquiries" on public.contact_inquiries;
create policy "Verified UMT admins can read contact_inquiries"
  on public.contact_inquiries
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated admins can update contact_inquiries" on public.contact_inquiries;
drop policy if exists "Verified UMT admins can update contact_inquiries" on public.contact_inquiries;
create policy "Verified UMT admins can update contact_inquiries"
  on public.contact_inquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated admins can delete contact_inquiries" on public.contact_inquiries;
drop policy if exists "Verified UMT admins can delete contact_inquiries" on public.contact_inquiries;
create policy "Verified UMT admins can delete contact_inquiries"
  on public.contact_inquiries
  for delete
  to authenticated
  using (public.is_admin());

-- 3. Hardened Storage Bucket (10 MB Limit + Safe MIME Allowlist, No Active SVG Scripts)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'application/pdf'
  ];

drop policy if exists "Public read access for portfolio-media" on storage.objects;
create policy "Public read access for portfolio-media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Authenticated admins can upload portfolio-media" on storage.objects;
drop policy if exists "Verified UMT admins can upload portfolio-media" on storage.objects;
create policy "Verified UMT admins can upload portfolio-media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "Authenticated admins can update portfolio-media" on storage.objects;
drop policy if exists "Verified UMT admins can update portfolio-media" on storage.objects;
create policy "Verified UMT admins can update portfolio-media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "Authenticated admins can delete portfolio-media" on storage.objects;
drop policy if exists "Verified UMT admins can delete portfolio-media" on storage.objects;
create policy "Verified UMT admins can delete portfolio-media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

import { portfolioData as defaultPortfolioData } from '../data/portfolioData';
import type {
  ContactInquiry,
  InquiryStatus,
  PortfolioData,
} from '../types/portfolio';
import {
  isSupabaseConfigured,
  supabase,
  SUPABASE_MEDIA_BUCKET,
} from './supabase';

const LOCAL_PORTFOLIO_KEY = 'umt-cms-portfolio-v1';
const LOCAL_INQUIRIES_KEY = 'umt-cms-inquiries-v1';
const LOCAL_ADMIN_SESSION_KEY = 'umt-cms-local-admin-session';

export interface AdminSessionInfo {
  authenticated: boolean;
  mode: 'supabase' | 'local-preview';
  email: string;
}

function cloneDefaultData(): PortfolioData {
  return JSON.parse(JSON.stringify(defaultPortfolioData)) as PortfolioData;
}

export function normalizePortfolioData(raw: unknown): PortfolioData {
  const fallback = cloneDefaultData();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const candidate = raw as Partial<PortfolioData>;
  return {
    profile: {
      ...fallback.profile,
      ...(candidate.profile && typeof candidate.profile === 'object'
        ? candidate.profile
        : {}),
    },
    metrics: Array.isArray(candidate.metrics)
      ? candidate.metrics
      : fallback.metrics,
    projects: Array.isArray(candidate.projects)
      ? candidate.projects
      : fallback.projects,
    competencies: Array.isArray(candidate.competencies)
      ? candidate.competencies
      : fallback.competencies,
    experience: Array.isArray(candidate.experience)
      ? candidate.experience
      : fallback.experience,
    credentials: Array.isArray(candidate.credentials)
      ? candidate.credentials
      : fallback.credentials,
  };
}

export function getInitialCachedPortfolioData(): PortfolioData {
  try {
    const raw = localStorage.getItem(LOCAL_PORTFOLIO_KEY);
    if (raw) {
      return normalizePortfolioData(JSON.parse(raw));
    }
  } catch {
    // Ignore storage parse errors
  }
  return cloneDefaultData();
}

function persistLocalCache(data: PortfolioData): void {
  try {
    localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota/storage restrictions when caching remote Supabase payload
  }
}

export function hasLocalPreviewCustomizations(): boolean {
  try {
    return localStorage.getItem(LOCAL_PORTFOLIO_KEY) !== null;
  } catch {
    return false;
  }
}

export async function loadPortfolioData(): Promise<{
  data: PortfolioData;
  source: 'supabase' | 'local-storage' | 'default-seed';
}> {
  if (isSupabaseConfigured && supabase) {
    const { data: row, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && row?.data) {
      const normalized = normalizePortfolioData(row.data);
      persistLocalCache(normalized);
      return { data: normalized, source: 'supabase' };
    }
  }

  try {
    const localRaw = localStorage.getItem(LOCAL_PORTFOLIO_KEY);
    if (localRaw) {
      return {
        data: normalizePortfolioData(JSON.parse(localRaw)),
        source: 'local-storage',
      };
    }
  } catch {
    // Ignore storage errors
  }

  return { data: cloneDefaultData(), source: 'default-seed' };
}

export async function savePortfolioData(data: PortfolioData): Promise<void> {
  const normalized = normalizePortfolioData(data);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('site_content').upsert(
      {
        id: 'main',
        data: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      throw new Error(
        `Supabase save failed: ${error.message}. Make sure you ran supabase/schema.sql and are signed in.`
      );
    }

    persistLocalCache(normalized);
    return;
  }

  try {
    localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify(normalized));
  } catch {
    throw new Error(
      'Browser localStorage quota reached in Local Preview Mode. Connect Supabase Storage for unlimited high-res uploads, or remove large embedded files.'
    );
  }
}

export async function seedPortfolioToSupabase(
  data?: PortfolioData
): Promise<PortfolioData> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file first.'
    );
  }

  const payload = normalizePortfolioData(data ?? cloneDefaultData());
  const { error } = await supabase.from('site_content').upsert(
    {
      id: 'main',
      data: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(
      `Failed to seed Supabase: ${error.message}. Run supabase/schema.sql in your Supabase SQL Editor first.`
    );
  }

  persistLocalCache(payload);
  return payload;
}

export function resetLocalPreviewToDefault(): PortfolioData {
  try {
    localStorage.removeItem(LOCAL_PORTFOLIO_KEY);
  } catch {
    // Ignore storage errors
  }
  return cloneDefaultData();
}

// ============================================================================
// Media Upload (Supabase Storage in Live Mode, Optimized Data URL in Preview)
// ============================================================================

export async function compressImageToWebpFile(
  file: File,
  maxDimension = 1920,
  quality = 0.84
): Promise<File> {
  // SVG and non-images bypass canvas compression
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const webpName = `${baseName || 'image'}.webp`;
          const webpFile = new File([blob], webpName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Graceful fallback to original file
    };

    img.src = objectUrl;
  });
}

async function compressImageToDataUrl(
  file: File,
  maxDimension = 1440,
  quality = 0.84
): Promise<string> {
  if (file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        readFileAsDataUrl(file).then(resolve).catch(reject);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outputMime =
        file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
      resolve(canvas.toDataURL(outputMime, quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode selected image file.'));
    };
    img.src = objectUrl;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

const ALLOWED_UPLOAD_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

export async function uploadMediaFile(
  file: File,
  folder: 'profile' | 'projects' | 'documents'
): Promise<string> {
  if (!ALLOWED_UPLOAD_MIMES.has(file.type)) {
    throw new Error(
      'Unsupported file format. Allowed formats: JPG, PNG, WebP, AVIF, and PDF (active SVG scripts are blocked for security).'
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File exceeds the 10 MB security upload limit.');
  }

  const fileToUpload = await compressImageToWebpFile(file);

  if (isSupabaseConfigured && supabase) {
    const safeName = fileToUpload.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const path = `${folder}/${Date.now()}-${safeName || 'upload'}`;

    const { error } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(path, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(
        `Supabase Storage upload failed: ${error.message}. Ensure bucket "${SUPABASE_MEDIA_BUCKET}" exists (run supabase/schema.sql).`
      );
    }

    const { data } = supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // Local Preview Mode fallback
  if (fileToUpload.type.startsWith('image/')) {
    return compressImageToDataUrl(fileToUpload);
  }

  if (fileToUpload.size > 2.5 * 1024 * 1024) {
    throw new Error(
      'In Local Preview Mode, PDF/document files must be under 2.5 MB (connect Supabase Storage for large PDFs).'
    );
  }

  return readFileAsDataUrl(fileToUpload);
}

// ============================================================================
// Consultation Inquiries (Contact Form -> Admin Inbox)
// ============================================================================

interface SupabaseInquiryRow {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

function readLocalInquiries(): ContactInquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ContactInquiry[]) : [];
  } catch {
    return [];
  }
}

function writeLocalInquiries(items: ContactInquiry[]): void {
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

const INQUIRY_COOLDOWN_KEY = 'umt-inquiry-last-sent-ms';
const INQUIRY_COOLDOWN_MS = 60_000;

export async function submitContactInquiry(input: {
  name: string;
  contact: string;
  message: string;
}): Promise<void> {
  // Client-side 60-second cooldown guard before hitting network
  try {
    const lastSent = Number(localStorage.getItem(INQUIRY_COOLDOWN_KEY) ?? '0');
    const remainingSec = Math.ceil(
      (INQUIRY_COOLDOWN_MS - (Date.now() - lastSent)) / 1000
    );
    if (remainingSec > 0) {
      throw new Error(
        `Rate limit active: Please wait ${remainingSec}s before sending another inquiry.`
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Rate limit active:')) {
      throw err;
    }
  }

  const cleanName = input.name.trim();
  const cleanContact = input.contact.trim();
  const cleanMessage = input.message.trim();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_inquiries').insert({
      name: cleanName,
      contact: cleanContact,
      message: cleanMessage,
      status: 'new',
    });

    if (error) {
      throw new Error(error.message);
    }

    try {
      localStorage.setItem(INQUIRY_COOLDOWN_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors
    }
    return;
  }

  const next: ContactInquiry = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `inq-${Date.now()}`,
    name: cleanName,
    contact: cleanContact,
    message: cleanMessage,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  const current = readLocalInquiries();
  writeLocalInquiries([next, ...current]);
  try {
    localStorage.setItem(INQUIRY_COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
}

export async function fetchContactInquiries(): Promise<ContactInquiry[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('id, name, contact, message, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as SupabaseInquiryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  return readLocalInquiries();
}

export async function updateContactInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const next = readLocalInquiries().map((item) =>
    item.id === id ? { ...item, status } : item
  );
  writeLocalInquiries(next);
}

export async function deleteContactInquiry(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('contact_inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const next = readLocalInquiries().filter((item) => item.id !== id);
  writeLocalInquiries(next);
}

// ============================================================================
// Admin Authentication (Supabase Auth + Local Preview Session)
// ============================================================================

export async function getAdminSession(): Promise<AdminSessionInfo> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    return {
      authenticated: Boolean(user),
      mode: 'supabase',
      email: user?.email ?? '',
    };
  }

  let active = false;
  try {
    active = sessionStorage.getItem(LOCAL_ADMIN_SESSION_KEY) === 'active';
  } catch {
    active = false;
  }

  return {
    authenticated: active,
    mode: 'local-preview',
    email: active ? 'local-preview@umtconstruction.com' : '',
  };
}

export async function signInAdminWithSupabase(
  email: string,
  password: string
): Promise<AdminSessionInfo> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase credentials are not configured in .env yet.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Invalid email or password.');
  }

  return {
    authenticated: true,
    mode: 'supabase',
    email: data.user.email ?? email.trim(),
  };
}

export function signInLocalPreview(): AdminSessionInfo {
  try {
    sessionStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'active');
  } catch {
    // Ignore storage errors
  }

  return {
    authenticated: true,
    mode: 'local-preview',
    email: 'local-preview@umtconstruction.com',
  };
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }

  try {
    sessionStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

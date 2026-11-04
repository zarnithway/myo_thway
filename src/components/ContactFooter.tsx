import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { submitContactInquiry } from '../lib/cmsService';
import type { PortfolioData } from '../types/portfolio';
import { GlassCard } from './ui/GlassCard';

interface ContactFooterProps {
  profile: PortfolioData['profile'];
  onNavigateAdmin?: () => void;
}

export function ContactFooter({
  profile,
  onNavigateAdmin,
}: ContactFooterProps) {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const mountedAtRef = useRef<number>(0);

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const safeProfileLink =
    /^https?:\/\//i.test(profile.linkedin.trim())
      ? profile.linkedin.trim()
      : 'https://linkedin.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Anti-bot honeypot & minimum human fill-time trap (< 1.5s after mount)
    if (
      honeypot.trim().length > 0 ||
      Date.now() - mountedAtRef.current < 1500
    ) {
      setSubmitted(true);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitContactInquiry({ name, contact, message });
      setSubmitted(true);
      setName('');
      setContact('');
      setMessage('');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to send inquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-14"
    >
      <div
        className="border-b pb-6 sm:pb-8"
        style={{ borderColor: 'var(--glass-border-outer)' }}
      >
        <p
          className="font-mono text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--gold)' }}
        >
          04 // Consultation & Home Construction Inquiry
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Build with {profile.company}
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-12">
        {/* Direct Contact Channels with Official UMT Brand Lockup */}
        <GlassCard className="flex flex-col justify-between p-5 sm:p-8 lg:col-span-5">
          <div>
            {/* Official UMT Construction Group Brand Header */}
            <div
              className="mb-5 flex items-center gap-3.5 border-b pb-5"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-xs ring-1 ring-slate-900/10 sm:h-12 sm:w-12">
                <img
                  src={profile.companyLogo}
                  alt={profile.company}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <p
                  className="font-display truncate text-sm font-bold tracking-tight uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {profile.company}
                </p>
                <p
                  className="mt-0.5 truncate font-mono text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Lead: {profile.name}, {profile.credentials}
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Available for custom residential home construction, R.S.E.
              structural design & calculation sign-off, municipal building
              permit packages, and turnkey project management.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="tech-chip flex items-center justify-between gap-2 rounded-xl p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--gold)' }}
                  />
                  <span
                    className="truncate font-mono text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {profile.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-opacity hover:opacity-80 sm:px-2 sm:py-1"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className="flex items-center gap-2.5 px-1 text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Phone
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: 'var(--gold)' }}
                />
                <span className="font-mono">{profile.phone}</span>
              </div>

              <div
                className="flex items-start gap-2.5 px-1 text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: 'var(--gold)' }}
                />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          <div
            className="mt-7 border-t pt-5 sm:mt-8"
            style={{ borderColor: 'var(--glass-border-outer)' }}
          >
            <a
              href={safeProfileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              <span>Connect via Professional Profile</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </GlassCard>

        {/* Minimalist Project Brief Form */}
        <GlassCard className="p-5 sm:p-8 lg:col-span-7">
          {submitted ? (
            <div className="flex h-full min-h-[240px] flex-col items-start justify-center">
              <span
                className="rounded-full px-3 py-1 font-mono text-xs"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
              >
                INQUIRY RECEIVED
              </span>
              <h3
                className="mt-3 text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Thank you — project brief logged.
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {profile.name} and the {profile.company} engineering team will
                follow up within 1 business day.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 cursor-pointer font-mono text-xs underline"
                style={{ color: 'var(--accent)' }}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Honeypot Anti-Spam Field */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="company-website-url">Website</label>
                <input
                  id="company-website-url"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="sender-name"
                    className="block font-mono text-[11px] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Client Name
                  </label>
                  <input
                    id="sender-name"
                    name="name"
                    type="text"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="U Kyaw Swar / Homeowner"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-base outline-none transition-shadow sm:text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="sender-email"
                    className="block font-mono text-[11px] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Phone or Email
                  </label>
                  <input
                    id="sender-email"
                    name="email"
                    type="text"
                    required
                    maxLength={160}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+95 9 ... or email@domain.com"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-base outline-none transition-shadow sm:text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="project-scope"
                  className="block font-mono text-[11px] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Plot Size, Stories & Construction Scope
                </label>
                <textarea
                  id="project-scope"
                  name="message"
                  rows={4}
                  required
                  minLength={5}
                  maxLength={3000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., 40' × 60' plot in Mandalay, 3-story modern RC residence, turnkey design & build..."
                  className="tech-chip input-focus mt-1.5 w-full resize-none rounded-xl px-3.5 py-2.5 text-base outline-none transition-shadow sm:text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {submitError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
                <span
                  className="text-center font-mono text-[11px] sm:text-left"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Site inspection & BOQ estimate available
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 sm:min-h-0"
                  style={{
                    backgroundColor: 'var(--solid-bg)',
                    color: 'var(--solid-fg)',
                  }}
                >
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {submitting ? 'Sending Brief...' : 'Request Consultation'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </GlassCard>
      </div>

      {/* CAD Engineering Title-Block Footer: 1 col small phone -> 2 col tablet -> 4 col desktop */}
      <div
        className="mt-12 grid grid-cols-1 gap-3.5 rounded-2xl border p-4 font-mono text-[11px] sm:mt-16 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        style={{
          borderColor: 'var(--glass-border-outer)',
          backgroundColor: 'var(--glass-bg)',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          <span className="block text-[9px] uppercase opacity-70">
            LEAD ENGINEER
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {profile.name}, {profile.credentials}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase opacity-70">
            FIRM / PRACTICE
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {profile.company}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase opacity-70">
            ACADEMIC / REGISTRATION
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            B.E. (Civil) YTU • R.S.E.
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 lg:flex-col lg:items-end lg:justify-start lg:text-right">
          <div>
            <span className="block text-[9px] uppercase opacity-70">
              DRAWING NO. / SCALE
            </span>
            <span style={{ color: 'var(--text-primary)' }}>
              UMT-RES-2026 • 1:100
            </span>
          </div>
          {onNavigateAdmin && (
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAdmin();
              }}
              className="inline-flex items-center gap-1 text-[10px] opacity-65 transition-opacity hover:opacity-100"
              style={{ color: 'var(--text-muted)' }}
            >
              <Lock className="h-2.5 w-2.5" />
              <span>Admin</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

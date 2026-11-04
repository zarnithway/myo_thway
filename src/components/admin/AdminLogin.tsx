import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Database,
  KeyRound,
  Lock,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  signInAdminWithSupabase,
  signInLocalPreview,
  type AdminSessionInfo,
} from '../../lib/cmsService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { GlassCard } from '../ui/GlassCard';

interface AdminLoginProps {
  companyName: string;
  companyLogo: string;
  theme: 'architectural' | 'blueprint';
  onToggleTheme: () => void;
  onAuthenticated: (session: AdminSessionInfo) => void;
  onNavigateHome: () => void;
}

const LOGIN_GUARD_KEY = 'umt-admin-login-guard';
const MAX_FAILED_ATTEMPTS = 5;

interface LoginGuardState {
  failures: number;
  lockUntilMs: number;
}

function readLoginGuard(): LoginGuardState {
  try {
    const raw = localStorage.getItem(LOGIN_GUARD_KEY);
    if (!raw) return { failures: 0, lockUntilMs: 0 };
    const parsed = JSON.parse(raw) as Partial<LoginGuardState>;
    return {
      failures: typeof parsed.failures === 'number' ? parsed.failures : 0,
      lockUntilMs:
        typeof parsed.lockUntilMs === 'number' ? parsed.lockUntilMs : 0,
    };
  } catch {
    return { failures: 0, lockUntilMs: 0 };
  }
}

function writeLoginGuard(state: LoginGuardState): void {
  try {
    localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function AdminLogin({
  companyName,
  companyLogo,
  theme,
  onToggleTheme,
  onAuthenticated,
  onNavigateHome,
}: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guard, setGuard] = useState<LoginGuardState>(readLoginGuard);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const lockoutSeconds = Math.max(
    0,
    Math.ceil((guard.lockUntilMs - nowMs) / 1000)
  );

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSupabaseLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentNow = Date.now();
    setNowMs(currentNow);
    if (guard.lockUntilMs > currentNow) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const session = await signInAdminWithSupabase(email, password);
      const resetState = { failures: 0, lockUntilMs: 0 };
      writeLoginGuard(resetState);
      setGuard(resetState);
      onAuthenticated(session);
    } catch (err) {
      const nextFailures = guard.failures + 1;
      let nextLockUntil = 0;
      if (nextFailures >= MAX_FAILED_ATTEMPTS) {
        // Exponential backoff: 60s on 5th failure, 120s, 240s, max 10 min
        const penaltyTier = nextFailures - MAX_FAILED_ATTEMPTS;
        const lockSec = Math.min(600, 60 * Math.pow(2, penaltyTier));
        nextLockUntil = Date.now() + lockSec * 1000;
      }
      const nextGuard = { failures: nextFailures, lockUntilMs: nextLockUntil };
      writeLoginGuard(nextGuard);
      setGuard(nextGuard);
      setNowMs(Date.now());
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalPreviewEnter = () => {
    const session = signInLocalPreview();
    onAuthenticated(session);
  };

  return (
    <div className="cad-grid-bg relative flex min-h-screen flex-col justify-between px-4 py-8 sm:px-6">
      {/* Top Bar */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="tech-chip inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs transition-opacity hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Portfolio</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="tech-chip flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 font-mono text-[11px]"
        >
          {theme === 'architectural' ? (
            <>
              <Moon className="h-3.5 w-3.5" />
              <span>BLUEPRINT</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5" />
              <span>DAYLIGHT</span>
            </>
          )}
        </button>
      </div>

      {/* Center Login Card */}
      <div className="mx-auto my-10 w-full max-w-md">
        <GlassCard className="p-6 sm:p-8 !transition-none">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-xs ring-1 ring-slate-900/10">
              <img
                src={companyLogo}
                alt={companyName}
                className="h-full w-full object-contain"
              />
            </span>
            <div>
              <p
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--gold)' }}
              >
                ADMINISTRATION STUDIO
              </p>
              <h1
                className="font-display text-lg font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {companyName}
              </h1>
            </div>
          </div>

          <div
            className="mt-5 flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[11px]"
            style={{
              backgroundColor: isSupabaseConfigured
                ? 'var(--accent-soft)'
                : 'var(--gold-soft)',
              borderColor: isSupabaseConfigured
                ? 'var(--accent-border)'
                : 'var(--gold-border)',
              color: isSupabaseConfigured ? 'var(--accent)' : 'var(--gold)',
            }}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span>
              {isSupabaseConfigured
                ? 'SUPABASE CLOUD CONNECTED'
                : 'LOCAL PREVIEW MODE (.env not configured yet)'}
            </span>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleSupabaseLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block font-mono text-[11px] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="myothway@umtconstruction.com"
                  className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block font-mono text-[11px] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {lockoutSeconds > 0 && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 font-mono text-xs text-amber-600 dark:text-amber-400">
                  Too many failed sign-in attempts. Locked for {lockoutSeconds}s.
                </div>
              )}

              {error && lockoutSeconds === 0 && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  backgroundColor: 'var(--solid-bg)',
                  color: 'var(--solid-fg)',
                }}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>
                  {lockoutSeconds > 0
                    ? `Locked (${lockoutSeconds}s)`
                    : loading
                      ? 'Authenticating...'
                      : 'Sign In with Supabase Auth'}
                </span>
              </button>

              <p
                className="text-center font-mono text-[11px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Create your admin user in Supabase Dashboard → Authentication →
                Users.
              </p>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Supabase credentials are not set in <code>.env</code> yet. You
                can open <strong>Local Preview Mode</strong> right now to edit
                all sections, upload photos, and test inquiries immediately in
                your browser — then push everything to Supabase with one click
                once connected.
              </p>

              <button
                type="button"
                onClick={handleLocalPreviewEnter}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition-transform hover:scale-[1.01]"
                style={{
                  backgroundColor: 'var(--solid-bg)',
                  color: 'var(--solid-fg)',
                }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Enter Admin Studio (Local Preview)</span>
              </button>

              <div
                className="rounded-xl border p-3 font-mono text-[11px] leading-relaxed"
                style={{
                  borderColor: 'var(--glass-border-outer)',
                  backgroundColor: 'var(--chip-bg)',
                  color: 'var(--text-muted)',
                }}
              >
                <div
                  className="mb-1 flex items-center gap-1.5 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <KeyRound className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
                  <span>To enable live Supabase Auth & Cloud Storage:</span>
                </div>
                1. Copy <code>.env.example</code> to <code>.env</code>
                <br />
                2. Paste <code>VITE_SUPABASE_URL</code> &{' '}
                <code>VITE_SUPABASE_ANON_KEY</code>
                <br />
                3. Run <code>supabase/schema.sql</code> in Supabase SQL Editor
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Footer Security Note */}
      <div
        className="mx-auto flex items-center gap-2 font-mono text-[11px]"
        style={{ color: 'var(--text-muted)' }}
      >
        <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
        <span>Row-Level Security (RLS) Protected • UMT CMS v1.0</span>
      </div>
    </div>
  );
}

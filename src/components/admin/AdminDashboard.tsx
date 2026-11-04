import { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  Check,
  Database,
  ExternalLink,
  FolderKanban,
  Inbox,
  LogOut,
  Moon,
  Save,
  Sun,
  UserCheck,
} from 'lucide-react';
import {
  fetchContactInquiries,
  getAdminSession,
  savePortfolioData,
  signOutAdmin,
  type AdminSessionInfo,
} from '../../lib/cmsService';
import { supabase } from '../../lib/supabase';
import type { ContactInquiry, PortfolioData } from '../../types/portfolio';
import { AdminLogin } from './AdminLogin';
import { ExpertiseCareerEditor } from './ExpertiseCareerEditor';
import { InquiriesInbox } from './InquiriesInbox';
import { ProfileMetricsEditor } from './ProfileMetricsEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { SupabaseSetupPanel } from './SupabaseSetupPanel';

type AdminTab =
  | 'profile'
  | 'projects'
  | 'expertise'
  | 'inquiries'
  | 'supabase';

interface AdminDashboardProps {
  portfolioData: PortfolioData;
  onPortfolioSaved: (next: PortfolioData) => void;
  theme: 'architectural' | 'blueprint';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

export function AdminDashboard({
  portfolioData,
  onPortfolioSaved,
  theme,
  onToggleTheme,
  onNavigateHome,
}: AdminDashboardProps) {
  const [session, setSession] = useState<AdminSessionInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');

  const [draftOverride, setDraftOverride] = useState<PortfolioData | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const draft: PortfolioData = draftOverride ?? portfolioData;
  const isDirty = draftOverride !== null;

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    tone: 'success' | 'error';
  } | null>(null);

  const notify = useCallback(
    (message: string, tone: 'success' | 'error' = 'success') => {
      setToast({ message, tone });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const refreshInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const list = await fetchContactInquiries();
      setInquiries(list);
    } catch {
      // Ignore if table not created yet before running schema.sql
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminSession().then((info) => {
      if (!active) return;
      setSession(info);
      setCheckingAuth(false);
      if (info.authenticated) {
        fetchContactInquiries()
          .then((list) => {
            if (active) setInquiries(list);
          })
          .catch(() => {});
      }
    });

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (!active) return;
        const authed = Boolean(sess?.user);
        setSession({
          authenticated: authed,
          mode: 'supabase',
          email: sess?.user?.email ?? '',
        });
        if (authed) {
          fetchContactInquiries()
            .then((list) => {
              if (active) setInquiries(list);
            })
            .catch(() => {});
        }
      });
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, []);

  const updateDraft = (updater: (prev: PortfolioData) => PortfolioData) => {
    setDraftOverride((prev) => {
      const base: PortfolioData =
        prev ?? (JSON.parse(JSON.stringify(portfolioData)) as PortfolioData);
      return updater(base);
    });
  };

  const handleSavePublish = async () => {
    setSaving(true);
    try {
      await savePortfolioData(draft);
      onPortfolioSaved(draft);
      setDraftOverride(null);
      notify(
        session?.mode === 'supabase'
          ? 'Saved & published to Supabase Cloud!'
          : 'Saved to Local Preview! Open Portfolio to inspect live changes.'
      );
    } catch (err) {
      notify(
        err instanceof Error ? err.message : 'Failed to save changes.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (
      isDirty &&
      !window.confirm('You have unsaved changes. Sign out anyway?')
    ) {
      return;
    }
    await signOutAdmin();
    setSession((prev) =>
      prev ? { ...prev, authenticated: false, email: '' } : null
    );
  };

  const handleViewSite = () => {
    if (
      isDirty &&
      !window.confirm(
        'You have unsaved edits. Leave Admin without saving, or click Cancel to Save & Publish first?'
      )
    ) {
      return;
    }
    onNavigateHome();
  };

  if (checkingAuth) {
    return (
      <div className="cad-grid-bg flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          LOADING UMT ADMIN STUDIO...
        </p>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <AdminLogin
        companyName={draft.profile.company}
        companyLogo={draft.profile.companyLogo}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onAuthenticated={(nextSession) => {
          setSession(nextSession);
          refreshInquiries();
        }}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  const unreadCount = inquiries.filter((i) => i.status === 'new').length;

  const tabs: {
    id: AdminTab;
    label: string;
    icon: typeof UserCheck;
    badge?: number;
  }[] = [
    { id: 'profile', label: 'Profile & Metrics', icon: UserCheck },
    {
      id: 'projects',
      label: 'Projects & Gallery',
      icon: FolderKanban,
      badge: draft.projects.length,
    },
    { id: 'expertise', label: 'Expertise & Career', icon: Briefcase },
    {
      id: 'inquiries',
      label: 'Inquiries Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'supabase', label: 'Supabase & Backup', icon: Database },
  ];

  return (
    <div className="cad-grid-bg min-h-screen pb-16">
      {/* Sticky Admin Command Header */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="glass-strong mx-auto max-w-6xl rounded-2xl px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: UMT Admin Identity + Mode Badge */}
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1 shadow-xs ring-1 ring-slate-900/10">
                <img
                  src={draft.profile.companyLogo}
                  alt={draft.profile.company}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-display truncate text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    UMT Admin Studio
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
                    style={{
                      backgroundColor:
                        session.mode === 'supabase'
                          ? 'var(--accent-soft)'
                          : 'var(--gold-soft)',
                      color:
                        session.mode === 'supabase'
                          ? 'var(--accent)'
                          : 'var(--gold)',
                    }}
                  >
                    {session.mode === 'supabase'
                      ? 'SUPABASE LIVE'
                      : 'LOCAL PREVIEW'}
                  </span>
                </div>
                <p
                  className="truncate font-mono text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {session.email}
                </p>
              </div>
            </div>

            {/* Right: Save & Publish + Live Site + Theme + Logout */}
            <div className="flex flex-wrap items-center gap-2">
              {isDirty && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold"
                  style={{
                    backgroundColor: 'var(--gold-soft)',
                    color: 'var(--gold)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--gold-dot)' }}
                  />
                  Unsaved Edits
                </span>
              )}

              <button
                type="button"
                onClick={handleSavePublish}
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-xs transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--solid-bg)',
                  color: 'var(--solid-fg)',
                }}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
              </button>

              <button
                type="button"
                onClick={handleViewSite}
                className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>View Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                title="Switch Light / Blueprint Theme"
                className="tech-chip flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
              >
                {theme === 'architectural' ? (
                  <Moon className="h-3.5 w-3.5" />
                ) : (
                  <Sun className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="tech-chip flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Section Switcher Bar */}
          <div
            className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto border-t pt-3"
            style={{ borderColor: 'var(--glass-border-outer)' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--accent-soft)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid var(--accent-border)'
                      : '1px solid transparent',
                    color: isActive
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className="rounded-full px-1.5 py-0.2 font-mono text-[10px] font-semibold"
                      style={{
                        backgroundColor:
                          tab.id === 'inquiries'
                            ? 'var(--gold-soft)'
                            : 'var(--chip-bg)',
                        color:
                          tab.id === 'inquiries'
                            ? 'var(--gold)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 max-w-sm">
          <div
            className="glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-medium shadow-lg"
            style={{
              borderColor:
                toast.tone === 'error'
                  ? 'rgba(239, 68, 68, 0.45)'
                  : 'var(--gold-border)',
              color:
                toast.tone === 'error' ? '#ef4444' : 'var(--text-primary)',
            }}
          >
            <Check
              className="h-4 w-4 shrink-0"
              style={{
                color: toast.tone === 'error' ? '#ef4444' : 'var(--gold)',
              }}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Editor Workspace */}
      <main className="mx-auto mt-6 max-w-6xl px-3 sm:px-6">
        {activeTab === 'profile' && (
          <ProfileMetricsEditor
            profile={draft.profile}
            metrics={draft.metrics}
            onChangeProfile={(profile) =>
              updateDraft((prev) => ({ ...prev, profile }))
            }
            onChangeMetrics={(metrics) =>
              updateDraft((prev) => ({ ...prev, metrics }))
            }
            onNotify={notify}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsEditor
            projects={draft.projects}
            onChangeProjects={(projects) =>
              updateDraft((prev) => ({ ...prev, projects }))
            }
            onNotify={notify}
          />
        )}

        {activeTab === 'expertise' && (
          <ExpertiseCareerEditor
            competencies={draft.competencies}
            experience={draft.experience}
            credentials={draft.credentials}
            onChangeCompetencies={(competencies) =>
              updateDraft((prev) => ({ ...prev, competencies }))
            }
            onChangeExperience={(experience) =>
              updateDraft((prev) => ({ ...prev, experience }))
            }
            onChangeCredentials={(credentials) =>
              updateDraft((prev) => ({ ...prev, credentials }))
            }
          />
        )}

        {activeTab === 'inquiries' && (
          <InquiriesInbox
            inquiries={inquiries}
            loading={loadingInquiries}
            onRefresh={refreshInquiries}
            onChangeInquiries={setInquiries}
            onNotify={notify}
          />
        )}

        {activeTab === 'supabase' && (
          <SupabaseSetupPanel
            draftData={draft}
            onReplaceDraftAndLive={(next) => {
              onPortfolioSaved(next);
              setDraftOverride(null);
            }}
            onNotify={notify}
          />
        )}
      </main>
    </div>
  );
}

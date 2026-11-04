import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ContactFooter } from './components/ContactFooter';
import { ExpertiseBento } from './components/ExpertiseBento';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ProjectModal } from './components/ProjectModal';
import { ProjectsSection } from './components/ProjectsSection';
import { TimelineSection } from './components/TimelineSection';
import {
  getInitialCachedPortfolioData,
  loadPortfolioData,
} from './lib/cmsService';
import { hashAdminSlug } from './lib/sha256';
import type { CivilProject, PortfolioData } from './types/portfolio';

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);

type ThemeMode = 'architectural' | 'blueprint';

const LEGACY_THEME_KEY = 'umt-portfolio-theme';
const THEME_OVERRIDE_KEY = 'umt-theme-override';

function getSystemTheme(): ThemeMode {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'blueprint';
  }
  return 'architectural';
}

function findProjectByQuery(projects: CivilProject[]): CivilProject | null {
  if (typeof window === 'undefined') return null;
  const queryCode = new URLSearchParams(window.location.search).get('project');
  if (!queryCode) return null;
  const normalized = queryCode.trim().toLowerCase();
  return (
    projects.find((p) => {
      if (p.status === 'draft') return false;
      return (
        p.code?.toLowerCase() === normalized ||
        p.id?.toLowerCase() === normalized
      );
    }) ?? null
  );
}

export function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [routeState, setRouteState] = useState<
    'checking' | 'public' | 'secret-admin'
  >(() => {
    if (typeof window === 'undefined') return 'public';
    const clean = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!clean || clean.toLowerCase() === 'admin' || !__ADMIN_ROUTE_HASH__) {
      return 'public';
    }
    return 'checking';
  });

  const [content, setContent] = useState<PortfolioData>(
    getInitialCachedPortfolioData
  );
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getSystemTheme);
  const [themeOverride, setThemeOverride] = useState<ThemeMode | null>(() => {
    try {
      localStorage.removeItem(LEGACY_THEME_KEY);
      const saved = localStorage.getItem(THEME_OVERRIDE_KEY);
      return saved === 'blueprint' || saved === 'architectural' ? saved : null;
    } catch {
      return null;
    }
  });
  const [selectedProject, setSelectedProject] = useState<CivilProject | null>(() =>
    findProjectByQuery(getInitialCachedPortfolioData().projects)
  );

  const theme: ThemeMode = themeOverride ?? systemTheme;

  // Verify secret admin slug via salted SHA-256 hash; silently normalize "/admin" or invalid paths to "/"
  useEffect(() => {
    let active = true;
    const clean = pathname.replace(/^\/+|\/+$/g, '');

    if (!clean) {
      return () => {
        active = false;
      };
    }

    if (clean.toLowerCase() === 'admin' || !__ADMIN_ROUTE_HASH__) {
      window.history.replaceState(null, '', '/');
      return () => {
        active = false;
      };
    }

    hashAdminSlug(clean).then((digest) => {
      if (!active) return;
      if (digest && digest === __ADMIN_ROUTE_HASH__) {
        setRouteState('secret-admin');
      } else {
        window.history.replaceState(null, '', '/');
        setRouteState('public');
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  // Synchronize browser URL query param whenever selectedProject opens or closes
  const handleSelectProject = useCallback(
    (project: CivilProject | null) => {
      setSelectedProject(project);
      if (typeof window === 'undefined' || routeState === 'secret-admin') return;

      const url = new URL(window.location.href);
      if (project) {
        url.searchParams.set('project', project.code);
      } else {
        url.searchParams.delete('project');
      }
      window.history.replaceState({}, '', url.toString());
    },
    [routeState]
  );

  // Prevent search engine indexing whenever viewing secret admin studio
  useEffect(() => {
    if (routeState !== 'secret-admin') return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [routeState]);

  // Load latest portfolio content from Supabase (or local preview cache)
  useEffect(() => {
    let active = true;
    loadPortfolioData().then(({ data }) => {
      if (active) {
        setContent(data);
        const queryMatched = findProjectByQuery(data.projects);
        setSelectedProject((current) => {
          if (!current) return queryMatched;
          return (
            data.projects.find(
              (p) => p.code?.toLowerCase() === current.code?.toLowerCase()
            ) ?? current
          );
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Client-side SPA route listener
  useEffect(() => {
    const handlePopState = () => {
      const next = window.location.pathname;
      const clean = next.replace(/^\/+|\/+$/g, '');
      setPathname(next);
      if (!clean || clean.toLowerCase() === 'admin' || !__ADMIN_ROUTE_HASH__) {
        setRouteState('public');
      } else {
        setRouteState('checking');
      }

      setSelectedProject(findProjectByQuery(content.projects));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [content.projects]);

  const navigateHome = useCallback(() => {
    window.history.pushState(null, '', '/');
    setPathname('/');
    setRouteState('public');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sync live with OS / browser light-dark color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => {
      const nextSystem: ThemeMode = e.matches ? 'blueprint' : 'architectural';
      setSystemTheme(nextSystem);
      setThemeOverride(null);
      try {
        localStorage.removeItem(THEME_OVERRIDE_KEY);
      } catch {
        // Ignore storage errors in restricted environments
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (theme === 'blueprint') {
      document.documentElement.setAttribute('data-theme', 'blueprint');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode =
      theme === 'architectural' ? 'blueprint' : 'architectural';

    if (nextTheme === systemTheme) {
      setThemeOverride(null);
      try {
        localStorage.removeItem(THEME_OVERRIDE_KEY);
      } catch {
        // Ignore storage errors in restricted environments
      }
    } else {
      setThemeOverride(nextTheme);
      try {
        localStorage.setItem(THEME_OVERRIDE_KEY, nextTheme);
      } catch {
        // Ignore storage errors in restricted environments
      }
    }
  };

  const handleDownloadResume = () => {
    const { profile, experience, credentials, competencies } = content;

    const rawResumeUrl = profile.resumeUrl?.trim() ?? '';
    const isSafeResumeUrl =
      rawResumeUrl.startsWith('https://') ||
      rawResumeUrl.startsWith('http://') ||
      rawResumeUrl.startsWith('/') ||
      rawResumeUrl.startsWith('data:application/pdf');

    if (rawResumeUrl.length > 0 && isSafeResumeUrl) {
      const link = document.createElement('a');
      link.href = rawResumeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (rawResumeUrl.startsWith('data:')) {
        link.download = `${profile.name.replace(/\s+/g, '_')}_CV.pdf`;
      }
      link.click();
      return;
    }

    const specText = [
      `${profile.name.toUpperCase()}, ${profile.credentials}`,
      `${profile.title} — ${profile.company}`,
      `${profile.licenseNumber}`,
      `${profile.location} | ${profile.email} | ${profile.phone}`,
      `====================================================================`,
      ``,
      `EXECUTIVE PROFILE`,
      profile.bio,
      ``,
      `LEADERSHIP & PRACTICE HISTORY`,
      ...experience.map(
        (exp) =>
          `• ${exp.role} — ${exp.organization} (${exp.period})\n  ${exp.summary}`
      ),
      ``,
      `LICENSURE & EDUCATION`,
      ...credentials.map(
        (c) => `• ${c.title} | ${c.issuer} (${c.year}) — ${c.status}`
      ),
      ``,
      `CORE ENGINEERING CAPABILITIES & CODES`,
      ...competencies.map(
        (comp) => `• ${comp.title}: ${comp.items.join(', ')}`
      ),
    ].join('\n');

    const blob = new Blob([specText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Myo_Thway_RSE_UMT_Construction_CV.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (routeState === 'checking') {
    return <div className="cad-grid-bg min-h-screen" />;
  }

  if (routeState === 'secret-admin') {
    return (
      <Suspense fallback={<div className="cad-grid-bg min-h-screen" />}>
        <AdminDashboard
          portfolioData={content}
          onPortfolioSaved={(next) => setContent(next)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onNavigateHome={navigateHome}
        />
      </Suspense>
    );
  }

  return (
    <div className="cad-grid-bg relative min-h-screen">
      {/* Subtle Ambient Architectural Light Washes Behind Frosted Glass */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 right-[8%] h-[460px] w-[460px] rounded-full blur-[110px]"
          style={{ backgroundColor: 'var(--orb-sky)' }}
        />
        <div
          className="absolute top-[38%] -left-24 h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'var(--orb-slate)' }}
        />
        <div
          className="absolute right-[12%] bottom-[8%] h-[380px] w-[380px] rounded-full blur-[115px]"
          style={{ backgroundColor: 'var(--orb-warm)' }}
        />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10">
        <Navbar
          profile={content.profile}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onDownloadResume={handleDownloadResume}
        />

        <main>
          <Hero
            profile={content.profile}
            metrics={content.metrics}
            onDownloadResume={handleDownloadResume}
          />

          <ProjectsSection
            projects={content.projects}
            onSelectProject={handleSelectProject}
          />

          <ExpertiseBento competencies={content.competencies} />

          <TimelineSection
            experience={content.experience}
            credentials={content.credentials}
          />
        </main>

        <ContactFooter profile={content.profile} />
      </div>

      {/* Engineering Case Study Glass Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => handleSelectProject(null)}
      />
    </div>
  );
}

export default App;

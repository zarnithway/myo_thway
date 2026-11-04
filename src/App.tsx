import { useEffect, useState } from 'react';
import { ContactFooter } from './components/ContactFooter';
import { ExpertiseBento } from './components/ExpertiseBento';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ProjectModal } from './components/ProjectModal';
import { ProjectsSection } from './components/ProjectsSection';
import { TimelineSection } from './components/TimelineSection';
import { portfolioData } from './data/portfolioData';
import type { CivilProject } from './types/portfolio';

const THEME_STORAGE_KEY = 'umt-portfolio-theme';

export function App() {
  const [theme, setTheme] = useState<'architectural' | 'blueprint'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'blueprint'
        ? 'blueprint'
        : 'architectural';
    } catch {
      return 'architectural';
    }
  });
  const [selectedProject, setSelectedProject] = useState<CivilProject | null>(
    null
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (theme === 'blueprint') {
      document.documentElement.setAttribute('data-theme', 'blueprint');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) =>
      prev === 'architectural' ? 'blueprint' : 'architectural'
    );
  };

  const handleDownloadResume = () => {
    const { profile, experience, credentials, competencies } = portfolioData;
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
          profile={portfolioData.profile}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onDownloadResume={handleDownloadResume}
        />

        <main>
          <Hero
            profile={portfolioData.profile}
            metrics={portfolioData.metrics}
            onDownloadResume={handleDownloadResume}
          />

          <ProjectsSection
            projects={portfolioData.projects}
            onSelectProject={setSelectedProject}
          />

          <ExpertiseBento competencies={portfolioData.competencies} />

          <TimelineSection
            experience={portfolioData.experience}
            credentials={portfolioData.credentials}
          />
        </main>

        <ContactFooter profile={portfolioData.profile} />
      </div>

      {/* Engineering Case Study Glass Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}

export default App;

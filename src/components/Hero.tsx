import { useState } from 'react';
import { ArrowUpRight, FileText, MapPin } from 'lucide-react';
import type { ImpactMetric, PortfolioData } from '../types/portfolio';
import { GlassCard } from './ui/GlassCard';

interface HeroProps {
  profile: PortfolioData['profile'];
  metrics: ImpactMetric[];
  onDownloadResume: () => void;
}

export function Hero({ profile, metrics, onDownloadResume }: HeroProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="top"
      className="relative mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
    >
      {/* Split Architectural Hero Grid */}
      <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left 7 Cols: Minimalist Introduction */}
        <div className="lg:col-span-7">
          <p
            className="mb-2 font-mono text-[11px] font-medium tracking-widest uppercase sm:text-xs"
            style={{ color: 'var(--gold)' }}
          >
            {profile.name}, {profile.credentials} • {profile.title}
          </p>

          <h1
            className="text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.1rem] lg:leading-[1.12]"
            style={{ color: 'var(--text-primary)' }}
          >
            {profile.tagline}
          </h1>

          <p
            className="mt-4 max-w-xl text-sm leading-relaxed font-normal sm:mt-5 sm:text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {profile.bio}
          </p>

          {/* Location & Primary Actions */}
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <a
              href="#projects"
              onClick={(e) => {
                const el = document.getElementById('projects');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                  window.history.replaceState(null, '', '#projects');
                }
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--solid-bg)',
                color: 'var(--solid-fg)',
              }}
            >
              <span>View Residential Works</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            </a>

            <button
              type="button"
              onClick={onDownloadResume}
              className="glass-panel glass-panel-interactive inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              <FileText
                className="h-4 w-4 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--gold)' }}
              />
              <span>Download CV</span>
            </button>

            <span
              className="inline-flex items-center justify-center gap-1.5 pt-1 font-mono text-xs sm:ml-1 sm:justify-start sm:pt-0"
              style={{ color: 'var(--text-muted)' }}
            >
              <MapPin
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.75}
                style={{ color: 'var(--gold)' }}
              />
              {profile.shortLocation}
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Frosted Glass Architectural Portrait Frame */}
        <div className="mx-auto w-full max-w-[320px] sm:max-w-sm lg:col-span-5 lg:max-w-none">
          <GlassCard className="relative p-2.5 !transition-none sm:p-3.5">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              {!imgError ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name}, ${profile.credentials} — ${profile.company}`}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center p-6 text-center"
                  style={{ backgroundColor: 'var(--chip-bg)' }}
                >
                  <span
                    className="font-display text-4xl font-semibold tracking-tight"
                    style={{ color: 'var(--accent)' }}
                  >
                    MT
                  </span>
                  <span
                    className="mt-2 font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {profile.name}, {profile.credentials}
                  </span>
                </div>
              )}

              {/* Floating Frosted Glass Nameplate Overlay with UMT Seal */}
              <div className="glass-strong absolute right-2.5 bottom-2.5 left-2.5 rounded-xl px-3.5 py-2.5 sm:right-3 sm:bottom-3 sm:left-3 sm:px-4 sm:py-3">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p
                      className="font-display truncate text-sm font-semibold tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.name}{' '}
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: 'var(--gold)' }}
                      >
                        {profile.credentials}
                      </span>
                    </p>
                    <p
                      className="mt-0.5 truncate font-mono text-[10px] sm:text-[11px]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      B.E. (Civil) YTU • Lead, {profile.company}
                    </p>
                  </div>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/95 p-1 shadow-xs ring-1 ring-slate-900/10 sm:h-9 sm:w-9"
                    title={profile.company}
                  >
                    <img
                      src={profile.companyLogo}
                      alt={profile.company}
                      className="h-full w-full object-contain"
                    />
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Frosted Glass Engineering Impact Strip */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4">
        {metrics.map((metric, idx) => (
          <GlassCard key={metric.label} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                0{idx + 1} / RECORD
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--gold-dot)' }}
              />
            </div>
            <p
              className="mt-2 font-display text-xl font-semibold tracking-tight sm:mt-2.5 sm:text-2xl lg:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {metric.value}
            </p>
            <p
              className="mt-1 text-xs font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {metric.label}
            </p>
            <p
              className="mt-0.5 font-mono text-[10px] sm:text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {metric.detail}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

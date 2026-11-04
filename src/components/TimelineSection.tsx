import { Award, Briefcase } from 'lucide-react';
import type { CredentialItem, ExperienceItem } from '../types/portfolio';
import { GlassCard } from './ui/GlassCard';

interface TimelineSectionProps {
  experience: ExperienceItem[];
  credentials: CredentialItem[];
}

export function TimelineSection({
  experience,
  credentials,
}: TimelineSectionProps) {
  return (
    <section
      id="experience"
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="border-b pb-6 sm:pb-8"
        style={{ borderColor: 'var(--glass-border-outer)' }}
      >
        <p
          className="font-mono text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--gold)' }}
        >
          03 // Career Datum & Licensure
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Practice History & Credentials
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 lg:grid-cols-12">
        {/* Left 7 Cols: Elevation Datum Experience Timeline */}
        <div className="lg:col-span-7">
          <div
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            <Briefcase
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: 'var(--gold)' }}
            />
            <span>Engineering Practice</span>
          </div>

          <div
            className="relative ml-1 space-y-4 border-l pl-4 sm:ml-0 sm:space-y-5 sm:pl-6"
            style={{ borderColor: 'var(--glass-border-outer)' }}
          >
            {experience.map((item) => (
              <div key={item.period} className="relative">
                {/* Datum Marker Dot */}
                <span
                  className="absolute top-5 -left-[21px] h-2.5 w-2.5 rounded-full sm:top-6 sm:-left-[29px]"
                  style={{
                    backgroundColor: 'var(--gold-dot)',
                    boxShadow: '0 0 0 4px var(--bg-canvas)',
                  }}
                />

                <GlassCard className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <span
                      className="font-medium"
                      style={{ color: 'var(--gold)' }}
                    >
                      {item.period}
                    </span>
                    <span className="tech-chip rounded px-2 py-0.5 text-[10px]">
                      {item.elevation}
                    </span>
                  </div>

                  <h3
                    className="mt-2 text-base font-semibold sm:text-lg"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.role}
                  </h3>
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.organization} • {item.location}
                  </p>

                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {item.summary}
                  </p>

                  <ul className="mt-3 space-y-1.5">
                    {item.highlights.map((hl) => (
                      <li
                        key={hl}
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        — {hl}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Licensure, Degrees & Certifications (2-col on tablet, 1-col on lg) */}
        <div className="lg:col-span-5">
          <div
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            <Award
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: 'var(--gold)' }}
            />
            <span>Licensure & Academic Record</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
            {credentials.map((cred) => (
              <GlassCard key={cred.code} className="p-4 sm:p-5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span
                    className="font-medium"
                    style={{ color: 'var(--gold)' }}
                  >
                    {cred.code}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{cred.year}</span>
                </div>
                <h3
                  className="mt-1.5 text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cred.title}
                </h3>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {cred.issuer}
                </p>
                <p
                  className="mt-2 font-mono text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {cred.status}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

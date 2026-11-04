import { Building2, Cpu, Scale } from 'lucide-react';
import type { CompetencyGroup } from '../types/portfolio';
import { GlassCard } from './ui/GlassCard';

interface ExpertiseBentoProps {
  competencies: CompetencyGroup[];
}

const groupIcons = {
  disciplines: Building2,
  software: Cpu,
  standards: Scale,
} as const;

export function ExpertiseBento({ competencies }: ExpertiseBentoProps) {
  return (
    <section
      id="expertise"
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
          02 // Technical Capabilities
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Disciplines, BIM Stack & Design Codes
        </h2>
      </div>

      {/* 1 col mobile -> 2 col tablet (3rd spans 2 cols cleanly) -> 3 col desktop */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {competencies.map((group, index) => {
          const IconComponent =
            groupIcons[group.id as keyof typeof groupIcons] ?? Building2;
          const isLastOddItem =
            index === competencies.length - 1 && competencies.length % 2 === 1;

          return (
            <GlassCard
              key={group.id}
              className={`flex flex-col p-5 sm:p-6 ${
                isLastOddItem ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[11px] tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {group.code}
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'var(--gold-soft)',
                    border: '1px solid var(--gold-border)',
                    color: 'var(--gold)',
                  }}
                >
                  <IconComponent className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>

              <h3
                className="mt-4 text-lg font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {group.title}
              </h3>
              <p
                className="mt-1 font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.subtitle}
              </p>

              <ul
                className={`mt-5 border-t pt-5 ${
                  isLastOddItem
                    ? 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1'
                    : 'space-y-2.5'
                }`}
                style={{ borderColor: 'var(--glass-border-outer)' }}
              >
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-snug"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: 'var(--gold-dot)' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

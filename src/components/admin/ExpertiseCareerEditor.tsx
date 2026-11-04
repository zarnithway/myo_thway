import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type {
  CompetencyGroup,
  CredentialItem,
  ExperienceItem,
} from '../../types/portfolio';
import { GlassCard } from '../ui/GlassCard';

interface ExpertiseCareerEditorProps {
  competencies: CompetencyGroup[];
  experience: ExperienceItem[];
  credentials: CredentialItem[];
  onChangeCompetencies: (next: CompetencyGroup[]) => void;
  onChangeExperience: (next: ExperienceItem[]) => void;
  onChangeCredentials: (next: CredentialItem[]) => void;
}

export function ExpertiseCareerEditor({
  competencies,
  experience,
  credentials,
  onChangeCompetencies,
  onChangeExperience,
  onChangeCredentials,
}: ExpertiseCareerEditorProps) {
  // Competency helpers
  const addCompetency = () => {
    const num = String(competencies.length + 1).padStart(2, '0');
    onChangeCompetencies([
      ...competencies,
      {
        id: `comp-${Date.now()}`,
        code: `CAP-${num}`,
        title: 'New Engineering Discipline',
        subtitle: 'Core Tools & Standards',
        items: ['ACI 318', 'MNBC 2020'],
      },
    ]);
  };

  const moveItem = <T,>(
    list: T[],
    idx: number,
    dir: -1 | 1,
    cb: (next: T[]) => void
  ) => {
    const dest = idx + dir;
    if (dest < 0 || dest >= list.length) return;
    const next = [...list];
    const [moved] = next.splice(idx, 1);
    next.splice(dest, 0, moved);
    cb(next);
  };

  // Experience helpers
  const addExperience = () => {
    onChangeExperience([
      {
        period: '2024 — Present',
        elevation: 'EL +12.0m',
        role: 'Lead Structural & Civil Engineer',
        organization: 'UMT Construction Group',
        location: 'Mandalay, Myanmar',
        summary: 'Leading residential structural engineering and turnkey execution.',
        highlights: [
          'Directed structural calculation sign-offs and site QA inspections.',
        ],
      },
      ...experience,
    ]);
  };

  // Credential helpers
  const addCredential = () => {
    const num = String(credentials.length + 1).padStart(2, '0');
    onChangeCredentials([
      ...credentials,
      {
        code: `CRED-${num}`,
        title: 'Professional Engineering Qualification',
        issuer: 'Issuing Institution',
        year: 'Verified',
        status: 'Active',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Section 02: Expertise Bento Cards */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              02 // Expertise Bento Matrix ({competencies.length} Groups)
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Engineering Capabilities, Codes & Software
            </h2>
          </div>

          <button
            type="button"
            onClick={addCompetency}
            className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Discipline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {competencies.map((comp, idx) => (
            <div
              key={comp.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: 'var(--glass-border-outer)',
                backgroundColor: 'var(--chip-bg)',
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={comp.code}
                  onChange={(e) =>
                    onChangeCompetencies(
                      competencies.map((c, i) =>
                        i === idx ? { ...c, code: e.target.value } : c
                      )
                    )
                  }
                  className="tech-chip input-focus w-28 rounded-lg px-2.5 py-1 font-mono text-xs outline-none"
                  style={{ color: 'var(--gold)' }}
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(competencies, idx, -1, onChangeCompetencies)
                    }
                    disabled={idx === 0}
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(competencies, idx, 1, onChangeCompetencies)
                    }
                    disabled={idx === competencies.length - 1}
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCompetencies(
                        competencies.filter((_, i) => i !== idx)
                      )
                    }
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={comp.title}
                  onChange={(e) =>
                    onChangeCompetencies(
                      competencies.map((c, i) =>
                        i === idx ? { ...c, title: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Discipline Title"
                  className="tech-chip input-focus w-full rounded-lg px-3 py-1.5 text-sm font-semibold outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={comp.subtitle}
                  onChange={(e) =>
                    onChangeCompetencies(
                      competencies.map((c, i) =>
                        i === idx ? { ...c, subtitle: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Subtitle"
                  className="tech-chip input-focus w-full rounded-lg px-3 py-1.5 font-mono text-xs outline-none"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <div>
                  <label className="block font-mono text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Capability Chips (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={comp.items.join(', ')}
                    onChange={(e) =>
                      onChangeCompetencies(
                        competencies.map((c, i) =>
                          i === idx
                            ? {
                                ...c,
                                items: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : c
                        )
                      )
                    }
                    className="tech-chip input-focus mt-1 w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Section 03: Experience Timeline */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              03-A // Leadership & Career Timeline ({experience.length} Roles)
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Practice History
            </h2>
          </div>

          <button
            type="button"
            onClick={addExperience}
            className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Role</span>
          </button>
        </div>

        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                borderColor: 'var(--glass-border-outer)',
                backgroundColor: 'var(--chip-bg)',
              }}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                  ROLE #{idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(experience, idx, -1, onChangeExperience)
                    }
                    disabled={idx === 0}
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(experience, idx, 1, onChangeExperience)
                    }
                    disabled={idx === experience.length - 1}
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeExperience(experience.filter((_, i) => i !== idx))
                    }
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx ? { ...item, period: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Period (e.g. Present)"
                  className="tech-chip input-focus rounded-lg px-3 py-1.5 font-mono text-xs outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={exp.elevation}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx ? { ...item, elevation: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Datum (e.g. EL +18.0m)"
                  className="tech-chip input-focus rounded-lg px-3 py-1.5 font-mono text-xs outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx ? { ...item, location: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Location"
                  className="tech-chip input-focus rounded-lg px-3 py-1.5 text-xs outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx ? { ...item, role: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Role Title"
                  className="tech-chip input-focus rounded-lg px-3 py-1.5 text-sm font-semibold outline-none sm:col-span-2"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={exp.organization}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx
                          ? { ...item, organization: e.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Organization / Firm"
                  className="tech-chip input-focus rounded-lg px-3 py-1.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <textarea
                rows={2}
                value={exp.summary}
                onChange={(e) =>
                  onChangeExperience(
                    experience.map((item, i) =>
                      i === idx ? { ...item, summary: e.target.value } : item
                    )
                  )
                }
                placeholder="Role summary..."
                className="tech-chip input-focus mt-3 w-full rounded-lg px-3 py-2 text-xs outline-none"
                style={{ color: 'var(--text-primary)' }}
              />

              <div className="mt-2.5">
                <label className="block font-mono text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Key Achievements (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  value={exp.highlights.join('\n')}
                  onChange={(e) =>
                    onChangeExperience(
                      experience.map((item, i) =>
                        i === idx
                          ? {
                              ...item,
                              highlights: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            }
                          : item
                      )
                    )
                  }
                  className="tech-chip input-focus mt-1 w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Licensure & Academic Credentials */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              03-B // Licensure & Education ({credentials.length} Records)
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              R.S.E. Registration & University Degrees
            </h2>
          </div>

          <button
            type="button"
            onClick={addCredential}
            className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Credential</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-4"
              style={{
                borderColor: 'var(--glass-border-outer)',
                backgroundColor: 'var(--chip-bg)',
              }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <input
                  type="text"
                  value={cred.code}
                  onChange={(e) =>
                    onChangeCredentials(
                      credentials.map((c, i) =>
                        i === idx ? { ...c, code: e.target.value } : c
                      )
                    )
                  }
                  className="tech-chip input-focus w-24 rounded-lg px-2 py-1 font-mono text-[11px] outline-none"
                  style={{ color: 'var(--gold)' }}
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(credentials, idx, -1, onChangeCredentials)
                    }
                    disabled={idx === 0}
                    className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      moveItem(credentials, idx, 1, onChangeCredentials)
                    }
                    disabled={idx === credentials.length - 1}
                    className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCredentials(
                        credentials.filter((_, i) => i !== idx)
                      )
                    }
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={cred.title}
                  onChange={(e) =>
                    onChangeCredentials(
                      credentials.map((c, i) =>
                        i === idx ? { ...c, title: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Degree / License Title"
                  className="tech-chip input-focus w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={cred.issuer}
                  onChange={(e) =>
                    onChangeCredentials(
                      credentials.map((c, i) =>
                        i === idx ? { ...c, issuer: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Issuing University / Council"
                  className="tech-chip input-focus w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cred.year}
                    onChange={(e) =>
                      onChangeCredentials(
                        credentials.map((c, i) =>
                          i === idx ? { ...c, year: e.target.value } : c
                        )
                      )
                    }
                    placeholder="Year / Standing"
                    className="tech-chip input-focus rounded-lg px-2.5 py-1 font-mono text-[11px] outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <input
                    type="text"
                    value={cred.status}
                    onChange={(e) =>
                      onChangeCredentials(
                        credentials.map((c, i) =>
                          i === idx ? { ...c, status: e.target.value } : c
                        )
                      )
                    }
                    placeholder="Status"
                    className="tech-chip input-focus rounded-lg px-2.5 py-1 font-mono text-[11px] outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

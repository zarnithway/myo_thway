import { useState, type ChangeEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  FileText,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { uploadMediaFile } from '../../lib/cmsService';
import type { ImpactMetric, PortfolioData } from '../../types/portfolio';
import { GlassCard } from '../ui/GlassCard';

interface ProfileMetricsEditorProps {
  profile: PortfolioData['profile'];
  metrics: ImpactMetric[];
  onChangeProfile: (next: PortfolioData['profile']) => void;
  onChangeMetrics: (next: ImpactMetric[]) => void;
  onNotify: (message: string, tone?: 'success' | 'error') => void;
}

export function ProfileMetricsEditor({
  profile,
  metrics,
  onChangeProfile,
  onChangeMetrics,
  onNotify,
}: ProfileMetricsEditorProps) {
  const [uploadingField, setUploadingField] = useState<
    'avatar' | 'logo' | 'resume' | null
  >(null);

  const updateField = <K extends keyof PortfolioData['profile']>(
    key: K,
    value: PortfolioData['profile'][K]
  ) => {
    onChangeProfile({ ...profile, [key]: value });
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'logo' | 'resume'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingField(target);
    try {
      const folder = target === 'resume' ? 'documents' : 'profile';
      const url = await uploadMediaFile(file, folder);
      if (target === 'avatar') {
        updateField('avatar', url);
        onNotify('Hero portrait uploaded. Click "Save & Publish" to persist.');
      } else if (target === 'logo') {
        updateField('companyLogo', url);
        onNotify('Company seal uploaded. Click "Save & Publish" to persist.');
      } else {
        updateField('resumeUrl', url);
        onNotify('CV / Profile file uploaded. Click "Save & Publish" to persist.');
      }
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'File upload failed.',
        'error'
      );
    } finally {
      setUploadingField(null);
    }
  };

  const updateMetric = (
    index: number,
    key: keyof ImpactMetric,
    value: string
  ) => {
    const next = metrics.map((m, idx) =>
      idx === index ? { ...m, [key]: value } : m
    );
    onChangeMetrics(next);
  };

  const moveMetric = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= metrics.length) return;
    const next = [...metrics];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChangeMetrics(next);
  };

  const removeMetric = (index: number) => {
    onChangeMetrics(metrics.filter((_, idx) => idx !== index));
  };

  const addMetric = () => {
    onChangeMetrics([
      ...metrics,
      {
        value: 'New KPI',
        label: 'Metric Title',
        detail: 'Supporting Detail',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Media & Brand Assets */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div className="mb-5 border-b pb-4" style={{ borderColor: 'var(--glass-border-outer)' }}>
          <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
            00-A // Media & Official Documents
          </p>
          <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Hero Portrait, Brand Seal & Downloadable CV
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Hero Portrait */}
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--glass-border-outer)',
              backgroundColor: 'var(--chip-bg)',
            }}
          >
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Hero Portrait Photo (4:5)
            </p>
            <div className="mt-3 flex items-start gap-4">
              <div
                className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl border bg-slate-200"
                style={{ borderColor: 'var(--glass-border-outer)' }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover object-[48%_top]"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                <label
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--solid-bg)',
                    color: 'var(--solid-fg)',
                  }}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span>
                    {uploadingField === 'avatar' ? 'Uploading...' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField !== null}
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={profile.avatar}
                  onChange={(e) => updateField('avatar', e.target.value)}
                  placeholder="/images/profile-myo-thway.png"
                  className="tech-chip input-focus w-full rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Company Seal */}
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--glass-border-outer)',
              backgroundColor: 'var(--chip-bg)',
            }}
          >
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              UMT Company Logo / Seal
            </p>
            <div className="mt-3 flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-xs ring-1 ring-slate-900/10">
                <img
                  src={profile.companyLogo}
                  alt={profile.company}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                <label
                  className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-85"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>
                    {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField !== null}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={profile.companyLogo}
                  onChange={(e) => updateField('companyLogo', e.target.value)}
                  placeholder="/images/umt-logo-mark.png"
                  className="tech-chip input-focus w-full rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Downloadable PDF CV */}
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--glass-border-outer)',
              backgroundColor: 'var(--chip-bg)',
            }}
          >
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Official CV / Profile PDF
            </p>
            <div className="mt-3 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-85"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileText className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
                  <span>
                    {uploadingField === 'resume' ? 'Uploading...' : 'Upload PDF CV'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    disabled={uploadingField !== null}
                    onChange={(e) => handleFileUpload(e, 'resume')}
                    className="hidden"
                  />
                </label>

                {profile.resumeUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('resumeUrl', '')}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 font-mono text-[11px] text-red-500 hover:bg-red-500/10"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <input
                type="text"
                value={profile.resumeUrl ?? ''}
                onChange={(e) => updateField('resumeUrl', e.target.value)}
                placeholder="Optional PDF URL (auto-generates CV if empty)"
                className="tech-chip input-focus w-full rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {profile.resumeUrl
                  ? 'Custom CV file active on Download buttons.'
                  : 'Currently auto-generating formatted executive CV from your data.'}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Executive Identity & Contact Details */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div className="mb-5 border-b pb-4" style={{ borderColor: 'var(--glass-border-outer)' }}>
          <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
            00-B // Executive Identity & Contact Details
          </p>
          <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Hero Copy, Credentials & Communication Channels
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Navbar Brand Label
            </label>
            <input
              type="text"
              value={profile.shortName}
              onChange={(e) => updateField('shortName', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Post-Nominal Credentials
            </label>
            <input
              type="text"
              value={profile.credentials}
              onChange={(e) => updateField('credentials', e.target.value)}
              placeholder="R.S.E."
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Professional Role Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Company / Firm Name
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              License & Degree Summary
            </label>
            <input
              type="text"
              value={profile.licenseNumber}
              onChange={(e) => updateField('licenseNumber', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Phone Number
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Professional / Social Link
            </label>
            <input
              type="url"
              value={profile.linkedin}
              onChange={(e) => updateField('linkedin', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Short Location (Hero & Mobile Nav)
            </label>
            <input
              type="text"
              value={profile.shortLocation}
              onChange={(e) => updateField('shortLocation', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Full Office / Footer Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Hero Headline / Tagline
            </label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Executive Summary Bio
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm leading-relaxed outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Hero Impact Metrics Strip */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              00-C // Hero Impact Strip ({metrics.length} Cards)
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Key Engineering Metrics
            </h2>
          </div>

          <button
            type="button"
            onClick={addMetric}
            className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Metric</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-4"
              style={{
                borderColor: 'var(--glass-border-outer)',
                backgroundColor: 'var(--chip-bg)',
              }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[11px]" style={{ color: 'var(--gold)' }}>
                  KPI #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveMetric(idx, -1)}
                    disabled={idx === 0}
                    title="Move earlier"
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMetric(idx, 1)}
                    disabled={idx === metrics.length - 1}
                    title="Move later"
                    className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMetric(idx)}
                    title="Delete metric"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. R.S.E. or 100%)"
                  className="tech-chip input-focus w-full rounded-lg px-3 py-1.5 font-display text-sm font-semibold outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Certified Senior Engineer)"
                  className="tech-chip input-focus w-full rounded-lg px-3 py-1.5 text-xs font-medium outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  value={metric.detail}
                  onChange={(e) => updateMetric(idx, 'detail', e.target.value)}
                  placeholder="Detail (e.g. Myanmar Engineering Council)"
                  className="tech-chip input-focus w-full rounded-lg px-3 py-1.5 font-mono text-[11px] outline-none"
                  style={{ color: 'var(--text-secondary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

import { useState, type ChangeEvent } from 'react';
import {
  Check,
  CloudUpload,
  Copy,
  Database,
  Download,
  RotateCcw,
  Upload,
} from 'lucide-react';
import {
  normalizePortfolioData,
  resetLocalPreviewToDefault,
  seedPortfolioToSupabase,
} from '../../lib/cmsService';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { PortfolioData } from '../../types/portfolio';
import { GlassCard } from '../ui/GlassCard';
import schemaSqlRaw from '../../../supabase/schema.sql?raw';

interface SupabaseSetupPanelProps {
  draftData: PortfolioData;
  onReplaceDraftAndLive: (next: PortfolioData) => void;
  onNotify: (message: string, tone?: 'success' | 'error') => void;
}

export function SupabaseSetupPanel({
  draftData,
  onReplaceDraftAndLive,
  onNotify,
}: SupabaseSetupPanelProps) {
  const [seeding, setSeeding] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSeedToSupabase = async () => {
    setSeeding(true);
    try {
      const seeded = await seedPortfolioToSupabase(draftData);
      onReplaceDraftAndLive(seeded);
      onNotify(
        'Successfully seeded current portfolio data into Supabase site_content!'
      );
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'Supabase seed failed.',
        'error'
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(draftData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umt-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported portfolio JSON backup.');
  };

  const handleImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = normalizePortfolioData(JSON.parse(text));
      onReplaceDraftAndLive(parsed);
      onNotify(
        'Imported JSON into editor. Click "Save & Publish" to persist.'
      );
    } catch {
      onNotify('Invalid portfolio JSON backup file.', 'error');
    }
  };

  const handleResetLocal = () => {
    if (
      !window.confirm(
        'Reset local browser preview data back to factory default UMT portfolio data?'
      )
    ) {
      return;
    }
    const fresh = resetLocalPreviewToDefault();
    onReplaceDraftAndLive(fresh);
    onNotify('Reset local preview to default UMT portfolio data.');
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(schemaSqlRaw);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2200);
      onNotify('Copied supabase/schema.sql to clipboard.');
    } catch {
      onNotify('Could not copy SQL automatically.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud Sync, Seed & Backup Controls */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              05-A // Database Sync & Backups
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Supabase Cloud Seed & JSON Snapshot Tools
            </h2>
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px]"
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
            <Database className="h-3.5 w-3.5" />
            <span>
              {isSupabaseConfigured ? 'SUPABASE CONNECTED' : 'LOCAL PREVIEW MODE'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* One-Click Seed to Supabase */}
          <div
            className="rounded-2xl border p-4 sm:p-5"
            style={{
              borderColor: 'var(--glass-border-outer)',
              backgroundColor: 'var(--chip-bg)',
            }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              One-Click Seed Initial / Current Data to Supabase
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Pushes all current profile fields, metrics, 8 residential
              projects, gallery images, expertise, and timeline entries into
              your Supabase <code>site_content</code> table.
            </p>

            <button
              type="button"
              disabled={!isSupabaseConfigured || seeding}
              onClick={handleSeedToSupabase}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                backgroundColor: 'var(--solid-bg)',
                color: 'var(--solid-fg)',
              }}
            >
              <CloudUpload className="h-4 w-4" />
              <span>
                {seeding
                  ? 'Seeding to Supabase...'
                  : isSupabaseConfigured
                    ? 'Seed Current Data to Supabase'
                    : 'Add .env Keys First to Seed'}
              </span>
            </button>
          </div>

          {/* Export / Import / Reset */}
          <div
            className="rounded-2xl border p-4 sm:p-5"
            style={{
              borderColor: 'var(--glass-border-outer)',
              backgroundColor: 'var(--chip-bg)',
            }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Portable JSON Backup & Factory Reset
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Download a full JSON snapshot of all portfolio content at any
              time, restore from a backup file, or reset local preview edits.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>

              <label
                className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              {!isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={handleResetLocal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[11px] text-red-500 hover:bg-red-500/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Step-by-Step Supabase Connection Guide + Copyable SQL */}
      <GlassCard className="p-5 sm:p-7 !transition-none">
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--glass-border-outer)' }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
              05-B // 3-Step Supabase Cloud Setup
            </p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              SQL Schema & Row-Level Security (`supabase/schema.sql`)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--solid-bg)',
              color: 'var(--solid-fg)',
            }}
          >
            {copiedSql ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied SQL!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Full SQL Schema</span>
              </>
            )}
          </button>
        </div>

        <ol
          className="mb-4 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <li>
            Create a free project at <strong>supabase.com</strong>, open{' '}
            <strong>SQL Editor</strong>, paste the SQL below, and click{' '}
            <strong>Run</strong>.
          </li>
          <li>
            In Supabase <strong>Authentication → Users → Add User</strong>,
            create your admin email & password.
          </li>
          <li>
            Copy <code>.env.example</code> to <code>.env</code>, set{' '}
            <code>VITE_SUPABASE_URL</code>,{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, and your private{' '}
            <code>ADMIN_SECRET_SLUG</code>, then sign in and click{' '}
            <strong>Seed Current Data to Supabase</strong> above.
          </li>
        </ol>

        <pre
          className="max-h-72 overflow-auto rounded-xl border p-4 font-mono text-[11px] leading-relaxed"
          style={{
            borderColor: 'var(--glass-border-outer)',
            backgroundColor: 'var(--chip-bg)',
            color: 'var(--text-primary)',
          }}
        >
          {schemaSqlRaw}
        </pre>
      </GlassCard>
    </div>
  );
}

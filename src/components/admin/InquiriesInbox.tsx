import { useState } from 'react';
import {
  Archive,
  Check,
  CheckCircle2,
  Copy,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  deleteContactInquiry,
  updateContactInquiryStatus,
} from '../../lib/cmsService';
import type { ContactInquiry, InquiryStatus } from '../../types/portfolio';
import { GlassCard } from '../ui/GlassCard';

interface InquiriesInboxProps {
  inquiries: ContactInquiry[];
  loading: boolean;
  onRefresh: () => void;
  onChangeInquiries: (next: ContactInquiry[]) => void;
  onNotify: (message: string, tone?: 'success' | 'error') => void;
}

type FilterOption = 'all' | InquiryStatus;

export function InquiriesInbox({
  inquiries,
  loading,
  onRefresh,
  onChangeInquiries,
  onNotify,
}: InquiriesInboxProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered =
    filter === 'all'
      ? inquiries
      : inquiries.filter((inq) => inq.status === filter);

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    try {
      await updateContactInquiryStatus(id, status);
      onChangeInquiries(
        inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      onNotify(`Marked inquiry as ${status}.`);
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'Failed to update inquiry.',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this consultation inquiry permanently?')) return;
    try {
      await deleteContactInquiry(id);
      onChangeInquiries(inquiries.filter((inq) => inq.id !== id));
      onNotify('Inquiry deleted.');
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'Failed to delete inquiry.',
        'error'
      );
    }
  };

  const handleCopyContact = async (id: string, contact: string) => {
    try {
      await navigator.clipboard.writeText(contact);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <GlassCard className="p-5 sm:p-7 !transition-none">
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
        style={{ borderColor: 'var(--glass-border-outer)' }}
      >
        <div>
          <p className="font-mono text-[11px] uppercase" style={{ color: 'var(--gold)' }}>
            04 // Client Consultation Inbox ({inquiries.length} Total)
          </p>
          <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Home Construction & Structural Briefs
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'new', 'reviewed', 'archived'] as const).map((opt) => {
            const active = filter === opt;
            const count =
              opt === 'all'
                ? inquiries.length
                : inquiries.filter((i) => i.status === opt).length;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase transition-colors"
                style={{
                  backgroundColor: active ? 'var(--solid-bg)' : 'var(--chip-bg)',
                  color: active ? 'var(--solid-fg)' : 'var(--text-secondary)',
                }}
              >
                {opt} ({count})
              </button>
            );
          })}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px]"
            style={{ color: 'var(--text-primary)' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Inbox className="h-9 w-9 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            No consultation inquiries in this view
          </p>
          <p className="mt-1 max-w-md text-xs" style={{ color: 'var(--text-muted)' }}>
            When homeowners submit the project brief form on your public
            portfolio, their requests appear right here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((item) => {
            const isEmail = item.contact.includes('@');
            return (
              <div
                key={item.id}
                className="rounded-2xl border p-4 sm:p-5"
                style={{
                  borderColor:
                    item.status === 'new'
                      ? 'var(--gold-border)'
                      : 'var(--glass-border-outer)',
                  backgroundColor: 'var(--chip-bg)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.name}
                      </h3>
                      <span
                        className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase"
                        style={{
                          backgroundColor:
                            item.status === 'new'
                              ? 'var(--gold-soft)'
                              : 'var(--accent-soft)',
                          color:
                            item.status === 'new'
                              ? 'var(--gold)'
                              : 'var(--accent)',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-xs">
                      <a
                        href={
                          isEmail
                            ? `mailto:${item.contact}`
                            : `tel:${item.contact.replace(/\s+/g, '')}`
                        }
                        className="inline-flex items-center gap-1.5 underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        {isEmail ? (
                          <Mail className="h-3.5 w-3.5" />
                        ) : (
                          <Phone className="h-3.5 w-3.5" />
                        )}
                        <span>{item.contact}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyContact(item.id, item.contact)}
                        className="inline-flex cursor-pointer items-center gap-1 text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        • {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.status !== 'reviewed' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'reviewed')}
                        className="tech-chip inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-[11px]"
                        style={{ color: 'var(--accent)' }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Reviewed</span>
                      </button>
                    )}

                    {item.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'archived')}
                        className="tech-chip inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-[11px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p
                  className="mt-3 rounded-xl border p-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    borderColor: 'var(--glass-border-outer)',
                    backgroundColor: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

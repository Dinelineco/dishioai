'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Send, User, Calendar, Zap, ExternalLink,
  RefreshCw, Loader2, TriangleAlert
} from 'lucide-react';

interface CallDraft {
  id: string;
  created_at: string;
  email_id: string;
  client_id: string | null;
  client_code: string | null;
  client_name_raw: string | null;
  client_name_matched: string | null;
  am_name: string | null;
  call_date: string;
  email_subject: string | null;
  email_body: string | null;
  next_steps: string[];
  blockers: string[];
  key_points: string[];
  deadlines: string | null;
  urgency: string;
  clickup_title: string;
  clickup_description: string;
  status: 'pending_review' | 'submitted' | 'rejected';
  clickup_task_id: string | null;
  match_score?: number;
}

const URGENCY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  immediate: { label: 'Immediate', color: 'text-red-400', dot: 'bg-red-500' },
  this_week: { label: 'This Week', color: 'text-dishio-yellow', dot: 'bg-dishio-yellow' },
  next_sprint: { label: 'Next Sprint', color: 'text-blue-400', dot: 'bg-blue-500' },
  no_rush: { label: 'No Rush', color: 'text-neutral-500', dot: 'bg-neutral-600' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending_review: { label: 'Pending Review', icon: <Clock className="w-3 h-3" />, color: 'text-dishio-yellow bg-dishio-yellow/10' },
  submitted: { label: 'Submitted', icon: <CheckCircle className="w-3 h-3" />, color: 'text-emerald-400 bg-emerald-400/10' },
  rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />, color: 'text-red-400 bg-red-400/10' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const cfg = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.this_week;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function CallReviewsView() {
  const [drafts, setDrafts] = useState<CallDraft[]>([]);
  const [selected, setSelected] = useState<CallDraft | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ url?: string; error?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'recap' | 'draft'>('recap');

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/call-drafts');
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const selectDraft = (draft: CallDraft) => {
    setSelected(draft);
    setEditTitle(draft.clickup_title || '');
    setEditDesc(draft.clickup_description || '');
    setSubmitResult(null);
    setActiveTab('recap');
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch(`/api/call-drafts/${selected.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickup_title: editTitle, clickup_description: editDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult({ url: data.clickup_url });
        setDrafts(prev => prev.map(d => d.id === selected.id ? { ...d, status: 'submitted', clickup_task_id: data.clickup_task_id } : d));
        setSelected(prev => prev ? { ...prev, status: 'submitted' } : null);
      } else {
        setSubmitResult({ error: data.error || 'Submission failed' });
      }
    } catch (e) {
      setSubmitResult({ error: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const pending = drafts.filter(d => d.status === 'pending_review');
  const submitted = drafts.filter(d => d.status === 'submitted');

  const clientName = (d: CallDraft) => d.client_name_matched || d.client_name_raw || 'Unknown Client';

  return (
    <div className="flex h-full bg-[#050505]">
      {/* Left sidebar — draft list */}
      <div className="w-72 flex-shrink-0 border-r border-neutral-800/60 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-800/60 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-200">Call Reviews</p>
            <p className="text-xs text-neutral-600 mt-0.5">{pending.length} pending review</p>
          </div>
          <button
            onClick={fetchDrafts}
            className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:border-neutral-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <PhoneCall className="w-4 h-4 text-neutral-600" />
              </div>
              <p className="text-xs text-neutral-600">No call drafts yet.<br />Activate the n8n pipeline to start.</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">Pending</p>
                  {pending.map(draft => (
                    <DraftListItem
                      key={draft.id}
                      draft={draft}
                      isSelected={selected?.id === draft.id}
                      onClick={() => selectDraft(draft)}
                      clientName={clientName(draft)}
                    />
                  ))}
                </div>
              )}
              {submitted.length > 0 && (
                <div className="mt-2">
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">Submitted</p>
                  {submitted.map(draft => (
                    <DraftListItem
                      key={draft.id}
                      draft={draft}
                      isSelected={selected?.id === draft.id}
                      onClick={() => selectDraft(draft)}
                      clientName={clientName(draft)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <PhoneCall className="w-7 h-7 text-neutral-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-neutral-300 mb-1">Select a Call Draft</p>
                <p className="text-sm text-neutral-600 max-w-xs leading-relaxed">
                  Review AI-generated ClickUp tasks from Loom call recaps before submitting to the Media Buying board.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dishio-yellow/10 border border-dishio-yellow/20 flex items-center justify-center">
                    <PhoneCall className="w-3.5 h-3.5 text-dishio-yellow" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-200">{clientName(selected)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-neutral-500">{selected.am_name}</span>
                      <span className="text-neutral-700">·</span>
                      <span className="text-[11px] text-neutral-500">{formatDate(selected.call_date)}</span>
                      <span className="text-neutral-700">·</span>
                      <UrgencyBadge urgency={selected.urgency} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.status === 'pending_review' && (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-dishio-yellow text-black text-xs font-bold hover:bg-dishio-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-4px_rgba(255,217,0,0.4)]"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit to ClickUp
                    </button>
                  )}
                  {selected.status === 'submitted' && selected.clickup_task_id && (
                    <a
                      href={submitResult?.url || `https://app.clickup.com/t/${selected.clickup_task_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View in ClickUp
                    </a>
                  )}
                </div>
              </div>

              {/* Submit result banner */}
              <AnimatePresence>
                {submitResult && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex-shrink-0"
                  >
                    {submitResult.error ? (
                      <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
                        <TriangleAlert className="w-4 h-4 flex-shrink-0" />
                        {submitResult.error}
                      </div>
                    ) : (
                      <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        Task submitted to ClickUp Media Buying board!
                        {submitResult.url && (
                          <a href={submitResult.url} target="_blank" rel="noopener noreferrer" className="ml-1 underline text-emerald-300 hover:text-emerald-200">
                            Open task →
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab bar */}
              <div className="flex gap-0 px-6 pt-4 flex-shrink-0 border-b border-neutral-800/60">
                {(['recap', 'draft'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab ? 'text-neutral-200' : 'text-neutral-600 hover:text-neutral-400'
                    }`}
                  >
                    {tab === 'recap' ? 'Call Recap' : 'ClickUp Draft'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="review-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-dishio-yellow"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'recap' ? (
                    <motion.div
                      key="recap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="p-6 space-y-5"
                    >
                      {/* Subject */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Email Subject</p>
                        <p className="text-sm text-neutral-300">{selected.email_subject || '—'}</p>
                      </div>

                      {/* Meta row */}
                      <div className="flex gap-6">
                        <MetaItem icon={<User className="w-3.5 h-3.5" />} label="Account Manager" value={selected.am_name || '—'} />
                        <MetaItem icon={<Calendar className="w-3.5 h-3.5" />} label="Call Date" value={formatDate(selected.call_date)} />
                        <MetaItem icon={<Zap className="w-3.5 h-3.5" />} label="Urgency" value={<UrgencyBadge urgency={selected.urgency} />} />
                        {selected.match_score !== undefined && selected.match_score < 1 && (
                          <MetaItem
                            icon={<AlertCircle className="w-3.5 h-3.5" />}
                            label="Client Match"
                            value={
                              <span className={`text-[11px] ${selected.match_score >= 0.8 ? 'text-emerald-400' : selected.match_score >= 0.6 ? 'text-dishio-yellow' : 'text-red-400'}`}>
                                {Math.round((selected.match_score || 0) * 100)}% confidence
                              </span>
                            }
                          />
                        )}
                      </div>

                      {/* Extracted data */}
                      {selected.next_steps?.length > 0 && (
                        <ExtractedSection title="Next Steps" items={selected.next_steps} color="text-emerald-400" dotColor="bg-emerald-500" />
                      )}
                      {selected.blockers?.length > 0 && (
                        <ExtractedSection title="Blockers" items={selected.blockers} color="text-red-400" dotColor="bg-red-500" />
                      )}
                      {selected.key_points?.length > 0 && (
                        <ExtractedSection title="Key Points" items={selected.key_points} color="text-blue-400" dotColor="bg-blue-500" />
                      )}
                      {selected.deadlines && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Deadline</p>
                          <p className="text-sm text-dishio-yellow">{selected.deadlines}</p>
                        </div>
                      )}

                      {/* Raw email body */}
                      {selected.email_body && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Full Email</p>
                          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">
                            {selected.email_body}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="draft"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="p-6 space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded bg-[#7B68EE]/20 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-[#7B68EE]">CU</span>
                        </div>
                        <p className="text-xs text-neutral-500">ClickUp · WORK REQUESTS → Media Buying</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-2">Task Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          disabled={selected.status !== 'pending_review'}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-dishio-yellow/50 focus:ring-1 focus:ring-dishio-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          placeholder="Task title..."
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-2">Description</label>
                        <textarea
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          disabled={selected.status !== 'pending_review'}
                          rows={18}
                          className="w-full px-3.5 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-dishio-yellow/50 focus:ring-1 focus:ring-dishio-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-relaxed transition-all font-mono"
                          placeholder="Task description..."
                        />
                      </div>

                      {selected.status === 'pending_review' && (
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || !editTitle.trim()}
                          className="w-full py-2.5 rounded-xl bg-dishio-yellow text-black text-sm font-bold hover:bg-dishio-yellow/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_-6px_rgba(255,217,0,0.5)] flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {submitting ? 'Submitting to ClickUp...' : 'Submit to Media Buying Board'}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DraftListItem({
  draft, isSelected, onClick, clientName
}: {
  draft: CallDraft;
  isSelected: boolean;
  onClick: () => void;
  clientName: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors relative group ${
        isSelected ? 'bg-neutral-900/80' : 'hover:bg-neutral-900/40'
      }`}
    >
      {isSelected && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-dishio-yellow rounded-r" />}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        draft.status === 'submitted' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-neutral-800 border border-neutral-700'
      }`}>
        {draft.status === 'submitted'
          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          : <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-300 truncate">{clientName}</p>
        <p className="text-[10px] text-neutral-600 truncate mt-0.5">{draft.am_name || 'Unknown AM'}</p>
        <div className="mt-1">
          <UrgencyBadge urgency={draft.urgency} />
        </div>
      </div>
      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isSelected ? 'text-neutral-400' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
    </button>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-neutral-600 mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <div className="text-xs text-neutral-300">{value}</div>
    </div>
  );
}

function ExtractedSection({ title, items, color, dotColor }: { title: string; items: string[]; color: string; dotColor: string }) {
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${color}`}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0 mt-1.5`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

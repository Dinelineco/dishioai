'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Loader2, CheckCircle, ExternalLink, TriangleAlert,
  Zap, Monitor, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';

export interface WorkRequestDraft {
  id: string;
  client_name_matched: string | null;
  client_name_raw: string | null;
  platform: string | null;
  specific_request: string | null;
  ai_strategy: string | null;
  clickup_title: string;
  clickup_description: string;
  urgency: string;
  am_name: string | null;
  call_date: string;
  status: 'pending_review' | 'submitted' | 'rejected';
  clickup_task_id: string | null;
  next_steps: string[];
  blockers: string[];
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  google_ads: { label: 'Google Ads', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  meta_ads:   { label: 'Meta Ads',   color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  both:       { label: 'Google + Meta', color: 'text-dishio-yellow', bg: 'bg-dishio-yellow/10', border: 'border-dishio-yellow/20' },
};

const URGENCY_CONFIG: Record<string, { label: string; dot: string; color: string }> = {
  immediate:   { label: 'Immediate',   dot: 'bg-red-500',          color: 'text-red-400' },
  this_week:   { label: 'This Week',   dot: 'bg-dishio-yellow',    color: 'text-dishio-yellow' },
  next_sprint: { label: 'Next Sprint', dot: 'bg-blue-500',         color: 'text-blue-400' },
  no_rush:     { label: 'No Rush',     dot: 'bg-neutral-600',      color: 'text-neutral-500' },
};

interface WorkRequestCardProps {
  draft: WorkRequestDraft;
  onSubmitted?: (draftId: string, clickupUrl?: string) => void;
}

export function WorkRequestCard({ draft, onSubmitted }: WorkRequestCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const platform = PLATFORM_CONFIG[draft.platform || 'google_ads'] || PLATFORM_CONFIG.google_ads;
  const urgency = URGENCY_CONFIG[draft.urgency] || URGENCY_CONFIG.this_week;
  const clientName = draft.client_name_matched || draft.client_name_raw || 'Unknown Client';

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/call-drafts/${draft.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickup_title: draft.clickup_title, clickup_description: draft.clickup_description }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ url: data.clickup_url });
        onSubmitted?.(draft.id, data.clickup_url);
      } else {
        setResult({ error: data.error || 'Submission failed' });
      }
    } catch {
      setResult({ error: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = draft.status === 'submitted' || !!result?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden w-full max-w-lg"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-800/60 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${platform.color} ${platform.bg} ${platform.border}`}>
              <Monitor className="w-3 h-3" />
              {platform.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${urgency.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 truncate">{clientName}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{draft.am_name} · Work Request</p>
        </div>
        {isSubmitted ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex-shrink-0">
            <CheckCircle className="w-3 h-3" />
            Submitted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-dishio-yellow/10 border border-dishio-yellow/20 text-dishio-yellow text-[10px] font-medium flex-shrink-0">
            <Zap className="w-3 h-3" />
            Pending
          </span>
        )}
      </div>

      {/* Request */}
      {draft.specific_request && (
        <div className="px-4 py-3 border-b border-neutral-800/60">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Request</p>
          <p className="text-sm text-neutral-300 leading-relaxed">{draft.specific_request}</p>
        </div>
      )}

      {/* AI Strategy */}
      {draft.ai_strategy && (
        <div className="px-4 py-3 border-b border-neutral-800/60">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3 h-3 text-dishio-yellow opacity-70" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-dishio-yellow opacity-70">AI Strategy</p>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">{draft.ai_strategy}</p>
        </div>
      )}

      {/* Expandable details */}
      {(draft.next_steps?.length > 0 || draft.blockers?.length > 0) && (
        <div className="border-b border-neutral-800/60">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] text-neutral-500 hover:text-neutral-400 transition-colors"
          >
            <span>Task details</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <div className="px-4 pb-3 space-y-3">
              {draft.next_steps?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 mb-1.5">Next Steps</p>
                  <ul className="space-y-1">
                    {draft.next_steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {draft.blockers?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-1.5">Blockers</p>
                  <ul className="space-y-1">
                    {draft.blockers.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div className={`mx-4 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${
          result.error
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        }`}>
          {result.error ? (
            <><TriangleAlert className="w-3.5 h-3.5 flex-shrink-0" />{result.error}</>
          ) : (
            <><CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />Submitted to ClickUp Media Buying board!
              {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-1 underline text-emerald-300 hover:text-emerald-200">Open →</a>}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2">
        {isSubmitted ? (
          draft.clickup_task_id && (
            <a
              href={result?.url || `https://app.clickup.com/t/${draft.clickup_task_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View in ClickUp
            </a>
          )
        ) : (
          <>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-call-reviews', { detail: { draftId: draft.id } }))}
              className="flex-1 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-700 transition-colors"
            >
              Edit in Call Reviews
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2 rounded-xl bg-dishio-yellow text-black text-xs font-bold hover:bg-dishio-yellow/90 disabled:opacity-50 transition-all shadow-[0_0_20px_-6px_rgba(255,217,0,0.5)] flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {submitting ? 'Submitting...' : 'Submit to ClickUp'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

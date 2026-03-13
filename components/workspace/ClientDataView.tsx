'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Minus, DollarSign, MousePointer, BarChart2,
    RefreshCw, ShoppingCart, Eye, Target, Zap, ChevronUp, ChevronDown,
    Trophy, Plus, X, Loader2
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Summary {
    total_spend: number; total_clicks: number; total_impressions: number;
    total_conversions: number; total_store_visits: number; avg_roas: number;
    avg_cpc: number; avg_ctr: number; avg_cost_per_conversion: number;
    campaign_count: number; days_with_data: number;
    start_date: string; end_date: string; period_days: number;
}

interface PlatformBreakdown {
    platform: string; spend: number; impressions: number;
    clicks: number; conversions: number; store_visits: number; rows: number;
}

interface CampaignTypeBreakdown {
    type: string; spend: number; impressions: number;
    clicks: number; conversions: number; rows: number;
}

interface DailyPoint { date: string; spend: number; clicks: number; conversions: number; }

interface Campaign {
    campaign_name: string; campaign_type: string; platform: string;
    spend: number; impressions: number; clicks: number; conversions: number;
    store_visits: number; cpc: number; ctr: number; roas: number;
}

interface RevenueRow {
    report_year: number; report_month: number;
    total_sales: number; num_orders: number; prev_year_sales: number;
}

interface Win {
    id: string;
    client_code: string | null;
    client_name: string | null;
    win_type: string;
    title: string;
    description: string | null;
    metric_value: number | null;
    metric_unit: string | null;
    slack_user: string | null;
    posted_at: string;
}

interface ClientData {
    client_code: string; period_days: number;
    summary: Summary | null;
    platform_breakdown: PlatformBreakdown[];
    campaign_type_breakdown: CampaignTypeBreakdown[];
    daily_trend: DailyPoint[];
    campaigns: Campaign[];
    revenue: RevenueRow[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = {
    currency: (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`,
    number: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0),
    pct: (n: number) => `${(n * 100).toFixed(2)}%`,
    roas: (n: number) => `${n.toFixed(2)}x`,
    cpc: (n: number) => `$${n.toFixed(2)}`,
};

const PLATFORM_LABELS: Record<string, string> = {
    google_ads: 'Google Ads',
    meta: 'Meta Ads',
};

const CAMPAIGN_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    PERFORMANCE_MAX: { label: 'PMax', color: 'text-blue-400' },
    SEARCH: { label: 'Search', color: 'text-green-400' },
    META: { label: 'Meta', color: 'text-purple-400' },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function TrendIndicator({ value, prev }: { value: number; prev: number }) {
    if (!prev || prev === 0) return <Minus className="w-3 h-3 text-neutral-600" />;
    const pct = ((value - prev) / Math.abs(prev)) * 100;
    if (Math.abs(pct) < 1) return <Minus className="w-3 h-3 text-neutral-600" />;
    if (pct > 0) return (
        <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
            <ChevronUp className="w-3 h-3" />+{pct.toFixed(0)}%
        </span>
    );
    return (
        <span className="flex items-center gap-0.5 text-red-400 text-[10px] font-bold">
            <ChevronDown className="w-3 h-3" />{pct.toFixed(0)}%
        </span>
    );
}

function SparkLine({ points, color = '#FFD900' }: { points: number[]; color?: string }) {
    if (points.length < 2) return null;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const h = 32;
    const w = 80;
    const step = w / (points.length - 1);
    const y = (v: number) => h - ((v - min) / range) * (h - 4) - 2;
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible opacity-60">
            <polyline points={points.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
                fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, sparkData, sub }: {
    label: string; value: string; icon: React.ReactNode;
    sparkData?: number[]; sub?: string;
}) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                        {icon}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">{label}</span>
                </div>
                {sparkData && <SparkLine points={sparkData} />}
            </div>
            <div>
                <p className="text-2xl font-black text-white tabular-nums">{value}</p>
                {sub && <p className="text-[11px] text-neutral-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Platform Bar ────────────────────────────────────────────────────────────

function PlatformBar({ data }: { data: PlatformBreakdown[] }) {
    const total = data.reduce((s, d) => s + d.spend, 0);
    if (total === 0) return <p className="text-xs text-neutral-600">No spend data</p>;
    return (
        <div className="space-y-3">
            {data.sort((a, b) => b.spend - a.spend).map(d => {
                const pct = (d.spend / total) * 100;
                const label = PLATFORM_LABELS[d.platform] || d.platform;
                const ctr = d.impressions > 0 ? d.clicks / d.impressions : 0;
                const cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
                return (
                    <div key={d.platform}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-neutral-300">{label}</span>
                            <span className="text-xs text-neutral-500 tabular-nums">{fmt.currency(d.spend)} · {pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-dishio-yellow"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                        <div className="flex gap-4 mt-1.5">
                            <span className="text-[10px] text-neutral-600">{fmt.number(d.impressions)} impr</span>
                            <span className="text-[10px] text-neutral-600">{fmt.number(d.clicks)} clicks</span>
                            <span className="text-[10px] text-neutral-600">{fmt.pct(ctr)} CTR</span>
                            <span className="text-[10px] text-neutral-600">{fmt.cpc(cpc)} CPC</span>
                            {d.conversions > 0 && <span className="text-[10px] text-emerald-600">{fmt.number(d.conversions)} conv</span>}
                            {d.store_visits > 0 && <span className="text-[10px] text-blue-600">{fmt.number(d.store_visits)} visits</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: RevenueRow[] }) {
    if (data.length === 0) return (
        <div className="flex items-center justify-center h-24 text-neutral-600 text-xs">No revenue data</div>
    );
    const max = Math.max(...data.map(r => r.total_sales), 1);
    return (
        <div className="flex items-end gap-1.5 h-28 px-1">
            {data.map((r, i) => {
                const height = (r.total_sales / max) * 100;
                const prevYearHeight = (r.prev_year_sales / max) * 100;
                const monthLabel = MONTH_NAMES[r.report_month - 1];
                const yoy = r.prev_year_sales > 0 ? ((r.total_sales - r.prev_year_sales) / r.prev_year_sales) * 100 : null;
                return (
                    <div key={`${r.report_year}-${r.report_month}`} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                            <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-2 text-[10px] whitespace-nowrap shadow-xl">
                                <p className="font-bold text-white">{monthLabel} {r.report_year}</p>
                                <p className="text-dishio-yellow">${r.total_sales.toLocaleString()}</p>
                                {r.prev_year_sales > 0 && (
                                    <p className={yoy && yoy > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {yoy ? `${yoy > 0 ? '+' : ''}${yoy.toFixed(0)}% YoY` : ''}
                                    </p>
                                )}
                            </div>
                            <div className="w-1.5 h-1.5 bg-neutral-800 rotate-45 -mt-1 border-r border-b border-neutral-700" />
                        </div>
                        <div className="w-full flex items-end gap-0.5 h-20">
                            {/* Previous year (ghost bar) */}
                            {r.prev_year_sales > 0 && (
                                <motion.div
                                    className="flex-1 bg-neutral-700/40 rounded-t-sm"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${prevYearHeight}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.03 }}
                                />
                            )}
                            {/* Current year */}
                            <motion.div
                                className="flex-1 bg-dishio-yellow rounded-t-sm"
                                initial={{ height: 0 }}
                                animate={{ height: r.total_sales > 0 ? `${height}%` : '2px' }}
                                transition={{ duration: 0.5, delay: i * 0.03 + 0.1 }}
                            />
                        </div>
                        <span className="text-[9px] text-neutral-700 font-medium">{monthLabel}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Campaign Table ───────────────────────────────────────────────────────────

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
    const [sortBy, setSortBy] = useState<keyof Campaign>('spend');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const toggle = (col: keyof Campaign) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const sorted = [...campaigns].sort((a, b) => {
        const av = a[sortBy] as number;
        const bv = b[sortBy] as number;
        return sortDir === 'desc' ? bv - av : av - bv;
    });

    const Th = ({ col, label }: { col: keyof Campaign; label: string }) => (
        <th
            onClick={() => toggle(col)}
            className="px-3 py-2 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-widest cursor-pointer hover:text-neutral-400 select-none whitespace-nowrap"
        >
            <span className="flex items-center gap-1">
                {label}
                {sortBy === col && (sortDir === 'desc'
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronUp className="w-3 h-3" />
                )}
            </span>
        </th>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead className="border-b border-neutral-800">
                    <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Campaign</th>
                        <Th col="spend" label="Spend" />
                        <Th col="impressions" label="Impr" />
                        <Th col="clicks" label="Clicks" />
                        <Th col="ctr" label="CTR" />
                        <Th col="cpc" label="CPC" />
                        <Th col="conversions" label="Conv" />
                        <Th col="store_visits" label="Visits" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                    {sorted.map((c, i) => {
                        const typeInfo = CAMPAIGN_TYPE_LABELS[c.campaign_type] || { label: c.campaign_type, color: 'text-neutral-500' };
                        const shortName = c.campaign_name.replace(/^.*?\|\s*/, '').substring(0, 48);
                        return (
                            <tr key={i} className="hover:bg-neutral-900/60 transition-colors">
                                <td className="px-3 py-2.5 max-w-[220px]">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold uppercase ${typeInfo.color} shrink-0`}>{typeInfo.label}</span>
                                        <span className="text-neutral-300 truncate" title={c.campaign_name}>{shortName}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-neutral-200 font-medium tabular-nums">{fmt.currency(c.spend)}</td>
                                <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{fmt.number(c.impressions)}</td>
                                <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{fmt.number(c.clicks)}</td>
                                <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{fmt.pct(c.ctr)}</td>
                                <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{fmt.cpc(c.cpc)}</td>
                                <td className="px-3 py-2.5 tabular-nums">
                                    <span className={c.conversions > 0 ? 'text-emerald-400' : 'text-neutral-600'}>
                                        {c.conversions > 0 ? fmt.number(c.conversions) : '—'}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 tabular-nums">
                                    <span className={c.store_visits > 0 ? 'text-blue-400' : 'text-neutral-600'}>
                                        {c.store_visits > 0 ? fmt.number(c.store_visits) : '—'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Win Type Config ─────────────────────────────────────────────────────────

const WIN_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    revenue:  { label: 'Revenue',  color: 'text-emerald-400', bg: 'bg-emerald-500/10',  dot: 'bg-emerald-400' },
    campaign: { label: 'Campaign', color: 'text-blue-400',    bg: 'bg-blue-500/10',     dot: 'bg-blue-400' },
    creative: { label: 'Creative', color: 'text-purple-400',  bg: 'bg-purple-500/10',   dot: 'bg-purple-400' },
    client:   { label: 'Client',   color: 'text-dishio-yellow', bg: 'bg-dishio-yellow/10', dot: 'bg-dishio-yellow' },
    other:    { label: 'Win',      color: 'text-neutral-400', bg: 'bg-neutral-700/40',  dot: 'bg-neutral-500' },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function metricDisplay(value: number | null, unit: string | null) {
    if (!value) return null;
    switch (unit) {
        case 'dollars': return `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}`;
        case 'percent': return `${value.toFixed(1)}%`;
        case 'roas':    return `${value.toFixed(2)}x ROAS`;
        default:        return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
    }
}

// ─── Add Win Modal ────────────────────────────────────────────────────────────

function AddWinModal({ clientCode, clientName, onClose, onAdded }: {
    clientCode: string; clientName: string;
    onClose: () => void; onAdded: (win: Win) => void;
}) {
    const [form, setForm] = useState({ win_type: 'campaign', title: '', description: '', metric_value: '', metric_unit: 'dollars' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/wins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_code: clientCode !== 'ALL' ? clientCode : null,
                    client_name: clientName !== 'ALL' ? clientName : null,
                    win_type: form.win_type,
                    title: form.title,
                    description: form.description || null,
                    metric_value: form.metric_value ? parseFloat(form.metric_value) : null,
                    metric_unit: form.metric_value ? form.metric_unit : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add win');
            onAdded(data);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-dishio-yellow" />
                        <h2 className="text-sm font-semibold text-white">Log a Win</h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-600 hover:text-neutral-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">Win Type</label>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(WIN_TYPE_CONFIG).map(([type, cfg]) => (
                                <button
                                    key={type} type="button"
                                    onClick={() => setForm(f => ({ ...f, win_type: type }))}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                        form.win_type === type
                                            ? `${cfg.bg} ${cfg.color} border-current`
                                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300'
                                    }`}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">Title *</label>
                        <input
                            type="text" required value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. D-1327 hit 4.2x ROAS this week"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30 focus:border-dishio-yellow/40 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">Notes (optional)</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="More context about the win..."
                            rows={2}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30 focus:border-dishio-yellow/40 resize-none transition-colors"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">Metric (optional)</label>
                            <input
                                type="number" value={form.metric_value}
                                onChange={e => setForm(f => ({ ...f, metric_value: e.target.value }))}
                                placeholder="e.g. 50000"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30 focus:border-dishio-yellow/40 transition-colors"
                            />
                        </div>
                        {form.metric_value && (
                            <div className="w-28">
                                <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">Unit</label>
                                <select
                                    value={form.metric_unit}
                                    onChange={e => setForm(f => ({ ...f, metric_unit: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30"
                                >
                                    <option value="dollars">$</option>
                                    <option value="percent">%</option>
                                    <option value="roas">ROAS</option>
                                    <option value="orders">orders</option>
                                    <option value="leads">leads</option>
                                    <option value="clicks">clicks</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <button
                        type="submit" disabled={loading || !form.title.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-dishio-yellow text-black text-sm font-bold hover:bg-dishio-yellow/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-6px_rgba(255,217,0,0.5)]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                        {loading ? 'Logging…' : 'Log Win'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Wins Feed ────────────────────────────────────────────────────────────────

function WinsFeed({ clientCode, clientName }: { clientCode: string; clientName: string }) {
    const [wins, setWins] = useState<Win[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const param = clientCode !== 'ALL' ? `?client_code=${encodeURIComponent(clientCode)}&limit=10` : '?limit=10';
            const res = await fetch(`/api/wins${param}`);
            const data = await res.json();
            setWins(Array.isArray(data) ? data : []);
        } catch {
            setWins([]);
        } finally {
            setLoading(false);
        }
    }, [clientCode]);

    useEffect(() => { load(); }, [load]);

    const handleAdded = (win: Win) => {
        setWins(prev => [win, ...prev].slice(0, 10));
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-dishio-yellow" />
                    <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Team Wins</span>
                    {wins.length > 0 && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-dishio-yellow/20 text-dishio-yellow text-[9px] font-bold">
                            {wins.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 text-[11px] font-medium transition-all"
                >
                    <Plus className="w-3 h-3" />
                    Log Win
                </button>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
                    </div>
                ) : wins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-neutral-600" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 font-medium">No wins logged yet</p>
                            <p className="text-[11px] text-neutral-700 mt-0.5">
                                Post in #wins on Slack or click "Log Win" above
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {wins.map((win, i) => {
                            const cfg = WIN_TYPE_CONFIG[win.win_type] || WIN_TYPE_CONFIG.other;
                            const metric = metricDisplay(win.metric_value, win.metric_unit);
                            return (
                                <motion.div
                                    key={win.id}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/40 hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all group"
                                >
                                    {/* Type dot */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-semibold text-neutral-200 leading-snug">{win.title}</p>
                                            {metric && (
                                                <span className={`shrink-0 text-[11px] font-bold tabular-nums ${cfg.color}`}>
                                                    {metric}
                                                </span>
                                            )}
                                        </div>
                                        {win.description && (
                                            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{win.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${cfg.color} ${cfg.bg} px-1.5 py-0.5 rounded`}>
                                                {cfg.label}
                                            </span>
                                            {win.client_code && win.client_code !== clientCode && (
                                                <span className="text-[9px] font-mono text-neutral-600">{win.client_code}</span>
                                            )}
                                            <span className="text-[10px] text-neutral-700 ml-auto">{timeAgo(win.posted_at)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <AddWinModal
                        clientCode={clientCode}
                        clientName={clientName}
                        onClose={() => setShowModal(false)}
                        onAdded={handleAdded}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '60D', value: 60 },
    { label: '90D', value: 90 },
];

export function ClientDataView() {
    const { selectedClient } = useApp();
    const [period, setPeriod] = useState(30);
    const [data, setData] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (code: string, days: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/client-data?client_code=${encodeURIComponent(code)}&days=${days}`);
            if (!res.ok) throw new Error(`${res.status}`);
            setData(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClient?.clientCode) {
            load(selectedClient.clientCode, period);
        }
    }, [selectedClient?.clientCode, period, load]);

    if (!selectedClient) return (
        <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
            Select a client to view performance data
        </div>
    );

    const s = data?.summary;
    const spendTrend = data?.daily_trend.map(d => d.spend) ?? [];
    const clickTrend = data?.daily_trend.map(d => d.clicks) ?? [];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-800/60">
                <div>
                    <h1 className="text-sm font-bold text-white uppercase tracking-wide italic">
                        {selectedClient.name}
                    </h1>
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                        {data?.summary
                            ? `${data.summary.start_date} → ${data.summary.end_date} · ${data.summary.days_with_data} days with data`
                            : 'Loading…'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Period selector */}
                    <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                                    period === opt.value
                                        ? 'bg-dishio-yellow text-black'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => load(selectedClient.clientCode, period)}
                        disabled={loading}
                        className="p-1.5 rounded-lg border border-neutral-800 text-neutral-600 hover:text-neutral-300 transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <AnimatePresence mode="wait">
                    {loading && !data ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-48">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-2 border-neutral-700 border-t-dishio-yellow rounded-full animate-spin" />
                                <p className="text-xs text-neutral-600">Loading performance data…</p>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div key="error" className="flex items-center justify-center h-48 text-red-400 text-sm">
                            Error loading data: {error}
                        </motion.div>
                    ) : data ? (
                        <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-5">

                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <KpiCard
                                    label="Total Spend"
                                    value={s ? fmt.currency(s.total_spend) : '—'}
                                    icon={<DollarSign className="w-3.5 h-3.5" />}
                                    sparkData={spendTrend}
                                    sub={s ? `${s.campaign_count} campaigns` : undefined}
                                />
                                <KpiCard
                                    label="Conversions"
                                    value={s ? fmt.number(s.total_conversions) : '—'}
                                    icon={<Target className="w-3.5 h-3.5" />}
                                    sub={s && s.avg_cost_per_conversion > 0
                                        ? `${fmt.cpc(s.avg_cost_per_conversion)} / conv`
                                        : undefined}
                                />
                                <KpiCard
                                    label="Total Clicks"
                                    value={s ? fmt.number(s.total_clicks) : '—'}
                                    icon={<MousePointer className="w-3.5 h-3.5" />}
                                    sparkData={clickTrend}
                                    sub={s ? `${fmt.pct(s.avg_ctr)} CTR · ${fmt.cpc(s.avg_cpc)} CPC` : undefined}
                                />
                                <KpiCard
                                    label="Store Visits"
                                    value={s ? fmt.number(s.total_store_visits) : '—'}
                                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                                    sub={s ? `${fmt.number(s.total_impressions)} impressions` : undefined}
                                />
                            </div>

                            {/* Platform breakdown + Revenue */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Platform Breakdown */}
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart2 className="w-3.5 h-3.5 text-neutral-600" />
                                        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Platform Breakdown</span>
                                    </div>
                                    <PlatformBar data={data.platform_breakdown} />

                                    {/* Campaign type badges */}
                                    {data.campaign_type_breakdown.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-800">
                                            {data.campaign_type_breakdown.sort((a, b) => b.spend - a.spend).map(ct => {
                                                const info = CAMPAIGN_TYPE_LABELS[ct.type] || { label: ct.type, color: 'text-neutral-500' };
                                                return (
                                                    <div key={ct.type} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700">
                                                        <span className={`text-[10px] font-bold ${info.color}`}>{info.label}</span>
                                                        <span className="text-[10px] text-neutral-500">{fmt.currency(ct.spend)}</span>
                                                        <span className="text-[9px] text-neutral-700">·</span>
                                                        <span className="text-[10px] text-neutral-600">{fmt.number(ct.conversions)} conv</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Revenue */}
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-neutral-600" />
                                            <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Revenue Trend</span>
                                        </div>
                                        {data.revenue.length > 1 && (() => {
                                            const latest = data.revenue[data.revenue.length - 1];
                                            const prev = data.revenue[data.revenue.length - 2];
                                            return <TrendIndicator value={latest.total_sales} prev={prev.total_sales} />;
                                        })()}
                                    </div>
                                    <RevenueChart data={data.revenue} />
                                    {data.revenue.length > 0 && (() => {
                                        const latest = data.revenue[data.revenue.length - 1];
                                        const prev = data.revenue.find(r =>
                                            r.report_year === latest.report_year - 1 &&
                                            r.report_month === latest.report_month
                                        );
                                        return (
                                            <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-800">
                                                <div>
                                                    <p className="text-[10px] text-neutral-600">Latest Month</p>
                                                    <p className="text-sm font-bold text-white">${latest.total_sales.toLocaleString()}</p>
                                                </div>
                                                {prev && (
                                                    <div>
                                                        <p className="text-[10px] text-neutral-600">YoY Change</p>
                                                        <p className={`text-sm font-bold ${
                                                            latest.total_sales >= prev.total_sales ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                            {((latest.total_sales - prev.total_sales) / Math.abs(prev.total_sales) * 100).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] text-neutral-600">ROAS (avg)</p>
                                                    <p className="text-sm font-bold text-dishio-yellow">
                                                        {s ? fmt.roas(s.avg_roas) : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Campaign Table */}
                            {data.campaigns.length > 0 && (
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                                        <Zap className="w-3.5 h-3.5 text-neutral-600" />
                                        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">
                                            Campaigns · {period}-Day Period
                                        </span>
                                        <span className="ml-auto text-[10px] text-neutral-700">{data.campaigns.length} total</span>
                                    </div>
                                    <CampaignTable campaigns={data.campaigns} />
                                </div>
                            )}

                            {/* Wins Feed */}
                            <WinsFeed
                                clientCode={selectedClient.clientCode}
                                clientName={selectedClient.name}
                            />

                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}

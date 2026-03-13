'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useApp } from '@/context/AppContext';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, TrendingUp, Trophy, DollarSign, BarChart2, Zap, ChevronRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

/* ─── Quick action categories ─── */
const QUICK_ACTIONS = [
    {
        category: 'Performance',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10',
        prompts: [
            'Which clients have 200+ conversions this month?',
            'Show me the top 5 clients by spend this month',
            'Which clients have the best ROAS right now?',
            'List all clients with a CPA under $5',
            'Which clients are seeing declining CTR?',
            'Which clients improved ROAS month over month?',
            'Show me all clients with cost per click above $3',
            'Which clients have the highest conversion rates?',
            'Flag any clients with zero conversions this month',
            'Compare this month vs last month across all clients',
        ],
    },
    {
        category: 'Wins',
        icon: <Trophy className="w-3.5 h-3.5" />,
        color: 'text-dishio-yellow',
        bg: 'bg-dishio-yellow/5 border-dishio-yellow/15 hover:bg-dishio-yellow/10',
        prompts: [
            'Show me recent wins across all clients',
            'Which clients had a win this week?',
            'Summarize the biggest revenue wins this month',
            'Which account managers have the most wins logged?',
            'What types of wins are trending across the portfolio?',
            'Show me wins tied to Google PMax campaigns',
            'Which clients have no wins logged this month?',
            'List all wins from new menu launches or promotions',
            'Which wins had the highest reported revenue lift?',
            'Build a wins digest I can share with the team this week',
        ],
    },
    {
        category: 'Strategy',
        icon: <Target className="w-3.5 h-3.5" />,
        color: 'text-pink-400',
        bg: 'bg-pink-500/5 border-pink-500/15 hover:bg-pink-500/10',
        prompts: [
            'Prepare a meeting brief for [client] — performance, wins, and next steps',
            'Build a 90-day growth plan for [client]',
            'Run a competitor analysis for a pizza restaurant in [city]',
            'Generate an optimization report for [client]\'s Google PMax campaign',
            'Write high-converting ad copy for a new promotion at [client]',
            'Draft a QBR presentation outline for my top 5 clients',
            'What marketing channels should we add for clients seeing plateaued growth?',
            'Suggest 3 campaign ideas for a restaurant launching catering services',
            'Build a reactivation campaign brief for a client with declining traffic',
            'What\'s the best upsell strategy for a client with high conversions but low ROAS?',
        ],
    },
    {
        category: 'Campaigns',
        icon: <Zap className="w-3.5 h-3.5" />,
        color: 'text-blue-400',
        bg: 'bg-blue-500/5 border-blue-500/15 hover:bg-blue-500/10',
        prompts: [
            'Which clients are running PMax campaigns?',
            'Compare all Meta Ads campaigns by CTR',
            'Which campaigns have 0 conversions this month?',
            'List clients with no Google Ads data set up',
            'Which clients are only on Meta Ads right now?',
            'Which PMax campaigns are underperforming vs target CPA?',
            'Show me all campaigns with CTR below 1%',
            'Compare Google Ads vs Meta Ads performance across all clients',
            'Which clients have the highest impression share?',
            'Which clients recently launched a new campaign?',
        ],
    },
    {
        category: 'Budget',
        icon: <DollarSign className="w-3.5 h-3.5" />,
        color: 'text-orange-400',
        bg: 'bg-orange-500/5 border-orange-500/15 hover:bg-orange-500/10',
        prompts: [
            'Which clients have spend under $500 this month?',
            'Who has the highest total ad spend this period?',
            'Show clients with ROAS below 1.0',
            'Which clients have no ad spend data at all?',
            'Which clients should increase their budget based on ROAS?',
            'Show me clients spending less than $1,000/month on ads',
            'Who has the best cost efficiency across Meta and Google combined?',
            'Which clients have the widest gap between spend and revenue?',
            'Show me budget utilization across all clients this month',
            'Which clients are at risk of underspending their monthly budget?',
        ],
    },
    {
        category: 'Reporting',
        icon: <BarChart2 className="w-3.5 h-3.5" />,
        color: 'text-purple-400',
        bg: 'bg-purple-500/5 border-purple-500/15 hover:bg-purple-500/10',
        prompts: [
            'Generate a full agency performance summary for this month',
            'Which clients need optimization reports this week?',
            'Rank all clients by conversion volume',
            'Build a month-end summary I can share with all account managers',
            'Which clients are ready for a case study?',
            'Show me the top 10 performing clients this quarter',
            'Generate a weekly wins digest for the agency',
            'Which clients have the most improvement compared to last month?',
            'Create an executive summary of agency-wide KPIs for this period',
            'Which clients should be highlighted in our next agency report?',
        ],
    },
];

export function AgencyChatView() {
    const { amId } = useApp();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const { messages, status, sendMessage, data } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    }) as any;

    const isLoading = status === 'streaming' || status === 'submitted';
    const isEmpty = messages.length === 0;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (text: string) => {
        const q = text.trim();
        if (!q || isLoading) return;
        // Always send client_code: null for agency-wide queries
        sendMessage({ text: q }, { body: { client_code: null, am_id: amId || 'am_default' } });
        setInput('');
        setActiveCategory(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const activeCat = QUICK_ACTIONS.find(c => c.category === activeCategory);

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6 max-w-2xl mx-auto text-center">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-7 h-7 text-dishio-yellow" />
                            </div>
                            <p className="text-xl font-black text-white uppercase italic tracking-tight">Agency Command</p>
                            <p className="text-sm text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
                                Ask anything across all 135+ clients — performance, wins, budgets, campaigns.
                            </p>
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {QUICK_ACTIONS.map(cat => (
                                <button
                                    key={cat.category}
                                    onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                        activeCategory === cat.category
                                            ? cat.bg + ' ' + cat.color
                                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                                    }`}
                                >
                                    {cat.icon}
                                    {cat.category}
                                </button>
                            ))}
                        </div>

                        {/* Prompt list for active category */}
                        <AnimatePresence mode="wait">
                            {activeCat && (
                                <motion.div
                                    key={activeCat.category}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="w-full max-w-md flex flex-col gap-1.5"
                                >
                                    {activeCat.prompts.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => send(p)}
                                            className={`flex items-center justify-between gap-3 w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${activeCat.bg} ${activeCat.color}`}
                                        >
                                            <span>{p}</span>
                                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Show all prompts inline when no category selected */}
                        {!activeCat && (
                            <div className="w-full max-w-md flex flex-col gap-1.5 opacity-60">
                                {QUICK_ACTIONS.flatMap(c => c.prompts).slice(0, 4).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => send(p)}
                                        className="flex items-center justify-between gap-3 w-full text-left px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:opacity-100 transition-all"
                                    >
                                        <span>{p}</span>
                                        <ChevronRight className="w-3 h-3 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg: any, idx: number) => {
                                const textContent = msg.parts
                                    ? msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                                    : '';
                                const lastAssistantIdx = messages.filter((m: any, i: number) => i <= idx && m.role === 'assistant').length - 1;
                                const msgData = msg.role === 'assistant' ? (data as any)?.[lastAssistantIdx] : null;
                                const sources = msgData?.sources || [];

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 ${msg.role === 'assistant' ? 'bg-neutral-800 border border-neutral-700' : 'bg-white/10 border border-white/10'}`}>
                                                {msg.role === 'assistant'
                                                    ? <Bot className="w-3.5 h-3.5 text-dishio-yellow" />
                                                    : <User className="w-3.5 h-3.5 text-white" />
                                                }
                                            </div>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm'}`}>
                                                {msg.role === 'assistant'
                                                    ? <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{textContent}</ReactMarkdown></div>
                                                    : textContent
                                                }
                                            </div>
                                        </div>
                                        {msg.role === 'assistant' && sources.length > 0 && (
                                            <div className="ml-10 flex flex-wrap gap-2 mt-1">
                                                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest w-full mb-1">Context Sources:</p>
                                                {sources.map((s: any, sIdx: number) => (
                                                    <div key={sIdx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-500 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-dishio-yellow/40" />
                                                        {s.code || s.client} ({s.date})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                                <div className="shrink-0 w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mt-1">
                                    <Bot className="w-3.5 h-3.5 text-dishio-yellow" />
                                </div>
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 px-6 pb-6 pt-2">
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    {/* Inline category chips while chatting */}
                    {!isEmpty && (
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_ACTIONS.map(cat => (
                                <button
                                    key={cat.category}
                                    onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                                        activeCategory === cat.category
                                            ? cat.bg + ' ' + cat.color
                                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-600 hover:text-neutral-400 hover:border-neutral-700'
                                    }`}
                                >
                                    {cat.icon}
                                    {cat.category}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Inline prompt list for active category while chatting */}
                    <AnimatePresence>
                        {!isEmpty && activeCat && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="flex flex-col gap-1"
                            >
                                {activeCat.prompts.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => send(p)}
                                        disabled={isLoading}
                                        className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${activeCat.bg} ${activeCat.color} disabled:opacity-40`}
                                    >
                                        <span>{p}</span>
                                        <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                            placeholder="Ask anything across all clients — conversions, wins, spend, campaigns…"
                            rows={1}
                            className="w-full resize-none bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors leading-relaxed"
                            style={{ minHeight: '52px', maxHeight: '160px' }}
                            onInput={e => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = 'auto';
                                t.style.height = Math.min(t.scrollHeight, 160) + 'px';
                            }}
                        />
                        <button
                            onClick={() => send(input)}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 bottom-3 w-7 h-7 rounded-lg bg-dishio-yellow text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors shadow-[0_0_15px_-3px_rgba(255,217,0,0.5)]"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-neutral-700 font-medium uppercase tracking-wider">
                        Queries run across all clients · Dishio AI may produce inaccurate information
                    </p>
                </div>
            </div>
        </div>
    );
}

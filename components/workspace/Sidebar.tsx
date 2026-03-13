'use client';

import { ClientCombobox } from './ClientCombobox';
import { useApp } from '@/context/AppContext';
import { MessagesSquare, MessageSquare, PhoneCall, BarChart2, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { WorkspaceView } from './WorkspaceViews';

interface ConversationSession {
    id: string;
    client_code: string;
    client_name: string;
    first_message: string;
    started_at: string;
    message_count: number;
}

interface SidebarProps {
    activeView: WorkspaceView;
    onViewChange: (view: WorkspaceView) => void;
    callReviewCount?: number;
}

interface NavItem {
    id: WorkspaceView;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    badge?: number;
}

export function Sidebar({ activeView, onViewChange, callReviewCount = 0 }: SidebarProps) {
    const { selectedClient, profile, isAdmin, signOut, user } = useApp();
    const [sessions, setSessions] = useState<ConversationSession[]>([]);

    useEffect(() => {
        if (!user) return;
        fetch('/api/conversations?limit=40')
            .then(r => r.ok ? r.json() : [])
            .then(data => setSessions(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [user]);

    const formatSessionTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const navItems: NavItem[] = [
        {
            id: 'chat',
            label: 'Chat',
            icon: <MessageSquare className="w-4 h-4" />,
        },
        {
            id: 'agency',
            label: 'Agency',
            icon: <MessagesSquare className="w-4 h-4" />,
        },
        {
            id: 'reviews',
            label: 'Call Reviews',
            icon: <PhoneCall className="w-4 h-4" />,
            badge: callReviewCount > 0 ? callReviewCount : undefined,
        },
        {
            id: 'client-data',
            label: 'Client Data',
            icon: <BarChart2 className="w-4 h-4" />,
        },
        {
            id: 'admin',
            label: 'Admin',
            icon: <Settings className="w-4 h-4" />,
            adminOnly: true,
        },
    ];

    const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    // Derive initials from profile
    const initials = (() => {
        if (profile?.full_name) {
            const parts = profile.full_name.trim().split(' ');
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            return parts[0].slice(0, 2).toUpperCase();
        }
        if (profile?.email) return profile.email.slice(0, 2).toUpperCase();
        return 'AM';
    })();

    const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Account Manager';
    const displayRole = profile?.role
        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
        : 'Viewer';

    return (
        <aside className="w-[250px] shrink-0 h-screen flex flex-col border-r border-neutral-800/60 bg-[#080808]">

            {/* Logo */}
            <div className="px-4 py-6 border-b border-neutral-800/60">
                <img
                    src="/images/DISHIO-LOGOTYPE-YELLOW.png"
                    alt="Dishio"
                    className="h-5 w-auto object-contain"
                />
            </div>

            {/* Client selector */}
            <div className="px-3 py-4 border-b border-neutral-800/40">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-2 px-1">
                    Active Client
                </p>
                <ClientCombobox />
            </div>

            {/* Primary navigation */}
            <div className="px-3 py-3 border-b border-neutral-800/40">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-2 px-1">
                    Navigation
                </p>
                <nav className="flex flex-col gap-0.5">
                    {visibleNavItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className="group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-dishio-yellow/50"
                            >
                                {/* Active indicator bar */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            layoutId="sidebar-active-bar"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-dishio-yellow rounded-r-full"
                                            initial={{ opacity: 0, scaleY: 0 }}
                                            animate={{ opacity: 1, scaleY: 1 }}
                                            exit={{ opacity: 0, scaleY: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Background fill */}
                                <motion.span
                                    className={`absolute inset-0 rounded-lg transition-colors duration-150 ${
                                        isActive
                                            ? 'bg-dishio-yellow/[0.07]'
                                            : 'bg-transparent group-hover:bg-white/[0.03]'
                                    }`}
                                />

                                {/* Icon */}
                                <span
                                    className={`relative z-10 transition-colors duration-150 ${
                                        isActive
                                            ? 'text-dishio-yellow'
                                            : 'text-neutral-500 group-hover:text-neutral-300'
                                    }`}
                                >
                                    {item.icon}
                                </span>

                                {/* Label */}
                                <span
                                    className={`relative z-10 flex-1 text-xs font-medium transition-colors duration-150 ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-neutral-500 group-hover:text-neutral-300'
                                    }`}
                                >
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge !== undefined && (
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative z-10 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-dishio-yellow text-black text-[10px] font-bold leading-none tabular-nums"
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </motion.span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Chat history */}
            <div className="flex-1 px-3 py-3 overflow-y-auto">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-2 px-1">
                    Recent Sessions
                </p>
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 opacity-40">
                        <MessagesSquare className="w-5 h-5 text-neutral-600" />
                        <p className="text-xs text-neutral-600 text-center leading-relaxed">
                            Sessions will appear here
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        {sessions.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => onViewChange('chat')}
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[10px] font-semibold text-neutral-500 truncate uppercase tracking-wide">
                                        {s.client_name !== s.client_code ? s.client_name : s.client_code}
                                    </span>
                                    <span className="text-[9px] text-neutral-700 shrink-0">
                                        {formatSessionTime(s.started_at)}
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-600 group-hover:text-neutral-400 leading-snug truncate transition-colors">
                                    {s.first_message.length > 52
                                        ? s.first_message.substring(0, 52) + '…'
                                        : s.first_message}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* User profile footer */}
            <div className="shrink-0 border-t border-neutral-800/60 px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg group">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-dishio-yellow/10 border border-dishio-yellow/20 flex items-center justify-center">
                            <span className="text-[11px] font-bold text-dishio-yellow leading-none tracking-tight">
                                {initials}
                            </span>
                        </div>
                        {/* Online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#080808]" />
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-200 truncate leading-none mb-0.5">
                            {displayName}
                        </p>
                        <p className="text-[10px] text-neutral-600 leading-none">
                            {displayRole}
                        </p>
                    </div>

                    {/* Sign out */}
                    <button
                        onClick={signOut}
                        title="Sign out"
                        className="shrink-0 p-1.5 rounded-md text-neutral-700 hover:text-neutral-300 hover:bg-white/5 transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

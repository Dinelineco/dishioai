'use client';

import { ClientCombobox } from './ClientCombobox';
import { useApp } from '@/context/AppContext';
import {
  MessagesSquare, MessageSquare, PhoneCall, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
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

const SIDEBAR_KEY = 'dishio-sidebar-collapsed';

export function Sidebar({ activeView, onViewChange, callReviewCount = 0 }: SidebarProps) {
  const { selectedClient, profile, isAdmin, signOut, user } = useApp();
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

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
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navItems: NavItem[] = [
    { id: 'chat',        label: 'Chat',         icon: <MessageSquare className="w-[15px] h-[15px]" /> },
    { id: 'agency',      label: 'Agency',        icon: <MessagesSquare className="w-[15px] h-[15px]" /> },
    { id: 'reviews',     label: 'Call Reviews',  icon: <PhoneCall className="w-[15px] h-[15px]" />, badge: callReviewCount > 0 ? callReviewCount : undefined },
    { id: 'client-data', label: 'Client Data',   icon: <BarChart2 className="w-[15px] h-[15px]" /> },
    { id: 'admin',       label: 'Admin',         icon: <Settings className="w-[15px] h-[15px]" />, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const initials = (() => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    if (profile?.email) return profile.email.slice(0, 2).toUpperCase();
    return 'AM';
  })();

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Account Manager';
  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Viewer';

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 232 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="relative shrink-0 h-screen flex flex-col overflow-hidden"
      style={{
        background: 'var(--s1)',
        borderRight: '1px solid var(--b2)',
      }}
    >
      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[52px] z-50 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
        style={{
          background: 'var(--s3)',
          border: '1px solid var(--b3)',
          color: 'var(--t2)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>

      {/* ── Logo ── */}
      <div
        className="px-3 flex items-center h-[56px] shrink-0"
        style={{ borderBottom: '1px solid var(--b1)' }}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="mx-auto w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--yellow)', color: '#000' }}
            >
              <span className="text-[11px] font-black tracking-tight">D</span>
            </motion.div>
          ) : (
            <motion.img
              key="logo"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              src="/images/DISHIO-LOGOTYPE-YELLOW.png"
              alt="Dishio"
              className="h-[18px] w-auto object-contain"
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Client selector ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-2.5 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--b1)' }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-2 px-1"
               style={{ color: 'var(--t3)' }}>
              Active Client
            </p>
            <ClientCombobox />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div
        className="px-2 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--b1)' }}
      >
        {!collapsed && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-1.5 px-1"
             style={{ color: 'var(--t3)' }}>
            Navigation
          </p>
        )}
        <nav className="flex flex-col gap-0.5">
          {visibleNavItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.label : undefined}
                className="group relative w-full flex items-center gap-2.5 rounded-[8px] text-left transition-all duration-150 focus:outline-none"
                style={{
                  padding: collapsed ? '8px' : '7px 9px',
                  justifyContent: collapsed ? 'center' : undefined,
                  background: isActive ? 'var(--yellow-dim)' : 'transparent',
                  color: isActive ? 'var(--yellow)' : 'var(--t2)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--b1)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Active bar */}
                {isActive && (
                  <motion.span
                    layoutId="nav-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full"
                    style={{ height: '16px', background: 'var(--yellow)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10 shrink-0">{item.icon}</span>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 flex-1 text-[12px] font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: isActive ? 'var(--t1)' : undefined }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge !== undefined && !collapsed && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-black leading-none tabular-nums"
                    style={{ background: 'var(--yellow)', color: '#000' }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}

                {item.badge !== undefined && collapsed && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--yellow)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Recent sessions (hidden when collapsed) ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 px-2 py-3 overflow-y-auto"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-2 px-1"
               style={{ color: 'var(--t3)' }}>
              Recent Sessions
            </p>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 opacity-30">
                <MessagesSquare className="w-4 h-4" style={{ color: 'var(--t3)' }} />
                <p className="text-[10px] text-center" style={{ color: 'var(--t3)' }}>
                  Sessions appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-px">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onViewChange('chat')}
                    className="w-full text-left px-2 py-2 rounded-[7px] transition-all duration-100 group"
                    style={{ color: 'var(--t2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--b1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider truncate"
                            style={{ color: 'var(--yellow)', opacity: 0.7 }}>
                        {s.client_name !== s.client_code ? s.client_name : s.client_code}
                      </span>
                      <span className="text-[9px] shrink-0" style={{ color: 'var(--t4)' }}>
                        {formatSessionTime(s.started_at)}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug truncate" style={{ color: 'var(--t3)' }}>
                      {s.first_message.length > 48
                        ? s.first_message.substring(0, 48) + '…'
                        : s.first_message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User footer ── */}
      <div
        className="shrink-0 px-2 py-2.5"
        style={{ borderTop: '1px solid var(--b1)' }}
      >
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-[8px]"
          style={{ justifyContent: collapsed ? 'center' : undefined }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-7 h-7 rounded-[7px] flex items-center justify-center"
              style={{
                background: 'var(--yellow-dim)',
                border: '1px solid rgba(255,217,0,0.15)',
              }}
            >
              <span className="text-[11px] font-bold leading-none" style={{ color: 'var(--yellow)' }}>
                {initials}
              </span>
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: 'var(--s1)' }}
            />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-[12px] font-medium truncate leading-none mb-0.5"
                   style={{ color: 'var(--t1)' }}>
                  {displayName}
                </p>
                <p className="text-[9px] leading-none uppercase tracking-wider"
                   style={{ color: 'var(--t3)' }}>
                  {displayRole}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={signOut}
                title="Sign out"
                className="shrink-0 p-1.5 rounded-[6px] transition-all duration-150"
                style={{ color: 'var(--t3)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--t1)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--b2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--t3)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

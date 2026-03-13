'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/workspace/Sidebar';
import { WorkspaceViews } from '@/components/workspace/WorkspaceViews';
import type { WorkspaceView } from '@/components/workspace/WorkspaceViews';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const [activeView, setActiveView] = useState<WorkspaceView>('chat');
  const [pendingDraftCount, setPendingDraftCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Poll pending call drafts count every 60s for badge
  const fetchDraftCount = useCallback(async () => {
    try {
      const res = await fetch('/api/call-drafts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPendingDraftCount(data.filter((d: { status: string }) => d.status === 'pending_review').length);
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDraftCount();
      const interval = setInterval(fetchDraftCount, 60_000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDraftCount]);

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#050505]">
      <div className="w-6 h-6 border-2 border-neutral-700 border-t-dishio-yellow rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        callReviewCount={pendingDraftCount}
      />
      <main className="flex-1 h-full overflow-hidden">
        <WorkspaceViews activeView={activeView} />
      </main>
    </div>
  );
}

'use client';

import { Sidebar } from '@/components/workspace/Sidebar';
import { ChatInterface } from '@/components/workspace/ChatInterface';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WorkspacePage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) return (
  <div className="flex h-screen items-center justify-center bg-[#050505]">
    <div className="w-6 h-6 border-2 border-neutral-700 border-t-yellow-400 rounded-full animate-spin" />
  </div>
);
if (!user) return null;

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}

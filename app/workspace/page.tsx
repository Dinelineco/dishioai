'use client';

import { Sidebar } from '@/components/workspace/Sidebar';
import { ChatInterface } from '@/components/workspace/ChatInterface';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WorkspacePage() {
    const { amId } = useApp();
    const router = useRouter();

    // Redirect to login if no AM session
    useEffect(() => {
        if (!amId) {
            router.replace('/login');
        }
    }, [amId, router]);

    if (!amId) return null;

    return (
        <div className="flex h-screen bg-[#050505] overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden">
                <ChatInterface />
            </main>
        </div>
    );
}

'use client';

import { ClientCombobox } from './ClientCombobox';
import { useApp } from '@/context/AppContext';
import { MessagesSquare } from 'lucide-react';

export function Sidebar() {
    const { selectedClient } = useApp();

    return (
        <aside className="w-[250px] shrink-0 h-screen flex flex-col border-r border-neutral-800/60 bg-[#080808]">
            {/* Logo / brand */}
            <div className="px-4 py-5 border-b border-neutral-800/60 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                    <span className="text-[10px] font-black text-dishio-yellow italic">D</span>
                </div>
                <h1 className="text-base font-black tracking-tight text-white uppercase italic">
                    Dishio<span className="text-dishio-yellow">.</span>AI
                </h1>
            </div>

            {/* Client selector */}
            <div className="px-3 py-4 border-b border-neutral-800/40">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-2 px-1">
                    Active Client
                </p>
                <ClientCombobox />
                {selectedClient && (
                    <div className="mt-2 px-1">
                        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                            {selectedClient.strategySummary}
                        </p>
                    </div>
                )}
            </div>

            {/* Chat history placeholder */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-3 px-1">
                    Chat History
                </p>
                <div className="flex flex-col items-center justify-center gap-2 py-10 opacity-40">
                    <MessagesSquare className="w-6 h-6 text-neutral-600" />
                    <p className="text-xs text-neutral-600 text-center leading-relaxed">
                        Sessions will appear here
                    </p>
                </div>
            </div>
        </aside>
    );
}

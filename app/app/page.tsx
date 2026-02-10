'use client';

import { useState } from 'react';
import { Home, MessageSquare, BarChart3, Settings, Circle } from 'lucide-react';
import { mockClients, type RestaurantClient } from '@/lib/mockData';
import clsx from 'clsx';

export default function CraveOSApp() {
    const [selectedClient, setSelectedClient] = useState<RestaurantClient | null>(mockClients[0]);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-8 bg-void">
            {/* Floating Window Container */}
            <div className="w-full max-w-[1200px] h-[85vh] bg-gunmetal rounded-2xl border border-white/10 shadow-crave-glow overflow-hidden flex flex-col">

                {/* Crave Bar - Top Search/Command Input */}
                <div className="flex items-center border-b border-charcoal px-6 py-4">
                    <input
                        type="text"
                        placeholder="Ask Crave..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-sm"
                    />
                    <div className="flex items-center gap-2 ml-4">
                        <Circle className="w-2 h-2 fill-warning-yellow text-warning-yellow" />
                        <span className="text-xs text-white/60">AI: Online</span>
                    </div>
                </div>

                {/* 3-Column Grid Layout */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Column 1: Sidebar (60px) */}
                    <div className="w-[60px] bg-gunmetal border-r border-charcoal flex flex-col items-center py-6 gap-6">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-warning-yellow/10 text-warning-yellow hover:bg-warning-yellow/20 transition-colors">
                            <Home className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                        </button>
                        <div className="flex-1" />
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Column 2: Client List (400px) */}
                    <div className="w-[400px] bg-gunmetal border-r border-charcoal overflow-y-auto">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-bold text-white/60 uppercase tracking-wider">Clients</h2>
                                <span className="text-xs text-white/40">{mockClients.length}</span>
                            </div>

                            <div className="space-y-1">
                                {mockClients.map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => setSelectedClient(client)}
                                        className={clsx(
                                            'w-full text-left p-3 rounded-lg transition-all relative',
                                            selectedClient?.id === client.id
                                                ? 'bg-charcoal'
                                                : 'hover:bg-white/5'
                                        )}
                                    >
                                        {/* Yellow selection indicator */}
                                        {selectedClient?.id === client.id && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-warning-yellow rounded-r" />
                                        )}

                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-sm font-medium text-white">{client.name}</h3>
                                            <div className={clsx(
                                                'w-2 h-2 rounded-full',
                                                client.status === 'active' ? 'bg-green-500' :
                                                    client.status === 'paused' ? 'bg-yellow-500' :
                                                        'bg-gray-500'
                                            )} />
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-white/60">
                                            <span>${client.dailySpend}/day</span>
                                            <span>ROAS {client.roas}x</span>
                                        </div>

                                        <div className="mt-2 text-xs text-white/40">
                                            {client.lastUpdated}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Inspector/Brain (Remaining width) */}
                    <div className="flex-1 bg-void/50 overflow-y-auto">
                        {selectedClient ? (
                            <div className="p-6">
                                {/* Client Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-white tracking-wide">
                                            {selectedClient.name}
                                        </h1>
                                        <div className={clsx(
                                            'px-2 py-1 rounded text-xs font-medium',
                                            selectedClient.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                selectedClient.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                        )}>
                                            {selectedClient.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/40">Updated {selectedClient.lastUpdated}</p>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gunmetal border border-charcoal rounded-lg p-4">
                                        <div className="text-xs text-white/60 mb-1">Daily Spend</div>
                                        <div className="text-2xl font-bold text-white">${selectedClient.dailySpend}</div>
                                    </div>
                                    <div className="bg-gunmetal border border-charcoal rounded-lg p-4">
                                        <div className="text-xs text-white/60 mb-1">ROAS</div>
                                        <div className="text-2xl font-bold text-warning-yellow">{selectedClient.roas}x</div>
                                    </div>
                                </div>

                                {/* Strategy Summary */}
                                <div className="bg-gunmetal border border-charcoal rounded-lg p-4">
                                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                                        Strategy Summary
                                    </h3>
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        {selectedClient.strategySummary}
                                    </p>
                                </div>

                                {/* Chat/Brain Interface Placeholder */}
                                <div className="mt-6 bg-gunmetal border border-charcoal rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-4 h-4 text-warning-yellow" />
                                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                            Crave Brain
                                        </h3>
                                    </div>
                                    <div className="text-sm text-white/40 italic">
                                        Ask me anything about {selectedClient.name}'s performance...
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-white/20 mb-2">
                                        <Home className="w-12 h-12 mx-auto" />
                                    </div>
                                    <p className="text-sm text-white/40">Select a client to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="border-t border-charcoal px-6 py-3 bg-gunmetal">
                    <div className="flex items-center gap-6 text-xs text-white/40">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-charcoal rounded text-white/60">↵</kbd>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-charcoal rounded text-white/60">⌘K</kbd>
                            <span>Actions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-charcoal rounded text-white/60">ESC</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

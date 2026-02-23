'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
    const { setAmId } = useApp();
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        // Stub: derive am_id from name. Supabase Auth will replace this.
        const stubAmId = `am_${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
        setAmId(stubAmId);
        await new Promise((r) => setTimeout(r, 400));
        router.push('/workspace');
    };

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            {/* Ambient */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-yellow-950/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-sm"
            >
                <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <img
                            src="/images/DISHIO-LOGOTYPE-YELLOW.png"
                            alt="Dishio"
                            className="h-12 w-auto object-contain"
                        />
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Internal Growth Engine</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Nelson"
                                autoFocus
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || loading}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Entering…' : 'Enter Workspace'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-neutral-700 mt-6">
                        Auth stub — Supabase Auth coming in Week 4
                    </p>
                </div>
            </motion.div>
        </main>
    );
}

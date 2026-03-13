'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setError('');
        setLoading(true);
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            setError('Invalid email or password.');
            setLoading(false);
            return;
        }
        router.push('/workspace');
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Ambient glow — yellow, far bottom-left */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,217,0,0.06) 0%, transparent 70%)' }}
            />

            {/* Subtle grid texture overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-full max-w-[360px]"
            >
                {/* Logo mark */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img
                            src="/images/DISHIO-LOGOTYPE-YELLOW.png"
                            alt="Dishio"
                            className="h-6 w-auto object-contain"
                        />
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-600 uppercase tracking-[0.2em]">
                        Agency Platform
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d] shadow-[0_0_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden">

                    {/* Top accent stripe */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-dishio-yellow/30 to-transparent" />

                    <div className="px-7 py-8 space-y-5">

                        <div className="space-y-1 mb-6">
                            <h1 className="text-base font-semibold text-white">Sign in</h1>
                            <p className="text-xs text-neutral-500">Access your Dishio workspace</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 rounded-lg bg-red-500/8 border border-red-500/20 px-3.5 py-3 text-xs text-red-400"
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="you@agency.com"
                                autoComplete="email"
                                className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-dishio-yellow/50 focus:ring-1 focus:ring-dishio-yellow/20 transition-all duration-150"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="••••••••••"
                                autoComplete="current-password"
                                className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-dishio-yellow/50 focus:ring-1 focus:ring-dishio-yellow/20 transition-all duration-150"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleLogin}
                            disabled={loading || !email || !password}
                            className="group relative w-full mt-2 flex items-center justify-center gap-2 bg-dishio-yellow hover:bg-yellow-300 active:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 shadow-[0_0_24px_-6px_rgba(255,217,0,0.5)] disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-dishio-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-6 text-center text-[10px] text-neutral-700 font-medium uppercase tracking-widest">
                    Dishio AI — Internal Use Only
                </p>
            </motion.div>
        </div>
    );
}

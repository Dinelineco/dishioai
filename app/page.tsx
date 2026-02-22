'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const [launching, setLaunching] = useState(false);

    const handleLaunch = async () => {
        setLaunching(true);
        await new Promise((r) => setTimeout(r, 600));
        router.push('/workspace');
    };

    return (
        <AnimatePresence>
            {!launching && (
                <motion.main
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Ambient glow orbs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-yellow-900/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-yellow-950/10 rounded-full blur-[100px]" />
                    </div>

                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                            backgroundSize: '60px 60px',
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
                        {/* Wordmark */}
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-[80px] md:text-[110px] font-black tracking-tighter leading-none text-white uppercase italic">
                                Dishio<span className="text-dishio-yellow">.</span>AI
                            </h1>
                            <p className="max-w-md text-lg text-neutral-400 leading-relaxed font-medium">
                                Your Restaurant’s AI Growth Engine.
                            </p>
                        </div>

                        {/* CTA */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLaunch}
                            className="group mt-4 flex items-center gap-3 px-8 py-4 rounded-xl bg-dishio-yellow text-black font-black text-base tracking-tight shadow-[0_0_40px_-8px_rgba(255,217,0,0.4)] hover:shadow-[0_0_60px_-8px_rgba(255,217,0,0.6)] transition-all duration-300"
                        >
                            <Zap className="w-4 h-4 fill-black" />
                            Launch Workspace
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </motion.button>

                        <p className="text-xs text-neutral-600 tracking-wider uppercase font-bold">
                            Powered by Dishio AI
                        </p>
                    </div>
                </motion.main>
            )}
        </AnimatePresence>
    );
}

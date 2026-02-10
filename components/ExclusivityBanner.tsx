'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function ExclusivityBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40 bg-rebellion-red text-white py-3 px-4 shadow-lg"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex-1 text-center">
                    <p className="font-display text-sm md:text-base">
                        🇮🇹 Exclusive Menu: <span className="font-bold">February 1st – 28th Only</span> 🇮🇹
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close banner"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';

const PRESETS = [
    {
        label: 'Meeting Prep',
        message:
            'Prepare a comprehensive client meeting brief with recent performance highlights, key wins, and agenda items for our next strategy session.',
    },
    {
        label: '90 Day Plan',
        message:
            'Create a detailed 90-day marketing plan with campaign phases, budget allocation, creative milestones, and expected performance benchmarks.',
    },
    {
        label: 'Optimization Report',
        message:
            'Generate an optimization report analyzing current ad performance, identifying underperforming campaigns, and providing specific recommendations to improve ROAS.',
    },
    {
        label: 'Creative Request',
        message:
            'Draft a creative content request with campaign theme, target audience, key messaging, ad formats needed, and brand voice guidelines.',
    },
];

interface ActionPresetsProps {
    onSelect: (message: string) => void;
}

export function ActionPresets({ onSelect }: ActionPresetsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PRESETS.map((preset, i) => (
                <motion.button
                    key={preset.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelect(preset.message)}
                    className="shrink-0 px-4 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/60 text-neutral-300 text-xs font-medium tracking-wide hover:border-dishio-yellow/50 hover:bg-neutral-800 hover:text-white transition-all duration-150 cursor-pointer"
                >
                    {preset.label}
                </motion.button>
            ))}
        </div>
    );
}

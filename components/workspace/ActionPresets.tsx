'use client';

import { motion } from 'framer-motion';

const PRESETS = [
    {
        label: 'Meeting Prep',
        message:
            'Prepare a client meeting brief. Break down 30-day ad performance into three separate sections: (1) GOOGLE PMAX — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (2) GOOGLE SEARCH — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (3) META — spend, impressions, clicks, CTR, CPC, conversions, reach, and frequency. If any platform has no data, say so. Then show revenue trends — latest month vs prior months and year-over-year change. End with top 3 wins to highlight and 2-3 talking points for the meeting. Format as a structured brief.',
    },
    {
        label: '90 Day Plan',
        message:
            'Create a 90-day marketing plan using actual performance data. Start with a current baseline showing metrics for each campaign type separately: Google PMax, Google Search, and Meta. Then structure the plan as: Phase 1 (Days 1-30) — quick wins and optimizations per campaign type based on current numbers. Phase 2 (Days 31-60) — scaling top performers, testing underutilized channels. Phase 3 (Days 61-90) — revenue growth targets tied to POS trends. Set specific KPI targets for each phase broken out by Google PMax, Google Search, and Meta individually. Include revenue targets based on historical POS data.',
    },
    {
        label: 'Optimization Report',
        message:
            'Generate an optimization report with a side-by-side comparison of all three campaign types: Google PMax, Google Search, and Meta. For each, show: spend, CPC, CTR, conversions, cost-per-conversion, and conversion rate. Then analyze: (1) Which campaign type is most cost-efficient? (2) Which drives the most store visits? (3) Is Meta frequency too high (ad fatigue risk)? (4) Are there revenue correlations — do months with higher ad spend show higher POS revenue? Provide 3-5 specific recommendations ranked by impact, specifying which campaign type each applies to.',
    },
    {
        label: 'Creative Request',
        message:
            'Draft a creative request brief. First compare performance across Google PMax, Google Search, and Meta to identify what\'s working best. Then recommend: (1) Budget reallocation — how should spend shift between PMax, Search, and Meta based on current efficiency? (2) Creative needs per platform — PMax assets (headlines, descriptions, images, videos), Search ad copy (headlines, descriptions, extensions), and Meta creatives (feed images, Stories/Reels video specs). (3) Targeting adjustments based on reach and conversion data. (4) Specific deliverables list with dimensions and specs a creative team can action immediately.',
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

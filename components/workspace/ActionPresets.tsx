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
      'Generate a Dineline Advanced 30-Day Paid Media Optimization Report using campaign data from Google Performance Max, Google Search, and Meta Ads (Facebook & Instagram). The goal is to analyze campaign efficiency, identify growth opportunities, and recommend optimizations for the next 30-day cycle. The report MUST include ALL of the following 9 sections: (1) Campaign Performance Comparison — create a side-by-side comparison table for Google PMax, Google Search, and Meta Ads with Spend, Impressions, Clicks, CPC, CTR, Conversions, Cost per Conversion, and Conversion Rate, then summarize which platform produced the most conversions, lowest cost per conversion, and strongest CTR. (2) Campaign Efficiency Analysis — identify the most efficient channel (lowest cost per conversion with volume), highest conversion driver, and any inefficient spend where CPC is high, CTR is low, or cost per conversion is above average, explaining possible causes like targeting issues, keyword inefficiencies, creative fatigue, or audience saturation. (3) Budget Allocation Analysis — evaluate whether budget distribution across PMax, Search, and Meta is optimal, determine if budget should shift toward higher performers, if any campaign is overfunded, and recommend specific reallocations. (4) Google Search Opportunity Analysis — identify keyword expansion opportunities, high-performing keywords for increased bids, low-performing keywords needing negatives, and opportunities to capture higher intent searches. (5) Google Performance Max Analysis — evaluate if PMax drives incremental conversions efficiently, if CPC and conversion rates are in range, if PMax overlaps with Search traffic, and recommend asset group improvements, creative refreshes, audience signals, or budget adjustments. (6) Meta Ad Fatigue & Audience Saturation — evaluate frequency, CTR trends, and conversion trends to determine if frequency exceeds 3-4 within 30 days or if engagement is declining, then recommend creative refresh, new formats, expanded targeting, lookalikes, or restructuring. (7) Revenue & Spend Correlation — compare paid media spend with POS revenue, analyze if spend increases correspond to revenue increases, year-over-year comparison, and campaign-revenue alignment. If POS data is unavailable, state so clearly and focus on conversion trends and efficiency instead. (8) Key Insights — provide 3-5 key insights covering strongest platform, largest growth opportunity, budget inefficiencies, and audience or creative issues. (9) Optimization Recommendations Ranked by Impact — provide 3-5 recommendations each with Platform, Optimization Action, Reasoning, and Expected Outcome, focused on actions implementable in the next 30 days.',
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

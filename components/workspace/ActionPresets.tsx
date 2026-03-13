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
    label: 'Competitor Analysis',
    message:
      'Run a competitive analysis for this restaurant client. Based on their market and category, identify the key competitors they are likely up against locally. Analyze: (1) Where competitors are likely advertising — Google Search, PMax, Meta — and what messaging angles they use. (2) Where this client has a competitive edge in their current ad performance, offers, or positioning. (3) Any gaps in this client\'s strategy that competitors are likely exploiting — keywords, platforms, creative formats, or offers. (4) Three strategic recommendations to differentiate this client\'s marketing, strengthen their local market position, and capture more share. Format as a competitive intelligence brief with clear action items.',
  },
  {
    label: 'Ad Copy',
    message:
      'Generate a full batch of platform-optimized ad copy for this client. Produce: (1) Google Search — 5 headline variations (30 characters max) and 4 description variations (90 characters max) focused on high-intent local searches. (2) Google PMax — 5 short headlines, 5 long headlines (90 characters max), and 4 descriptions following asset group best practices. (3) Meta Ads — 3 primary text variations for feed ads, 2 headline options, and 2 link descriptions. All copy must reflect the restaurant\'s brand voice, lead with the strongest offer or differentiator, include a clear CTA, and be written to maximize CTR and conversions on each platform.',
  },
  {
    label: 'Revenue Analysis',
    message:
      'Analyze this client\'s revenue performance in depth. Cover: (1) Monthly revenue trend for the last available period vs prior period and year-over-year change. (2) Revenue correlation with ad spend — are spend increases driving measurable revenue lifts? (3) Best performing revenue periods and what campaigns or conditions drove them. (4) Any revenue slowdowns or gaps with likely causes based on the data. (5) Recommended revenue targets for the next 30 days based on historical trajectory and current ad performance. Format as a revenue intelligence report with a clear narrative and data-backed projections.',
  },
  {
    label: 'Campaign Audit',
    message:
      'Run a full campaign audit for this client across all active platforms. For each campaign — Google PMax, Google Search, and Meta — evaluate: what is working, what is underperforming, and what needs immediate action. Flag campaigns with high CPC but low conversions, declining CTR, high Meta frequency, or inefficient budget allocation. Score each campaign\'s health and prioritize findings by revenue impact. Deliver a structured audit with an overall account health score, top 3 urgent fixes, and a prioritized 7-day action list the account manager can execute immediately.',
  },
  {
    label: 'Growth Forecast',
    message:
      'Build a 30-day growth forecast for this client using current ad performance and POS trends. First project expected conversions, spend, and estimated revenue at the current trajectory. Then model two scenarios: (1) Optimized — same budget with the top 3 recommended optimizations applied, showing projected conversion lift, improved CPA, and estimated revenue gain. (2) Scale — increase budget by 20-30% on the highest-performing campaigns, showing projected reach, conversion volume, and ROAS. For each scenario include key assumptions, confidence level, and the specific actions needed to achieve the outcome.',
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

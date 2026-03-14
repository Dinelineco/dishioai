'use client';

import { motion } from 'framer-motion';
import {
  CalendarCheck, TrendingUp, BarChart3, Search,
  PenLine, DollarSign, ClipboardList, Rocket
} from 'lucide-react';

const PRESETS = [
  {
    label: 'Meeting Prep',
    icon: <CalendarCheck className="w-3 h-3" />,
    message: 'Prepare a client meeting brief. Break down 30-day ad performance into three separate sections: (1) GOOGLE PMAX — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (2) GOOGLE SEARCH — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (3) META — spend, impressions, clicks, CTR, CPC, conversions, reach, and frequency. If any platform has no data, say so. Then show revenue trends — latest month vs prior months and year-over-year change. End with top 3 wins to highlight and 2-3 talking points for the meeting. Format as a structured brief.',
  },
  {
    label: '90 Day Plan',
    icon: <TrendingUp className="w-3 h-3" />,
    message: 'Create a 90-day marketing plan using actual performance data. Start with a current baseline showing metrics for each campaign type separately: Google PMax, Google Search, and Meta. Then structure the plan as: Phase 1 (Days 1-30) — quick wins and optimizations per campaign type based on current numbers. Phase 2 (Days 31-60) — scaling top performers, testing underutilized channels. Phase 3 (Days 61-90) — revenue growth targets tied to POS trends. Set specific KPI targets for each phase broken out by Google PMax, Google Search, and Meta individually. Include revenue targets based on historical POS data.',
  },
  {
    label: 'Optimization Report',
    icon: <BarChart3 className="w-3 h-3" />,
    message: 'Generate a Dineline Advanced 30-Day Paid Media Optimization Report using campaign data from Google Performance Max, Google Search, and Meta Ads. Include all 9 sections: Campaign Performance Comparison, Campaign Efficiency Analysis, Budget Allocation Analysis, Google Search Opportunity Analysis, Google Performance Max Analysis, Meta Ad Fatigue & Audience Saturation, Revenue & Spend Correlation, Key Insights, and Optimization Recommendations Ranked by Impact.',
  },
  {
    label: 'Competitor Analysis',
    icon: <Search className="w-3 h-3" />,
    message: 'Run a competitive analysis for this restaurant client. Based on their market and category, identify the key competitors they are likely up against locally. Analyze: (1) Where competitors are likely advertising and what messaging angles they use. (2) Where this client has a competitive edge in their current ad performance, offers, or positioning. (3) Any gaps in this client\'s strategy that competitors are likely exploiting. (4) Three strategic recommendations to differentiate this client\'s marketing and capture more share. Format as a competitive intelligence brief with clear action items.',
  },
  {
    label: 'Ad Copy',
    icon: <PenLine className="w-3 h-3" />,
    message: 'Generate a full batch of platform-optimized ad copy for this client. Produce: (1) Google Search — 5 headline variations (30 characters max) and 4 description variations (90 characters max). (2) Google PMax — 5 short headlines, 5 long headlines (90 characters max), and 4 descriptions. (3) Meta Ads — 3 primary text variations, 2 headline options, and 2 link descriptions. All copy must reflect the restaurant\'s brand voice, lead with the strongest offer or differentiator, include a clear CTA, and be written to maximize CTR and conversions on each platform.',
  },
  {
    label: 'Revenue Analysis',
    icon: <DollarSign className="w-3 h-3" />,
    message: 'Analyze this client\'s revenue performance in depth. Cover: (1) Monthly revenue trend for the last available period vs prior period and year-over-year change. (2) Revenue correlation with ad spend. (3) Best performing revenue periods and what drove them. (4) Any revenue slowdowns or gaps with likely causes. (5) Recommended revenue targets for the next 30 days based on historical trajectory and current ad performance. Format as a revenue intelligence report.',
  },
  {
    label: 'Campaign Audit',
    icon: <ClipboardList className="w-3 h-3" />,
    message: 'Run a full campaign audit for this client across all active platforms. For each campaign — Google PMax, Google Search, and Meta — evaluate what is working, what is underperforming, and what needs immediate action. Flag campaigns with high CPC but low conversions, declining CTR, high Meta frequency, or inefficient budget allocation. Score each campaign\'s health and prioritize findings by revenue impact. Deliver a structured audit with an overall account health score, top 3 urgent fixes, and a prioritized 7-day action list.',
  },
  {
    label: 'Growth Forecast',
    icon: <Rocket className="w-3 h-3" />,
    message: 'Build a 30-day growth forecast for this client using current ad performance and POS trends. Project expected conversions, spend, and estimated revenue at the current trajectory. Then model two scenarios: (1) Optimized — same budget with the top 3 recommended optimizations applied. (2) Scale — increase budget by 20-30% on the highest-performing campaigns. For each scenario include key assumptions, confidence level, and the specific actions needed to achieve the outcome.',
  },
];

interface ActionPresetsProps {
  onSelect: (message: string) => void;
}

export function ActionPresets({ onSelect }: ActionPresetsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset, i) => (
          <motion.button
            key={preset.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            onClick={() => onSelect(preset.message)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap"
            style={{
              background: 'var(--s3)',
              border: '1px solid var(--b2)',
              color: 'var(--t2)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--s4)';
              el.style.borderColor = 'rgba(255,217,0,0.2)';
              el.style.color = 'var(--t1)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--s3)';
              el.style.borderColor = 'var(--b2)';
              el.style.color = 'var(--t2)';
            }}
          >
            <span style={{ color: 'var(--yellow)', opacity: 0.65 }}>{preset.icon}</span>
            {preset.label}
          </motion.button>
        ))}
    </div>
  );
}

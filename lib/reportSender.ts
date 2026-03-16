/**
 * reportSender.ts
 * Shared logic for running AI preset reports against n8n and posting to Slack.
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? ''

// ── Preset Registry ────────────────────────────────────────────────────────────
// Prompts mirror ActionPresets.tsx — update both if prompts change.
export const PRESET_REGISTRY: Record<string, { label: string; prompt: string }> = {
  meeting_prep: {
    label: 'Meeting Prep',
    prompt:
      'Prepare a client meeting brief. Break down 30-day ad performance into three separate sections: (1) GOOGLE PMAX — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (2) GOOGLE SEARCH — spend, impressions, clicks, CTR, CPC, conversions, conversion rate, and store visits. (3) META — spend, impressions, clicks, CTR, CPC, conversions, reach, and frequency. If any platform has no data, say so. Then show revenue trends — latest month vs prior months and year-over-year change. End with top 3 wins to highlight and 2-3 talking points for the meeting. Format as a structured brief.',
  },
  '90_day_plan': {
    label: '90 Day Plan',
    prompt:
      'Create a 90-day marketing plan using actual performance data. Start with a current baseline showing metrics for each campaign type separately: Google PMax, Google Search, and Meta. Then structure the plan as: Phase 1 (Days 1-30) — quick wins and optimizations per campaign type based on current numbers. Phase 2 (Days 31-60) — scaling top performers, testing underutilized channels. Phase 3 (Days 61-90) — revenue growth targets tied to POS trends. Set specific KPI targets for each phase broken out by Google PMax, Google Search, and Meta individually. Include revenue targets based on historical POS data.',
  },
  optimization_report: {
    label: 'Optimization Report',
    prompt:
      'Generate a Dineline Advanced 30-Day Paid Media Optimization Report using campaign data from Google Performance Max, Google Search, and Meta Ads. Include all 9 sections: Campaign Performance Comparison, Campaign Efficiency Analysis, Budget Allocation Analysis, Google Search Opportunity Analysis, Google Performance Max Analysis, Meta Ad Fatigue & Audience Saturation, Revenue & Spend Correlation, Key Insights, and Optimization Recommendations Ranked by Impact.',
  },
  competitor_analysis: {
    label: 'Competitor Analysis',
    prompt:
      "Run a competitive analysis for this restaurant client. Based on their market and category, identify the key competitors they are likely up against locally. Analyze: (1) Where competitors are likely advertising and what messaging angles they use. (2) Where this client has a competitive edge in their current ad performance, offers, or positioning. (3) Any gaps in this client's strategy that competitors are likely exploiting. (4) Three strategic recommendations to differentiate this client's marketing and capture more share. Format as a competitive intelligence brief with clear action items.",
  },
  ad_copy: {
    label: 'Ad Copy',
    prompt:
      "Generate a full batch of platform-optimized ad copy for this client. Produce: (1) Google Search — 5 headline variations (30 characters max) and 4 description variations (90 characters max). (2) Google PMax — 5 short headlines, 5 long headlines (90 characters max), and 4 descriptions. (3) Meta Ads — 3 primary text variations, 2 headline options, and 2 link descriptions. All copy must reflect the restaurant's brand voice, lead with the strongest offer or differentiator, include a clear CTA, and be written to maximize CTR and conversions on each platform.",
  },
  revenue_analysis: {
    label: 'Revenue Analysis',
    prompt:
      "Analyze this client's revenue performance in depth. Cover: (1) Monthly revenue trend for the last available period vs prior period and year-over-year change. (2) Revenue correlation with ad spend. (3) Best performing revenue periods and what drove them. (4) Any revenue slowdowns or gaps with likely causes. (5) Recommended revenue targets for the next 30 days based on historical trajectory and current ad performance. Format as a revenue intelligence report.",
  },
  campaign_audit: {
    label: 'Campaign Audit',
    prompt:
      "Run a full campaign audit for this client across all active platforms. For each campaign — Google PMax, Google Search, and Meta — evaluate what is working, what is underperforming, and what needs immediate action. Flag campaigns with high CPC but low conversions, declining CTR, high Meta frequency, or inefficient budget allocation. Score each campaign's health and prioritize findings by revenue impact. Deliver a structured audit with an overall account health score, top 3 urgent fixes, and a prioritized 7-day action list.",
  },
  growth_forecast: {
    label: 'Growth Forecast',
    prompt:
      'Build a 30-day growth forecast for this client using current ad performance and POS trends. Project expected conversions, spend, and estimated revenue at the current trajectory. Then model two scenarios: (1) Optimized — same budget with the top 3 recommended optimizations applied. (2) Scale — increase budget by 20-30% on the highest-performing campaigns. For each scenario include key assumptions, confidence level, and the specific actions needed to achieve the outcome.',
  },
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface BundleClient {
  clientCode: string
  name: string
}

export interface SendBundleOptions {
  bundleName: string
  presetKeys: string[]
  clients: BundleClient[]
  webhookUrl: string
}

export interface SendBundleResult {
  clientCount: number
  presetCount: number
  errors: string[]
}

// ── Core send function ─────────────────────────────────────────────────────────
export async function sendBundle(opts: SendBundleOptions): Promise<SendBundleResult> {
  const { bundleName, presetKeys, clients, webhookUrl } = opts
  const errors: string[] = []

  const validPresets = presetKeys
    .map(k => ({ key: k, ...PRESET_REGISTRY[k] }))
    .filter(p => p.label) // skip unknown keys

  for (const client of clients) {
    const sections: string[] = []

    for (const preset of validPresets) {
      try {
        const res = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: preset.prompt,
            client_code: client.clientCode,
          }),
        })
        if (!res.ok) {
          errors.push(`n8n error for ${client.name}/${preset.label}: ${res.status}`)
          sections.push(`*${preset.label}*\n_Could not generate report._`)
          continue
        }
        const data = await res.json()
        const answer = data.answer ?? data.text ?? 'No response'
        sections.push(`*${preset.label}*\n${answer}`)
      } catch (e: any) {
        errors.push(`fetch error for ${client.name}/${preset.label}: ${e.message}`)
        sections.push(`*${preset.label}*\n_Error generating report._`)
      }
    }

    // Post to Slack — one message per client
    const blocks = buildSlackBlocks(client.name, bundleName, sections)
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      })
    } catch (e: any) {
      errors.push(`Slack post failed for ${client.name}: ${e.message}`)
    }
  }

  return {
    clientCount: clients.length,
    presetCount: validPresets.length,
    errors,
  }
}

// ── Test Slack connection ──────────────────────────────────────────────────────
export async function testSlackWebhook(webhookUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '✅ *Dishio AI* — Slack connection successful! Your report bundles will be delivered here.',
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return { ok: false, error: `Slack returned ${res.status}: ${text}` }
    }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// ── Slack Block Kit builder ────────────────────────────────────────────────────
function buildSlackBlocks(clientName: string, bundleName: string, sections: string[]) {
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 ${clientName}`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Bundle: *${bundleName}* · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
        },
      ],
    },
    { type: 'divider' },
  ]

  for (const section of sections) {
    // Slack section blocks have a 3000-char limit — truncate if needed
    const text = section.length > 2900 ? section.substring(0, 2900) + '…' : section
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text },
    })
    blocks.push({ type: 'divider' })
  }

  return blocks
}

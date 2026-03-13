import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const admin = createServiceClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

/**
 * POST /api/admin/client-data/import
 * Manually import aggregate ad data for a client for a given date range.
 * Distributes totals evenly across days and upserts into google_ads table.
 *
 * Body: {
 *   client_code: string
 *   platform: 'google_ads' | 'meta_ads'
 *   campaign_type: 'PERFORMANCE_MAX' | 'SEARCH' | 'DISPLAY' | string
 *   campaign_name: string
 *   start_date: string  // YYYY-MM-DD
 *   end_date: string    // YYYY-MM-DD
 *   spend: number
 *   impressions: number
 *   clicks: number
 *   conversions: number
 *   store_visits?: number
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const auth = await requireAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const {
    client_code, platform, campaign_type, campaign_name,
    start_date, end_date,
    spend, impressions, clicks, conversions, store_visits = 0,
  } = body

  if (!client_code || !platform || !campaign_name || !start_date || !end_date) {
    return NextResponse.json({ error: 'Missing required fields: client_code, platform, campaign_name, start_date, end_date' }, { status: 400 })
  }

  // Build array of dates between start and end (inclusive)
  const dates: string[] = []
  const cur = new Date(start_date)
  const last = new Date(end_date)
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  const n = dates.length
  if (n === 0) return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })

  // Distribute evenly across days (integer for impressions/clicks, float for spend/conversions)
  const dailySpend = Math.round((spend / n) * 100) / 100
  const dailyImpressions = Math.round(impressions / n)
  const dailyClicks = Math.round(clicks / n)
  const dailyConversions = Math.floor(conversions / n)
  const dailyStoreVisits = Math.floor(store_visits / n)

  const rows = dates.map((date, i) => {
    // Distribute rounding remainder on last day
    const isLast = i === n - 1
    const daySpend = isLast ? Math.round((spend - dailySpend * (n - 1)) * 100) / 100 : dailySpend
    const dayImpressions = isLast ? impressions - dailyImpressions * (n - 1) : dailyImpressions
    const dayClicks = isLast ? clicks - dailyClicks * (n - 1) : dailyClicks
    const dayConversions = isLast ? conversions - dailyConversions * (n - 1) : dailyConversions
    const dayStoreVisits = isLast ? store_visits - dailyStoreVisits * (n - 1) : dailyStoreVisits

    const cpc = dayClicks > 0 ? Math.round((daySpend / dayClicks) * 1000) / 1000 : 0
    const ctr = dayImpressions > 0 ? Math.round((dayClicks / dayImpressions) * 10000) / 10000 : 0
    const roas = daySpend > 0 && dayConversions > 0 ? Math.round((dayConversions * 10 / daySpend) * 100) / 100 : 0

    return {
      client_code,
      date,
      platform,
      campaign_type: campaign_type ?? 'UNKNOWN',
      campaign_name,
      spend: daySpend,
      impressions: dayImpressions,
      clicks: dayClicks,
      conversions: dayConversions,
      store_visits: dayStoreVisits,
      cpc,
      ctr,
      roas,
    }
  })

  const admin = createServiceClient()

  // Delete existing rows for this client + campaign + date range to avoid duplicates
  await admin
    .from('google_ads')
    .delete()
    .eq('client_code', client_code)
    .eq('campaign_name', campaign_name)
    .gte('date', start_date)
    .lte('date', end_date)

  const { error } = await admin.from('google_ads').insert(rows)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    rows_inserted: rows.length,
    client_code,
    platform,
    campaign_name,
    period: `${start_date} → ${end_date}`,
    totals: { spend, impressions, clicks, conversions },
  })
}

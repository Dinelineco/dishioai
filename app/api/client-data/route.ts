import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientCode = searchParams.get('client_code');
  const days = parseInt(searchParams.get('days') ?? '30');

  if (!clientCode) return NextResponse.json({ error: 'client_code required' }, { status: 400 });

  const admin = createServiceClient();

  // 1. Summary KPIs via stored procedure
  const { data: summaryRaw } = await admin
    .rpc('get_client_summary', { p_client_code: clientCode, p_days: days });

  const summary = summaryRaw as {
    total_spend: number; total_clicks: number; total_impressions: number;
    total_conversions: number; total_store_visits: number; avg_roas: number;
    avg_cpc: number; avg_ctr: number; avg_cost_per_conversion: number;
    campaign_count: number; days_with_data: number;
    start_date: string; end_date: string; period_days: number;
  } | null;

  // 2. Platform breakdown for the period
  const startDate = summary?.start_date ?? new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const { data: platformRows } = await admin
    .from('google_ads')
    .select('platform, campaign_type, spend, impressions, clicks, conversions, roas, store_visits')
    .eq('client_code', clientCode)
    .gte('date', startDate);

  // Aggregate by platform
  const platformMap: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; store_visits: number; rows: number }> = {};
  const campaignTypeMap: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; rows: number }> = {};

  for (const row of (platformRows ?? []) as any[]) {
    const p = row.platform || 'unknown';
    if (!platformMap[p]) platformMap[p] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, store_visits: 0, rows: 0 };
    platformMap[p].spend += row.spend || 0;
    platformMap[p].impressions += row.impressions || 0;
    platformMap[p].clicks += row.clicks || 0;
    platformMap[p].conversions += row.conversions || 0;
    platformMap[p].store_visits += row.store_visits || 0;
    platformMap[p].rows++;

    const ct = row.campaign_type || 'UNKNOWN';
    if (!campaignTypeMap[ct]) campaignTypeMap[ct] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, rows: 0 };
    campaignTypeMap[ct].spend += row.spend || 0;
    campaignTypeMap[ct].impressions += row.impressions || 0;
    campaignTypeMap[ct].clicks += row.clicks || 0;
    campaignTypeMap[ct].conversions += row.conversions || 0;
    campaignTypeMap[ct].rows++;
  }

  // 3. Daily spend trend
  const { data: dailyRows } = await admin
    .from('google_ads')
    .select('date, spend, clicks, conversions, platform')
    .eq('client_code', clientCode)
    .gte('date', startDate)
    .order('date', { ascending: true });

  const dailyMap: Record<string, { date: string; spend: number; clicks: number; conversions: number }> = {};
  for (const row of (dailyRows ?? []) as any[]) {
    if (!dailyMap[row.date]) dailyMap[row.date] = { date: row.date, spend: 0, clicks: 0, conversions: 0 };
    dailyMap[row.date].spend += row.spend || 0;
    dailyMap[row.date].clicks += row.clicks || 0;
    dailyMap[row.date].conversions += row.conversions || 0;
  }
  const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // 4. Top campaigns
  const { data: campaignRows } = await admin
    .from('google_ads')
    .select('campaign_name, campaign_type, platform, spend, impressions, clicks, conversions, roas, cpc, ctr, store_visits')
    .eq('client_code', clientCode)
    .gte('date', startDate);

  const campMap: Record<string, any> = {};
  for (const row of (campaignRows ?? []) as any[]) {
    const key = row.campaign_name;
    if (!campMap[key]) {
      campMap[key] = {
        campaign_name: row.campaign_name,
        campaign_type: row.campaign_type,
        platform: row.platform,
        spend: 0, impressions: 0, clicks: 0, conversions: 0, store_visits: 0, rows: 0
      };
    }
    campMap[key].spend += row.spend || 0;
    campMap[key].impressions += row.impressions || 0;
    campMap[key].clicks += row.clicks || 0;
    campMap[key].conversions += row.conversions || 0;
    campMap[key].store_visits += row.store_visits || 0;
    campMap[key].rows++;
  }

  const campaigns = Object.values(campMap)
    .map((c: any) => ({
      ...c,
      cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
      ctr: c.impressions > 0 ? c.clicks / c.impressions : 0,
      roas: c.spend > 0 && c.conversions > 0 ? (c.conversions * 10) / c.spend : 0, // rough
    }))
    .sort((a: any, b: any) => b.spend - a.spend)
    .slice(0, 15);

  // 5. Revenue — last 6 months
  const { data: revenueRows } = await admin
    .from('revenue')
    .select('report_year, report_month, total_sales, num_orders, prev_year_sales, channel')
    .eq('client_code', clientCode)
    .eq('channel', 'total_sales')
    .order('report_year', { ascending: false })
    .order('report_month', { ascending: false })
    .limit(12);

  return NextResponse.json({
    client_code: clientCode,
    period_days: days,
    summary: summary ?? null,
    platform_breakdown: Object.entries(platformMap).map(([platform, data]) => ({ platform, ...data })),
    campaign_type_breakdown: Object.entries(campaignTypeMap).map(([type, data]) => ({ type, ...data })),
    daily_trend: dailyTrend,
    campaigns,
    revenue: (revenueRows ?? []).reverse(),
  });
}

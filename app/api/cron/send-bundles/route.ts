import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendBundle } from '@/lib/reportSender'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verify Vercel cron auth
  const authHeader = request.headers.get('Authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createServiceClient()
  const now = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[now.getUTCDay()]
  const currentHour = now.getUTCHours().toString().padStart(2, '0')
  const currentMinute = now.getUTCMinutes()
  // Round to nearest 30-min slot
  const timeSlot = currentMinute < 30 ? `${currentHour}:00` : `${currentHour}:30`

  // Fetch all scheduled bundles
  const { data: bundles, error } = await admin
    .from('report_bundles')
    .select('*')
    .eq('schedule_enabled', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const due = (bundles ?? []).filter((b: any) => {
    if (!b.schedule_time) return false
    if (b.schedule_day !== 'daily' && b.schedule_day !== currentDay) return false
    return b.schedule_time === timeSlot
  })

  const results = []

  for (const bundle of due) {
    try {
      // Load group clients
      let clientIds: string[] = []
      if (bundle.group_id) {
        const { data: group } = await admin
          .from('client_groups')
          .select('client_ids')
          .eq('id', bundle.group_id)
          .single()
        clientIds = group?.client_ids ?? []
      }

      if (clientIds.length === 0) {
        results.push({ bundleId: bundle.id, skipped: 'no clients' })
        continue
      }

      const { data: clientRows } = await admin
        .from('clients')
        .select('uuid, name, client_code')
        .in('uuid', clientIds)

      const clients = (clientRows ?? []).map((c: any) => ({
        clientCode: c.client_code ?? '',
        name: c.name,
      }))

      // Load user webhook
      const { data: profile } = await admin
        .from('profiles')
        .select('slack_webhook_url')
        .eq('id', bundle.user_id)
        .single()

      if (!profile?.slack_webhook_url) {
        results.push({ bundleId: bundle.id, skipped: 'no webhook' })
        continue
      }

      const result = await sendBundle({
        bundleName: bundle.name,
        presetKeys: bundle.preset_keys,
        clients,
        webhookUrl: profile.slack_webhook_url,
      })

      await admin
        .from('report_bundles')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', bundle.id)

      results.push({ bundleId: bundle.id, ...result })
    } catch (e: any) {
      results.push({ bundleId: bundle.id, error: e.message })
    }
  }

  return NextResponse.json({ processed: due.length, results })
}

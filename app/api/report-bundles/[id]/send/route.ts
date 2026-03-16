import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendBundle } from '@/lib/reportSender'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createServiceClient()

  // Load bundle
  const { data: bundle, error: bundleErr } = await admin
    .from('report_bundles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (bundleErr || !bundle) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })

  // Load group + client IDs
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
    return NextResponse.json({ error: 'No clients in this group. Add clients to the group first.' }, { status: 400 })
  }

  // Resolve client codes + names from clients table
  const { data: clientRows } = await admin
    .from('clients')
    .select('uuid, name, client_code')
    .in('uuid', clientIds)

  const clients = (clientRows ?? []).map((c: any) => ({
    clientCode: c.client_code ?? '',
    name: c.name,
  }))

  // Load user's Slack webhook
  const { data: profile } = await admin
    .from('profiles')
    .select('slack_webhook_url')
    .eq('id', user.id)
    .single()

  const webhookUrl = profile?.slack_webhook_url
  if (!webhookUrl) {
    return NextResponse.json({
      error: 'No Slack webhook configured. Go to Settings → Slack & Profile to add your webhook URL.',
    }, { status: 400 })
  }

  // Send
  const result = await sendBundle({
    bundleName: bundle.name,
    presetKeys: bundle.preset_keys,
    clients,
    webhookUrl,
  })

  // Update last_sent_at
  await admin
    .from('report_bundles')
    .update({ last_sent_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({
    success: true,
    clientCount: result.clientCount,
    presetCount: result.presetCount,
    errors: result.errors,
  })
}

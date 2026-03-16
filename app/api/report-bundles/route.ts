import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('report_bundles')
    .select('*, client_groups(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Flatten group name
  const bundles = (data ?? []).map((b: any) => ({
    ...b,
    group_name: b.client_groups?.name ?? null,
    client_groups: undefined,
  }))

  return NextResponse.json(bundles)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    name,
    group_id,
    preset_keys = [],
    schedule_enabled = false,
    schedule_day,
    schedule_time,
  } = await request.json()

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('report_bundles')
    .insert({
      user_id: user.id,
      name: name.trim(),
      group_id: group_id || null,
      preset_keys,
      schedule_enabled,
      schedule_day: schedule_day || null,
      schedule_time: schedule_time || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

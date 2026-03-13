import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  // Use service client to bypass RLS on profiles table
  const admin = createServiceClient()
  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET() {
  const supabase = await createClient()
  const auth = await requireAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('clients')
    .select('id, name, client_code, am_id, google_ads_id, meta_ads_id, toast_location_id, drive_folder_id, created_at')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const auth = await requireAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { name, client_code, am_id, google_ads_id, meta_ads_id, toast_location_id, drive_folder_id } = body
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const admin = createServiceClient()
  const { data: client, error } = await admin
    .from('clients')
    .insert({
      name,
      client_code: client_code || null,
      am_id: am_id || null,
      google_ads_id: google_ads_id || null,
      meta_ads_id: meta_ads_id || null,
      toast_location_id: toast_location_id || null,
      drive_folder_id: drive_folder_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, client })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const auth = await requireAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  // Only allow safe columns to be patched
  const allowed = ['name', 'client_code', 'am_id', 'google_ads_id', 'meta_ads_id', 'toast_location_id', 'drive_folder_id']
  const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)))
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const admin = createServiceClient()
  const { data: client, error } = await admin
    .from('clients')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, client })
}

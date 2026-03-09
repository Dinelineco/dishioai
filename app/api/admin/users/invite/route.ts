import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin-only route: invite a new user by email
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify the calling user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { email, role = 'viewer', clientIds = [], fullName } = body

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  // Use service role client for admin operations
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Send invite email
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept`
  const { data: invited, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    { redirectTo, data: { full_name: fullName ?? '' } }
  )

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Upsert profile with role
  await adminSupabase.from('profiles').upsert({
    id: invited.user.id,
    email,
    full_name: fullName ?? '',
    role,
    is_active: true,
    invited_by: user.id,
  })

  // Assign to specified clients
  if (clientIds.length > 0) {
    await adminSupabase.from('user_client_assignments').insert(
      clientIds.map((clientId: string) => ({
        user_id: invited.user.id,
        client_id: clientId,
        role: role === 'admin' ? 'manager' : role,
        assigned_by: user.id,
      }))
    )
  }

  // Audit log
  await adminSupabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'user.invite',
    target_type: 'user',
    target_id: invited.user.id,
    metadata: { email, role, clientIds },
  })

  return NextResponse.json({ success: true, userId: invited.user.id })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
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

  // Fetch profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch auth users to get confirmed_at / last_sign_in_at
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 200 })
  const authMap = new Map(authList?.users?.map(u => [u.id, u]) ?? [])

  const enriched = (profiles ?? []).map(p => {
    const authUser = authMap.get(p.id)
    return {
      ...p,
      confirmed_at: authUser?.confirmed_at ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      invited_at: authUser?.invited_at ?? null,
    }
  })

  return NextResponse.json(enriched)
}

// DELETE /api/admin/users  { userId }
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const auth = await requireAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  // Prevent self-deletion
  const callerUser = 'user' in auth ? auth.user : null
  if (userId === callerUser?.id) {
    return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 })
  }

  const admin = createServiceClient()

  // Delete from Supabase Auth (cascades to profiles via FK if set, otherwise manual)
  const { error: authError } = await admin.auth.admin.deleteUser(userId)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Delete profile row (in case there's no cascade)
  await admin.from('profiles').delete().eq('id', userId)

  return NextResponse.json({ success: true })
}

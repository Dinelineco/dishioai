import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Admin-only route: invite a new user by email
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify the calling user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client to bypass RLS on profiles table
  const adminCheck = createServiceClient()
  const { data: profile } = await adminCheck
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { email, role = 'viewer', fullName } = body

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const admin = createServiceClient()

  // Send invite email
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept`
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    { redirectTo, data: { full_name: fullName ?? '' } }
  )

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Upsert profile with role
  const { error: profileError } = await admin.from('profiles').upsert({
    id: invited.user.id,
    email,
    full_name: fullName ?? '',
    role,
    is_active: true,
    invited_by: user.id,
  })

  if (profileError) {
    console.error('Profile upsert error:', profileError.message)
    // Non-fatal — user was still invited
  }

  return NextResponse.json({ success: true, userId: invited.user.id })
}

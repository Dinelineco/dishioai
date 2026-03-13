import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  // Read Bearer token from Authorization header — no cookie dependency, no Web Lock conflict
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '').trim();

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();

  // Verify the token and get the user (server-to-server call, no Web Lock)
  const { data: { user }, error: authError } = await admin.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile via service role (bypasses RLS)
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? null,
      role: 'viewer',
      is_active: true,
    });
  }

  return NextResponse.json({
    ...profile,
    email: profile.email || user.email || '',
  });
}

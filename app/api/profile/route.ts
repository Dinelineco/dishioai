import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  // Auth check via server client
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile via service role (bypasses RLS)
  const admin = createServiceClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // Return a minimal profile from auth user if no DB row exists
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email ?? '',
      full_name: session.user.user_metadata?.full_name ?? null,
      role: 'viewer',
      is_active: true,
    });
  }

  // Merge email from auth if missing in profile
  return NextResponse.json({
    ...profile,
    email: profile.email || session.user.email || '',
  });
}

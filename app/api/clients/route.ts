import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  // Read Bearer token from Authorization header — no cookie/lock dependency
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '').trim();

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();

  // Verify the token
  const { data: { user }, error: authError } = await admin.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all clients via service role — bypasses RLS (am_id filtering)
  const { data, error } = await admin
    .from('clients')
    .select('id, uuid, name, client_code')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clients = (data ?? []).map((c: any) => ({
    id: c.uuid ?? String(c.id),
    clientCode: c.client_code ?? '',
    name: c.name,
  }));

  return NextResponse.json(clients);
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '50');

  const admin = createServiceClient();

  // Get recent user messages — each is a "session opener"
  const { data, error } = await admin
    .from('conversations')
    .select('id, client_code, client_name, content, created_at')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group into sessions: same client_code within 30 min = same session
  type RawRow = { id: string; client_code: string; client_name: string; content: string; created_at: string };
  type Session = { id: string; client_code: string; client_name: string; first_message: string; started_at: string; message_count: number };

  const sessions: Session[] = [];
  const rows = (data ?? []) as RawRow[];

  for (const row of rows) {
    const rowTime = new Date(row.created_at).getTime();
    const existing = sessions.find(s =>
      s.client_code === row.client_code &&
      Math.abs(new Date(s.started_at).getTime() - rowTime) < 30 * 60 * 1000
    );
    if (existing) {
      existing.message_count++;
      // Keep earliest message as session opener
      if (new Date(row.created_at) < new Date(existing.started_at)) {
        existing.started_at = row.created_at;
        existing.first_message = row.content;
        existing.id = row.id;
      }
    } else {
      sessions.push({
        id: row.id,
        client_code: row.client_code,
        client_name: row.client_name || row.client_code,
        first_message: row.content,
        started_at: row.created_at,
        message_count: 1,
      });
    }
  }

  return NextResponse.json(sessions.slice(0, 20));
}

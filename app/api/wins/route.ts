import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientCode = searchParams.get('client_code')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const admin = createServiceClient()

    let query = admin
      .from('wins')
      .select('id, created_at, client_code, client_name, win_type, title, description, metric_value, metric_unit, slack_user, posted_at')
      .order('posted_at', { ascending: false })
      .limit(limit)

    // Filter by client if not 'all'
    if (clientCode && clientCode !== 'all' && clientCode !== 'ALL') {
      query = query.eq('client_code', clientCode)
    }

    const { data, error } = await query

    if (error) {
      // Table may not exist yet — return empty array gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err: any) {
    console.error('wins route error:', err)
    return NextResponse.json([], { status: 200 }) // Graceful fallback
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { client_code, client_name, win_type, title, description, metric_value, metric_unit } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('wins')
      .insert({
        client_code: client_code || null,
        client_name: client_name || null,
        win_type: win_type || 'other',
        title: title.trim(),
        description: description || null,
        metric_value: metric_value ? parseFloat(metric_value) : null,
        metric_unit: metric_unit || null,
        raw_message: title.trim(),
        slack_user: session.user.email || session.user.id,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Wins table not set up yet. Run the SQL from the Slack DM.' }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('wins POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

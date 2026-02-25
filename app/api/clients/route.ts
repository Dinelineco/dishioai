import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function GET(_req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=client_code,name,am_id,status&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const clients = await response.json();

    // Map Supabase columns to the RestaurantClient shape the frontend expects
    const mapped = clients.map((c: any) => ({
      id: c.client_code,
      clientCode: c.client_code,
      name: c.name,
      dailySpend: 0,
      roas: 0,
      strategySummary: '',
      status: (c.status as 'active' | 'paused' | 'pending') ?? 'active',
      lastUpdated: 'live',
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

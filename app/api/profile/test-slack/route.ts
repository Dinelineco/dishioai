import { NextRequest, NextResponse } from 'next/server'
import { testSlackWebhook } from '@/lib/reportSender'

export async function POST(request: NextRequest) {
  const { webhookUrl } = await request.json()
  if (!webhookUrl) return NextResponse.json({ ok: false, error: 'webhookUrl is required' }, { status: 400 })
  const result = await testSlackWebhook(webhookUrl)
  return NextResponse.json(result)
}

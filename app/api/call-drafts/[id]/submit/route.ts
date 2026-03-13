import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN!
const CLICKUP_LIST_ID = '901310096745' // WORK REQUESTS > Media Buying

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()

  // Fetch the draft
  const { data: draft, error: fetchError } = await supabase
    .from('call_drafts')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  // Use incoming body overrides if provided (user may have edited in UI)
  const title = body.clickup_title || draft.clickup_title
  const description = body.clickup_description || draft.clickup_description

  // Post to ClickUp
  const clickupRes = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
    method: 'POST',
    headers: {
      'Authorization': CLICKUP_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: title,
      description: description,
      status: 'to do',
      priority: draft.urgency === 'immediate' ? 1 : draft.urgency === 'this_week' ? 2 : 3,
      notify_all: false,
    }),
  })

  if (!clickupRes.ok) {
    const errText = await clickupRes.text()
    return NextResponse.json({ error: `ClickUp error: ${errText}` }, { status: 500 })
  }

  const clickupTask = await clickupRes.json()

  // Update draft status to submitted
  const { error: updateError } = await supabase
    .from('call_drafts')
    .update({
      status: 'submitted',
      clickup_task_id: clickupTask.id,
      clickup_title: title,
      clickup_description: description,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    clickup_task_id: clickupTask.id,
    clickup_url: clickupTask.url,
  })
}

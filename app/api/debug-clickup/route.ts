import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.CLICKUP_API_TOKEN

  const tokenInfo = token
    ? {
        set: true,
        length: token.length,
        preview: `${token.substring(0, 6)}...${token.substring(token.length - 4)}`,
        startsWithPk: token.startsWith('pk_'),
      }
    : { set: false }

  // Test the token against ClickUp API
  let clickupTest: any = null
  if (token) {
    try {
      const res = await fetch('https://api.clickup.com/api/v2/user', {
        headers: { Authorization: token },
      })
      const body = await res.text()
      if (res.ok) {
        const data = JSON.parse(body)
        clickupTest = { ok: true, status: res.status, user: data?.user?.username || data?.user?.email }
      } else {
        clickupTest = { ok: false, status: res.status, body: body.substring(0, 300) }
      }
    } catch (err: any) {
      clickupTest = { ok: false, error: err.message }
    }
  }

  return NextResponse.json({
    env: tokenInfo,
    clickupTest,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
  })
}

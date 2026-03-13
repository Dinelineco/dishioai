import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Exact-match public routes
const PUBLIC_EXACT = ['/', '/login', '/account-locked']

// Prefix-match public routes (anything starting with these)
const PUBLIC_PREFIX = ['/auth/callback', '/invite/accept', '/api']

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PREFIX.some((p) => pathname.startsWith(p))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Public paths pass through without auth
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Protected routes: refresh session, check auth
  try {
    const { supabaseResponse, user } = await updateSession(request)

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return supabaseResponse
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

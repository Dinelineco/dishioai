import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = ['/login', '/auth/callback', '/invite/accept', '/account-locked']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  try {
    const { supabaseResponse, supabase, user } = await updateSession(request)

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Gracefully handle missing profiles table (pre-migration)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      if (profile && !profile.is_active) {
        return NextResponse.redirect(new URL('/account-locked', request.url))
      }

      if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/workspace', request.url))
      }
    } catch {
      // profiles table not yet created — allow through (run migration.sql to enable)
    }

    return supabaseResponse
  } catch {
    // Auth error — allow through to avoid hard blocking
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

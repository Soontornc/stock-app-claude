import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { PUBLIC_AUTH_PATHS } from '@/lib/auth-paths'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_AUTH_PATHS.includes(pathname)
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

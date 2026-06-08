import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bulletproof JWT decoder for Edge Runtime environments
function decodeJwt(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  const protectedPaths = ['/student', '/teacher', '/principal', '/super_admin']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  // 1. Route guard protection
  if (isProtected) {
    if (!token) {
      // If access token is missing but they have a refresh token,
      // let the request pass so the frontend's apiFetch can intercept the 401
      // and silently refresh the session!
      const refreshToken = request.cookies.get('refresh_token')?.value
      if (refreshToken) {
        return NextResponse.next()
      }
      
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    const payload = decodeJwt(token)
    if (payload && payload.role) {
      const role = payload.role.toLowerCase()
      const dashboardPrefix = `/${role}`
      
      // Prevent role escalation/crossover access (e.g. teacher visiting student page)
      if (!pathname.startsWith(dashboardPrefix)) {
        return NextResponse.redirect(new URL(dashboardPrefix, request.url))
      }
    } else {
      // If token is invalid or malformed, but they have a refresh token, let frontend handle it
      const refreshToken = request.cookies.get('refresh_token')?.value
      if (refreshToken) {
        return NextResponse.next()
      }
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Prevent logged in users from returning to login page
  if (pathname === '/login' && token) {
    const payload = decodeJwt(token)
    if (payload && payload.role) {
      const role = payload.role.toLowerCase()
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/principal/:path*', '/super_admin/:path*', '/login'],
}

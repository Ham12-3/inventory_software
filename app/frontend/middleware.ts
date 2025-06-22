import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Since we're using localStorage for tokens (client-side only),
  // we can't check authentication on the server side.
  // We'll handle authentication redirects on the client side instead.
  
  // Only redirect from root to dashboard for better UX
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware on root path
  matcher: ['/'],
} 
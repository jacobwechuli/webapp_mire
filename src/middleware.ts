import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/overview',
  '/savings',
  '/profile',
  '/settings',
  '/tutorials',
];

// Routes that should redirect to overview if already authenticated
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // For now, let Firebase handle authentication on the client side
  // The middleware will only handle basic routing without authentication checks
  // This prevents the white page issue when users are authenticated
  
  // If accessing auth routes, allow them (Firebase will handle redirects)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If accessing protected routes, allow them (Firebase will handle auth checks)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For API routes that require authentication, we'll handle this in the API routes themselves
  if (pathname.startsWith('/api/') && 
      !pathname.startsWith('/api/health') && 
      !pathname.startsWith('/api/suggest-budget')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 
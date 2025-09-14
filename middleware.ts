import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/super-admin': ['super-admin'],
  '/admin': ['super-admin', 'admin'],
  '/doctor': ['super-admin', 'doctor'],
  '/pharmacy': ['super-admin', 'pharmacy'],
  '/staff': ['super-admin', 'staff'],
  '/receptionist': ['super-admin', 'receptionist'],
  '/api/admin': ['super-admin', 'admin'],
  '/api/doctor': ['super-admin', 'doctor'],
  '/api/pharmacy': ['super-admin', 'pharmacy'],
  '/api/patients': ['super-admin', 'admin', 'doctor', 'staff', 'receptionist'],
  '/api/staff': ['super-admin', 'staff'],
  '/api/receptionist': ['super-admin', 'receptionist']
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

// Check if we're in a static build context
function isStaticBuild() {
  return process.env.NEXT_STATIC_BUILD === 'true' || 
         process.env.STATIC_BUILD === 'true' || 
         process.env.NEXT_PHASE === 'phase-export' ||
         process.env.NEXT_PHASE === 'phase-production-build' ||
         process.env.NODE_ENV === 'production';
}

export async function middleware(request: NextRequest) {
  // Always bypass middleware during build
  if (isStaticBuild()) {
    return NextResponse.next();
  }
  
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  )

  if (!protectedRoute) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'unauthorized')
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string

    // Check if user has required role for this route
    const requiredRoles = PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES]
    
    if (!requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      const redirectUrl = getRoleBasedRedirect(userRole)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-email', payload.email as string)

    return response

  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'session-expired')
    
    // Clear invalid token
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('auth-token')
    
    return response
  }
}

function getRoleBasedRedirect(role: string): string {
  const roleRedirects: Record<string, string> = {
    'super-admin': '/super-admin',
    'admin': '/admin',
    'doctor': '/doctor',
    'pharmacy': '/pharmacy',
    'staff': '/staff',
    'receptionist': '/receptionist'
  }
  
  return roleRedirects[role] || '/login'
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Include API routes in the matcher but with custom handling for build/export
    '/api/:path*'
  ],
}

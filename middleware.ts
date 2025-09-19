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
  '/nurse': ['super-admin', 'nurse'],
  '/receptionist': ['super-admin', 'receptionist'],
  '/api/admin': ['super-admin', 'admin'],
  '/api/doctor': ['super-admin', 'doctor'],
  '/api/pharmacy': ['super-admin', 'pharmacy'],
  '/api/patients': ['super-admin', 'admin', 'doctor', 'staff', 'nurse', 'receptionist'],
  '/api/staff': ['super-admin', 'staff', 'nurse'],
  '/api/nurse': ['super-admin', 'nurse'],
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
  return process.env.NEXT_PHASE === 'phase-export' ||
         process.env.NEXT_PHASE === 'phase-production-build';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`[MIDDLEWARE] Processing request: ${pathname}`)

  // Only bypass middleware during static build, not in development
  if (isStaticBuild()) {
    console.log(`[MIDDLEWARE] Static build detected, bypassing`)
    return NextResponse.next();
  }

  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/public/') ||
    (pathname.includes('.') && !pathname.startsWith('/api/')) ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    console.log(`[MIDDLEWARE] Skipping middleware for: ${pathname}`)
    return NextResponse.next()
  }

  // Check if the route is protected
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  )

  if (!protectedRoute) {
    console.log(`[MIDDLEWARE] Route not protected: ${pathname}`)
    return NextResponse.next()
  }

  console.log(`[MIDDLEWARE] Checking protected route: ${pathname}`)

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  const allCookies = request.cookies.getAll()
  console.log(`[MIDDLEWARE] All cookies:`, allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
  console.log(`[MIDDLEWARE] Auth token found:`, !!token)

  if (!token) {
    console.log(`[MIDDLEWARE] No auth token found, redirecting to login`)
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'unauthorized')
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  console.log(`[MIDDLEWARE] Token found, verifying...`)

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string
    const userId = payload.userId as string
    
    console.log(`[MIDDLEWARE] JWT verified successfully`)
    console.log(`[MIDDLEWARE] User role: ${userRole}`)
    console.log(`[MIDDLEWARE] Protected route: ${protectedRoute}`)

    // Additional schedule validation for nurses accessing nurse routes
    if (userRole === 'nurse' && pathname.startsWith('/nurse')) {
      console.log(`[MIDDLEWARE] Validating nurse schedule for user: ${userId}`)
      
      try {
        // Quick schedule validation (only for nurse dashboard access)
        const scheduleValidation = await fetch(`${request.nextUrl.origin}/api/auth/validate-schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, role: userRole })
        })
        
        if (scheduleValidation.ok) {
          const scheduleResult = await scheduleValidation.json()
          
          if (!scheduleResult.canLogin) {
            console.log(`[MIDDLEWARE] Nurse schedule validation failed: ${scheduleResult.message}`)
            // Redirect to login with schedule error
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('message', 'schedule-restriction')
            loginUrl.searchParams.set('details', scheduleResult.message)
            
            // Clear invalid session
            const response = NextResponse.redirect(loginUrl)
            response.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
            return response
          }
        }
      } catch (scheduleError) {
        console.error(`[MIDDLEWARE] Schedule validation error:`, scheduleError)
        // Continue with normal flow if schedule validation fails
      }
    }

    // Check if user has required role for this route
    const requiredRoles = PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES]
    console.log(`[MIDDLEWARE] Required roles: ${requiredRoles}`)
    
    if (!requiredRoles.includes(userRole)) {
      console.log(`[MIDDLEWARE] Role ${userRole} not in required roles ${requiredRoles}`)
      // Redirect to appropriate dashboard based on user role
      const redirectUrl = getRoleBasedRedirect(userRole)
      console.log(`[MIDDLEWARE] Redirecting to: ${redirectUrl}`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    console.log(`[MIDDLEWARE] Access granted for ${userRole} to ${pathname}`)
    
    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', userId)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-email', payload.email as string)

    return response

  } catch (error) {
    console.log(`[MIDDLEWARE] JWT verification failed:`, error)
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'session-expired')
    
    // Clear invalid token
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
    
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
    'nurse': '/nurse',
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/admin/:path*',
    '/doctor/:path*',
    '/pharmacy/:path*',
    '/staff/:path*',
    '/nurse/:path*',
    '/receptionist/:path*',
    '/super-admin/:path*',
    '/api/admin/:path*',
    '/api/doctor/:path*',
    '/api/pharmacy/:path*',
    '/api/staff/:path*',
    '/api/nurse/:path*',
    '/api/receptionist/:path*'
  ],
}

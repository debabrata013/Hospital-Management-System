"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  requiredPermission?: string | string[]
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { authState } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for auth state to be determined
    if (!authState.isLoading) {
      setIsChecking(false)
    }
  }, [authState.isLoading])

  // Show loading while checking authentication
  if (isChecking || authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verifying Access</h3>
            <p className="text-gray-600 text-center">
              Please wait while we verify your authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    router.push(fallbackPath)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Shield className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 text-center mb-4">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const userRole = authState.user.role
    
    if (!roles.includes(userRole) && userRole !== 'super-admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You don't have permission to access this page.
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  <strong>Your Role:</strong> {userRole}<br />
                  <strong>Required Role:</strong> {roles.join(' or ')}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => router.push(getRoleBasedRedirect(userRole))}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Check permission requirements
  if (requiredPermission && authState.user.permissions) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    const userPermissions = authState.user.permissions
    
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission) || 
      userPermissions.includes('all') ||
      authState.user.role === 'super-admin'
    )
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Insufficient Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You don't have the required permissions to access this feature.
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  <strong>Required:</strong> {permissions.join(' or ')}<br />
                  <strong>Your Permissions:</strong> {userPermissions.join(', ')}
                </p>
              </div>
              <Button 
                onClick={() => router.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

function getRoleBasedRedirect(role: string): string {
  const roleRedirects: Record<string, string> = {
    'super-admin': '/super-admin',
    'admin': '/admin',
    'doctor': '/doctor',
    'pharmacy': '/pharmacy',
    'patient': '/patient',
    'staff': '/staff',
    'receptionist': '/receptionist'
  }
  
  return roleRedirects[role] || '/'
}

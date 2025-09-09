"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LogOut, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  showText = true,
  className = ''
}: LogoutButtonProps) {
  const { logout, authState } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast.success('Successfully logged out')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showIcon && <LogOut className="h-4 w-4" />}
              {showText && (
                <span className={showIcon ? 'ml-2' : ''}>
                  Logout
                </span>
              )}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-orange-500" />
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout? You will need to login again to access your dashboard.
            {authState.user && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Current Session:</strong><br />
                User: {authState.user.name}<br />
                Role: {authState.user.role}<br />
                Email: {authState.user.email}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Yes, Logout
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Quick logout button without confirmation (for emergency use)
export function QuickLogoutButton({ className = '' }: { className?: string }) {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleQuickLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error('Quick logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickLogout}
      disabled={isLoggingOut}
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      title="Quick Logout"
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  )
}

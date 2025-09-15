import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  mobile?: string
  role: string
  department?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    // Check if user is authenticated by checking for auth token or session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setAuthState({
            user: userData.user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout anyway
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      window.location.href = '/login'
    }
  }

  return {
    ...authState,
    logout
  }
}

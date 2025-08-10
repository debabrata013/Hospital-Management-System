"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Mail, 
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, authState } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle URL messages
  const message = searchParams.get('message')
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null)

  useEffect(() => {
    if (message) {
      switch (message) {
        case 'registration-pending':
          setAlertMessage({
            type: 'info',
            text: 'Registration successful! Your account is pending approval. You will be notified once approved.'
          })
          break
        case 'password-reset-success':
          setAlertMessage({
            type: 'success',
            text: 'Password reset successful! You can now login with your new password.'
          })
          break
        case 'session-expired':
          setAlertMessage({
            type: 'error',
            text: 'Your session has expired. Please login again.'
          })
          break
        case 'unauthorized':
          setAlertMessage({
            type: 'error',
            text: 'Please login to access this page.'
          })
          break
        default:
          break
      }
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login(formData)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const redirectPath = getRedirectPath(authState.user.role)
      router.push(redirectPath)
    }
  }, [authState.isAuthenticated, authState.user, router])

  const getRedirectPath = (role: string): string => {
    const roleRedirects: Record<string, string> = {
      'super-admin': '/super-admin',
      'admin': '/admin',
      'doctor': '/doctor',
      'staff': '/admin',
      'receptionist': '/admin',
      'patient': '/patient'
    }

    return roleRedirects[role] || '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your आरोग्य अस्पताल account</p>
        </div>

        {/* Alert Messages */}
        {alertMessage && (
          <Alert className={`mb-6 ${
            alertMessage.type === 'success' ? 'border-green-200 bg-green-50' :
            alertMessage.type === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : alertMessage.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={
              alertMessage.type === 'success' ? 'text-green-700' :
              alertMessage.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            }>
              {alertMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {authState.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {authState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-pink-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-pink-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 pr-10 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                    className="border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-pink-500 hover:text-pink-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={authState.isLoading}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-2.5"
              >
                {authState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Quick Login Options */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">Quick login for demo:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        email: "doctor@hospital.com",
                        password: "Doctor@123",
                        rememberMe: false
                      })
                    }}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 text-xs"
                  >
                    Demo Doctor
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        email: "patient@hospital.com",
                        password: "Patient@123",
                        rememberMe: false
                      })
                    }}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 text-xs"
                  >
                    Demo Patient
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-pink-500 hover:text-pink-600 font-medium">
              Create one here
            </Link>
          </p>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8 p-4 bg-white/50 rounded-lg border border-pink-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Contact support: support@hospital.com</p>
            <p>• Emergency: +91 9876543210</p>
            <p>• Office hours: 9 AM - 6 PM (Mon-Sat)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

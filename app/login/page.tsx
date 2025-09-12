"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Phone
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, authState } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: ""
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login({
        login: formData.mobileNumber,
        password: formData.password
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred during login.");
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      'staff': '/staff',
      'receptionist': '/receptionist',
      'patient': '/patient',
      'pharmacy': '/pharmacy'
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
          <p className="text-gray-600">Sign in to your NMSC account</p>
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
              Enter your mobile number and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center text-gray-700">
                  <Phone className="h-4 w-4 mr-2 text-pink-500" />
                  Mobile Number
                </Label>
                <div className="relative">
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    className={`pl-10 ${errors.mobileNumber ? 'border-red-500' : 'border-pink-200 focus:border-pink-400 focus:ring-pink-400'}`}
                    maxLength={10}
                    required
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.mobileNumber && <p className="text-xs text-red-500">{errors.mobileNumber}</p>}
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
                ) : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

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

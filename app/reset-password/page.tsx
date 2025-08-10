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
  ArrowLeft, 
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { useAuth, useTokenVerification } from "@/hooks/useAuth"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  
  const token = searchParams.get('token')
  const { isValid, isLoading: tokenLoading, userData } = useTokenVerification(token)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!token) {
      setErrors({ general: "Invalid reset token" })
      return
    }

    try {
      setIsLoading(true)
      setErrors({})
      
      await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
    } catch (error) {
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number and special character"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
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

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  // Show loading while verifying token
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-pink-100 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">Verifying Reset Link</h3>
                <p className="text-gray-600">Please wait while we verify your password reset link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (!token || isValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Error Card */}
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-gray-900">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  The password reset link you clicked is either invalid, expired, or has already been used.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">Possible reasons:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>The link has expired (links expire after 30 minutes)</li>
                    <li>The link has already been used</li>
                    <li>A newer reset request was made</li>
                    <li>The link was copied incorrectly</li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-3">
                  <Link href="/forgot-password">
                    <Button className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white">
                      Request New Reset Link
                    </Button>
                  </Link>
                  
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-pink-200 text-pink-600 hover:bg-pink-50">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Create a new password for your account</p>
        </div>

        {/* User Info Alert */}
        {userData && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Resetting password for <strong>{userData.email}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errors.general && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        {/* Reset Password Form */}
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Create New Password</CardTitle>
            <CardDescription>
              Your new password must be different from your previous password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-pink-500" />
                  New Password
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
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength 
                              ? strengthColors[passwordStrength - 1] 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                  </div>
                )}
                
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-pink-500" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 pr-10 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-3 w-3 mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One lowercase letter
                  </li>
                  <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-3 w-3 mr-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One number
                  </li>
                  <li className={`flex items-center ${/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-2.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Security Notice</h3>
              <p className="text-xs text-yellow-700">
                After resetting your password, you'll be automatically signed out of all devices for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

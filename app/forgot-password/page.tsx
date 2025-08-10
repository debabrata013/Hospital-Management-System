"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  ArrowLeft, 
  Mail,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      await forgotPassword({ email })
      setIsSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setEmail(value)
    if (error) {
      setError("")
    }
  }

  if (isSuccess) {
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

          {/* Success Card */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-gray-900">Check Your Email</CardTitle>
              <CardDescription>
                We've sent password reset instructions to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  If an account with <strong>{email}</strong> exists, you will receive a password reset link shortly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">What to do next:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Check your email inbox for the reset link</li>
                    <li>Check your spam/junk folder if you don't see it</li>
                    <li>Click the link in the email to reset your password</li>
                    <li>The link will expire in 30 minutes for security</li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                    }}
                    variant="outline"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Send Another Email
                  </Button>
                  
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="text-center mt-6 p-4 bg-white/50 rounded-lg border border-pink-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Still Need Help?</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Contact our support team:</p>
              <p>Email: support@hospital.com</p>
              <p>Phone: +91 9876543210</p>
            </div>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">No worries, we'll send you reset instructions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Forgot Password Form */}
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
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
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                    error ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                <p className="text-xs text-gray-500">
                  We'll send a password reset link to this email address
                </p>
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-1 rounded-full">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Security Notice</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Reset links expire after 30 minutes</p>
                <p>• Only the most recent reset link will work</p>
                <p>• If you didn't request this, you can safely ignore it</p>
                <p>• Contact support if you need additional help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

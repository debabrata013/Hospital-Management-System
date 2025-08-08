"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hospitalName: "",
    role: "",
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle signup logic here
    console.log("Signup attempt:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration */}
        <div className="hidden lg:block relative">
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-8 shadow-2xl">
            <Image
              src="/placeholder.svg?height=700&width=500"
              alt="Hospital Signup Illustration"
              width={500}
              height={700}
              className="rounded-2xl"
            />
          </div>
          <div className="absolute top-8 left-8">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          {/* Benefits */}
          <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4">आरोग्य अस्पताल क्यों चुनें?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-pink-500" />
                </div>
                <span className="text-sm text-gray-700">HIPAA Compliant & Secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-pink-500" />
                </div>
                <span className="text-sm text-gray-700">24/7 Technical Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-pink-500" />
                </div>
                <span className="text-sm text-gray-700">Easy Integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-pink-100 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">आरोग्य अस्पताल</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">खाता बनाएं</CardTitle>
              <CardDescription className="text-gray-600">
                आरोग्य अस्पताल का उपयोग करने वाले हजारों स्वास्थ्य सेवा प्रदाताओं में शामिल हों
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hospitalName" className="text-gray-700 font-medium">
                    Hospital/Clinic Name
                  </Label>
                  <Input
                    id="hospitalName"
                    type="text"
                    placeholder="General Hospital"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 font-medium">
                    Your Role
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl h-11 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-pink-300 text-pink-500 focus:ring-pink-400 mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="#" className="text-pink-500 hover:text-pink-600 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-pink-500 hover:text-pink-600 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Account
                </Button>
                
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="lg:hidden mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

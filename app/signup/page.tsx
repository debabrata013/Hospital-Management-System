"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Building,
  Stethoscope
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function SignupPage() {
  const { register, authState } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    role: "",
    
    // Professional Information
    department: "",
    specialization: "",
    licenseNumber: "",
    
    // Personal Information
    dateOfBirth: "",
    gender: "",
    
    // Address Information
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    },
    
    // Emergency Contact
    emergencyContact: {
      name: "",
      relationship: "",
      contactNumber: ""
    },
    
    // Terms
    acceptTerms: false
  })

  const roles = [
    { value: "patient", label: "Patient", description: "Book appointments and manage health records" },
    { value: "doctor", label: "Doctor", description: "Manage patients and medical records" },
    { value: "staff", label: "Staff", description: "Administrative and support staff" },
    { value: "receptionist", label: "Receptionist", description: "Front desk and appointment management" }
  ]

  const departments = [
    "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Gynecology", "Dermatology", "Psychiatry", "Emergency Medicine", "Radiology",
    "Pathology", "Anesthesiology", "Surgery", "Administration", "Front Desk"
  ]

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register(formData)
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Phone number is required"
    if (!formData.role) newErrors.role = "Role is required"
    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms and conditions"

    // Password strength validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // Professional info validation for non-patients
    if (formData.role && formData.role !== 'patient') {
      if (!formData.department) newErrors.department = "Department is required"
      if (formData.role === 'doctor' && !formData.licenseNumber) {
        newErrors.licenseNumber = "License number is required for doctors"
      }
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

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join आरोग्य अस्पताल</h1>
          <p className="text-gray-600">Create your account to access our healthcare services</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-pink-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Professional & Personal Details' :
                'Address & Emergency Contact'
              }
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {authState.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {authState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Create Account</CardTitle>
            <CardDescription>
              Fill in your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-pink-500" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-pink-500" />
                        Email Address *
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
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-pink-500" />
                        Password *
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
                        Confirm Password *
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
                          placeholder="Confirm your password"
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-pink-500" />
                        Phone Number *
                      </Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                          errors.contactNumber ? 'border-red-500' : ''
                        }`}
                        placeholder="+91 9876543210"
                      />
                      {errors.contactNumber && <p className="text-sm text-red-600">{errors.contactNumber}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-pink-500" />
                        I am a *
                      </Label>
                      <Select value={formData.role || undefined} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                          errors.role ? 'border-red-500' : ''
                        }`}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-gray-500">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Professional & Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Professional Information - Only for non-patients */}
                  {formData.role && formData.role !== 'patient' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-pink-500" />
                        Professional Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department */}
                        <div className="space-y-2">
                          <Label htmlFor="department">Department *</Label>
                          <Select value={formData.department || undefined} onValueChange={(value) => handleInputChange('department', value)}>
                            <SelectTrigger className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                              errors.department ? 'border-red-500' : ''
                            }`}>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
                        </div>

                        {/* Specialization - For doctors */}
                        {formData.role === 'doctor' && (
                          <div className="space-y-2">
                            <Label htmlFor="specialization" className="flex items-center">
                              <Stethoscope className="h-4 w-4 mr-2 text-pink-500" />
                              Specialization
                            </Label>
                            <Input
                              id="specialization"
                              type="text"
                              value={formData.specialization}
                              onChange={(e) => handleInputChange('specialization', e.target.value)}
                              className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                              placeholder="e.g., Cardiology, Neurology"
                            />
                          </div>
                        )}

                        {/* License Number - For doctors */}
                        {formData.role === 'doctor' && (
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber">Medical License Number *</Label>
                            <Input
                              id="licenseNumber"
                              type="text"
                              value={formData.licenseNumber}
                              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                              className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                                errors.licenseNumber ? 'border-red-500' : ''
                              }`}
                              placeholder="Enter your medical license number"
                            />
                            {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-pink-500" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                          Date of Birth
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender || undefined} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Address & Emergency Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-pink-500" />
                      Address Information
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Street Address */}
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          placeholder="Enter your street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* City */}
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                            className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            placeholder="Enter your city"
                          />
                        </div>

                        {/* State */}
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select 
                            value={formData.address.state} 
                            onValueChange={(value) => handleNestedInputChange('address', 'state', value)}
                          >
                            <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ZIP Code */}
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.address.zipCode}
                            onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                            className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            placeholder="Enter ZIP code"
                          />
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            type="text"
                            value={formData.address.country}
                            onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                            className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-pink-500" />
                      Emergency Contact
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Emergency Contact Name */}
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          placeholder="Emergency contact name"
                        />
                      </div>

                      {/* Relationship */}
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select 
                          value={formData.emergencyContact.relationship} 
                          onValueChange={(value) => handleNestedInputChange('emergencyContact', 'relationship', value)}
                        >
                          <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Friend">Friend</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Emergency Contact Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Number</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergencyContact.contactNumber}
                          onChange={(e) => handleNestedInputChange('emergencyContact', 'contactNumber', e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => handleInputChange('acceptTerms', checked.toString())}
                        className="border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          I agree to the Terms and Conditions *
                        </Label>
                        <p className="text-xs text-gray-500">
                          By creating an account, you agree to our{" "}
                          <Link href="/terms" className="text-pink-500 hover:text-pink-600">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-pink-500 hover:text-pink-600">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={authState.isLoading}
                      className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8"
                    >
                      {authState.isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

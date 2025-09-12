"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  UserPlus, 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building2,
  Stethoscope,
  Shield,
  Clock,
  DollarSign,
  FileText,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface StaffFormData {
  // Basic Information
  name: string
  email: string
  password: string
  confirmPassword: string
  contactNumber: string
  alternateNumber: string
  
  // Professional Information
  role: string
  department: string
  designation: string
  employeeId: string
  specialization: string
  
  // Qualifications
  qualification: Array<{
    degree: string
    institution: string
    year: number
    verified: boolean
  }>
  experience: number
  licenseNumber: string
  
  // Work Schedule
  workSchedule: {
    shift: {
      start: string
      end: string
    }
    workingDays: string[]
    consultationFee: number
    maxPatientsPerDay: number
  }
  
  // Address
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  
  // Emergency Contact
  emergencyContact: {
    name: string
    phone: string
    relationship: string
    address: string
  }
  
  // Employment Details
  employment: {
    joiningDate: string
    employmentType: string
    salary: number
    bankDetails: {
      accountNumber: string
      ifscCode: string
      bankName: string
      accountHolderName: string
    }
  }
  
  // Staff Profile Information
  personalInfo: {
    dateOfBirth: string
    gender: string
    maritalStatus: string
    bloodGroup: string
    nationality: string
    religion: string
    languages: Array<{
      language: string
      proficiency: string
    }>
  }
  
  identification: {
    aadharNumber: string
    panNumber: string
    passportNumber: string
    drivingLicense: {
      number: string
      expiryDate: string
      category: string[]
    }
    voterIdNumber: string
  }
  
  skills: string[]
  certifications: Array<{
    name: string
    issuingAuthority: string
    issueDate: string
    expiryDate: string
    certificatePath: string
  }>
  
  currentAssignment: {
    ward: string
    responsibilities: string[]
    supervisor: string
    startDate: string
  }
  
  notes: string
  onboardingDate: string
}

const initialFormData: StaffFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  alternateNumber: "",
  role: "",
  department: "",
  designation: "",
  employeeId: "",
  specialization: "",
  qualification: [],
  experience: 0,
  licenseNumber: "",
  workSchedule: {
    shift: { start: "", end: "" },
    workingDays: [],
    consultationFee: 0,
    maxPatientsPerDay: 20
  },
  address: {
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  },
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
    address: ""
  },
  employment: {
    joiningDate: "",
    employmentType: "full-time",
    salary: 0,
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: ""
    }
  },
  personalInfo: {
    dateOfBirth: "",
    gender: "",
    maritalStatus: "Single",
    bloodGroup: "",
    nationality: "Indian",
    religion: "",
    languages: []
  },
  identification: {
    aadharNumber: "",
    panNumber: "",
    passportNumber: "",
    drivingLicense: {
      number: "",
      expiryDate: "",
      category: []
    },
    voterIdNumber: ""
  },
  skills: [],
  certifications: [],
  currentAssignment: {
    ward: "",
    responsibilities: [],
    supervisor: "",
    startDate: ""
  },
  notes: "",
  onboardingDate: ""
}

const departments = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", 
  "Emergency", "ICU", "General Medicine", "General Surgery", "Radiology",
  "Laboratory", "Pharmacy", "Administration", "HR", "IT", "Maintenance"
]

const roles = [
  { value: "doctor", label: "Doctor", icon: Stethoscope },
  { value: "nurse", label: "Nurse", icon: User },
  { value: "staff", label: "Staff", icon: User },
  { value: "admin", label: "Administrator", icon: Shield },
  { value: "receptionist", label: "Receptionist", icon: User }
]

const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const employmentTypes = ["full-time", "part-time", "contract", "consultant"]
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const genderOptions = ["Male", "Female", "Other"]
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
const languageProficiencies = ["Basic", "Intermediate", "Advanced", "Native"]

export default function AddNewStaff() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<StaffFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "Basic" })
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    certificatePath: ""
  })
  const [newQualification, setNewQualification] = useState({
    degree: "",
    institution: "",
    year: new Date().getFullYear(),
    verified: false
  })
  const [newResponsibility, setNewResponsibility] = useState("")
  const [newDrivingCategory, setNewDrivingCategory] = useState("")

  const { toast } = useToast()

  const totalSteps = 6

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentData = prev[parent as keyof StaffFormData]
      return {
        ...prev,
        [parent]: {
          ...(typeof parentData === 'object' && parentData !== null ? parentData : {}),
          [field]: value
        }
      }
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          languages: [...prev.personalInfo.languages, { ...newLanguage }]
        }
      }))
      setNewLanguage({ language: "", proficiency: "Basic" })
    }
  }

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: prev.personalInfo.languages.filter((_, i) => i !== index)
      }
    }))
  }

  const addCertification = () => {
    if (newCertification.name.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }))
      setNewCertification({
        name: "",
        issuingAuthority: "",
        issueDate: "",
        expiryDate: "",
        certificatePath: ""
      })
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const addQualification = () => {
    if (newQualification.degree.trim() && newQualification.institution.trim()) {
      setFormData(prev => ({
        ...prev,
        qualification: [...prev.qualification, { ...newQualification }]
      }))
      setNewQualification({
        degree: "",
        institution: "",
        year: new Date().getFullYear(),
        verified: false
      })
    }
  }

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualification: prev.qualification.filter((_, i) => i !== index)
    }))
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        currentAssignment: {
          ...prev.currentAssignment,
          responsibilities: [...prev.currentAssignment.responsibilities, newResponsibility.trim()]
        }
      }))
      setNewResponsibility("")
    }
  }

  const removeResponsibility = (responsibility: string) => {
    setFormData(prev => ({
      ...prev,
      currentAssignment: {
        ...prev.currentAssignment,
        responsibilities: prev.currentAssignment.responsibilities.filter(r => r !== responsibility)
      }
    }))
  }

  const addDrivingCategory = () => {
    if (newDrivingCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        identification: {
          ...prev.identification,
          drivingLicense: {
            ...prev.identification.drivingLicense,
            category: [...prev.identification.drivingLicense.category, newDrivingCategory.trim()]
          }
        }
      }))
      setNewDrivingCategory("")
    }
  }

  const removeDrivingCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        drivingLicense: {
          ...prev.identification.drivingLicense,
          category: prev.identification.drivingLicense.category.filter(c => c !== category)
        }
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Information
        return !!(formData.name && formData.email && formData.password && 
                 formData.confirmPassword && formData.contactNumber && 
                 formData.password === formData.confirmPassword)
      case 2: // Professional Information
        return !!(formData.role && formData.department && formData.designation)
      case 3: // Qualifications
        return formData.qualification.length > 0
      case 4: // Contact & Address
        return !!(formData.address.street && formData.address.city && 
                 formData.address.state && formData.address.pincode)
      case 5: // Employment Details
        return !!(formData.employment.joiningDate && formData.employment.salary)
      case 6: // Additional Information
        return true // Optional step
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Transform formData to match the super-admin staff API format
      const staffData = {
        name: formData.name,
        mobile: formData.contactNumber,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        shift: formData.workSchedule?.shift ? `${formData.workSchedule.shift.start}-${formData.workSchedule.shift.end}` : 'flexible',
        specialization: formData.specialization
      }

      const response = await fetch('/api/super-admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success!",
          description: result.message || "Staff member created successfully",
        })
        setIsOpen(false)
        setFormData(initialFormData)
        setCurrentStep(1)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new staff member account with comprehensive information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="1" disabled={currentStep < 1}>Basic</TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>Professional</TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>Qualifications</TabsTrigger>
            <TabsTrigger value="4" disabled={currentStep < 4}>Contact</TabsTrigger>
            <TabsTrigger value="5" disabled={currentStep < 5}>Employment</TabsTrigger>
            <TabsTrigger value="6" disabled={currentStep < 6}>Additional</TabsTrigger>
          </TabsList>

          {/* Step 1: Basic Information */}
          <TabsContent value="1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the staff member's basic personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternateNumber">Alternate Number</Label>
                    <Input
                      id="alternateNumber"
                      value={formData.alternateNumber}
                      onChange={(e) => handleInputChange("alternateNumber", e.target.value)}
                      placeholder="Enter alternate number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Professional Information */}
          <TabsContent value="2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Enter the staff member's professional details and role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      placeholder="Enter designation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      placeholder="Auto-generated if not provided"
                    />
                  </div>
                </div>

                {formData.role === "doctor" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        placeholder="Enter license number"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Qualifications */}
          <TabsContent value="3" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Qualifications & Experience
                </CardTitle>
                <CardDescription>
                  Enter the staff member's educational qualifications and work experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Qualifications *</Label>
                  <div className="space-y-3">
                    {formData.qualification.map((qual, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            value={qual.degree}
                            onChange={(e) => {
                              const updated = [...formData.qualification]
                              updated[index].degree = e.target.value
                              handleInputChange("qualification", updated)
                            }}
                            placeholder="Degree"
                          />
                          <Input
                            value={qual.institution}
                            onChange={(e) => {
                              const updated = [...formData.qualification]
                              updated[index].institution = e.target.value
                              handleInputChange("qualification", updated)
                            }}
                            placeholder="Institution"
                          />
                          <Input
                            type="number"
                            value={qual.year}
                            onChange={(e) => {
                              const updated = [...formData.qualification]
                              updated[index].year = parseInt(e.target.value)
                              handleInputChange("qualification", updated)
                            }}
                            placeholder="Year"
                          />
                        </div>
                        <Checkbox
                          checked={qual.verified}
                          onCheckedChange={(checked) => {
                            const updated = [...formData.qualification]
                            updated[index].verified = checked as boolean
                            handleInputChange("qualification", updated)
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQualification(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Input
                        value={newQualification.degree}
                        onChange={(e) => setNewQualification(prev => ({ ...prev, degree: e.target.value }))}
                        placeholder="Degree"
                        className="flex-1"
                      />
                      <Input
                        value={newQualification.institution}
                        onChange={(e) => setNewQualification(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="Institution"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={newQualification.year}
                        onChange={(e) => setNewQualification(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        placeholder="Year"
                        className="w-24"
                      />
                      <Button onClick={addQualification} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", parseInt(e.target.value))}
                      placeholder="Enter years of experience"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Contact & Address */}
          <TabsContent value="4" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact & Address Information
                </CardTitle>
                <CardDescription>
                  Enter the staff member's address and emergency contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={formData.address.street}
                      onChange={(e) => handleNestedChange("address", "street", e.target.value)}
                      placeholder="Street Address"
                    />
                    <Input
                      value={formData.address.city}
                      onChange={(e) => handleNestedChange("address", "city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <Input
                      value={formData.address.state}
                      onChange={(e) => handleNestedChange("address", "state", e.target.value)}
                      placeholder="State"
                    />
                    <Input
                      value={formData.address.pincode}
                      onChange={(e) => handleNestedChange("address", "pincode", e.target.value)}
                      placeholder="Pincode"
                    />
                    <Input
                      value={formData.address.country}
                      onChange={(e) => handleNestedChange("address", "country", e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={formData.emergencyContact.name}
                      onChange={(e) => handleNestedChange("emergencyContact", "name", e.target.value)}
                      placeholder="Emergency Contact Name"
                    />
                    <Input
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleNestedChange("emergencyContact", "phone", e.target.value)}
                      placeholder="Emergency Contact Phone"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleNestedChange("emergencyContact", "relationship", e.target.value)}
                      placeholder="Relationship"
                    />
                    <Input
                      value={formData.emergencyContact.address}
                      onChange={(e) => handleNestedChange("emergencyContact", "address", e.target.value)}
                      placeholder="Emergency Contact Address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Employment Details */}
          <TabsContent value="5" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Employment Details
                </CardTitle>
                <CardDescription>
                  Enter the staff member's employment and salary information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date *</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.employment.joiningDate}
                      onChange={(e) => handleNestedChange("employment", "joiningDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select 
                      value={formData.employment.employmentType} 
                      onValueChange={(value) => handleNestedChange("employment", "employmentType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Monthly) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.employment.salary}
                    onChange={(e) => handleNestedChange("employment", "salary", parseInt(e.target.value))}
                    placeholder="Enter monthly salary"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Bank Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={formData.employment.bankDetails.accountNumber}
                      onChange={(e) => handleNestedChange("employment", "bankDetails", {
                        ...formData.employment.bankDetails,
                        accountNumber: e.target.value
                      })}
                      placeholder="Account Number"
                    />
                    <Input
                      value={formData.employment.bankDetails.ifscCode}
                      onChange={(e) => handleNestedChange("employment", "bankDetails", {
                        ...formData.employment.bankDetails,
                        ifscCode: e.target.value
                      })}
                      placeholder="IFSC Code"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                      value={formData.employment.bankDetails.bankName}
                      onChange={(e) => handleNestedChange("employment", "bankDetails", {
                        ...formData.employment.bankDetails,
                        bankName: e.target.value
                      })}
                      placeholder="Bank Name"
                    />
                    <Input
                      value={formData.employment.bankDetails.accountHolderName}
                      onChange={(e) => handleNestedChange("employment", "bankDetails", {
                        ...formData.employment.bankDetails,
                        accountHolderName: e.target.value
                      })}
                      placeholder="Account Holder Name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 6: Additional Information */}
          <TabsContent value="6" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Enter additional details like skills, certifications, and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1"
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Personal Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => handleNestedChange("personalInfo", "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={formData.personalInfo.gender} 
                        onValueChange={(value) => handleNestedChange("personalInfo", "gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((gender) => (
                            <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select 
                        value={formData.personalInfo.bloodGroup} 
                        onValueChange={(value) => handleNestedChange("personalInfo", "bloodGroup", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select 
                        value={formData.personalInfo.maritalStatus} 
                        onValueChange={(value) => handleNestedChange("personalInfo", "maritalStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {maritalStatuses.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Enter any additional notes or comments"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm}>
              Reset Form
            </Button>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Staff Member"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

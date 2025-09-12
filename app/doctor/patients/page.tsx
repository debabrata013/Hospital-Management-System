"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Zap,
  MapPin,
  AlertCircle,
  RefreshCw,
  Download,
  Printer
} from 'lucide-react'

interface Patient {
  id: number
  patient_id: string
  name: string
  date_of_birth: string
  gender: string
  contact_number: string
  email?: string
  address: string
  blood_group?: string
  emergency_contact_name: string
  emergency_contact_number: string
  city?: string
  state?: string
  pincode?: string
  marital_status?: string
  occupation?: string
  insurance_provider?: string
  insurance_policy_number?: string
  is_active: number
  registration_date: string
  created_at: string
  updated_at: string
}

interface PatientStats {
  totalPatients: number
  activeCases: number
  criticalPatients: number
  followUpsDue: number
}

export default function DoctorPatientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    activeCases: 0,
    criticalPatients: 0,
    followUpsDue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchPatients()
    fetchStats()
  }, [pagination.page, searchTerm, statusFilter])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/doctor/patients?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
        setPagination(data.pagination || pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch patients",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/doctor/patients/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDetailsDialogOpen(true)
  }

  const handleViewDocuments = (patient: Patient) => {
    router.push(`/doctor/patient-info?patient=${patient.patient_id}`)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-pink-500" />
              My Patients
            </h1>
            <p className="text-gray-600 mt-2">View and manage your patient records and medical history</p>
          </div>
          <Button onClick={() => fetchPatients()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeCases}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalPatients}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Follow-ups Due</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.followUpsDue}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search patients by name, ID, condition, or phone..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-pink-200">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Records</span>
            <span className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-6 animate-pulse">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-6 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-lg font-bold">
                          {patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-bold text-xl text-gray-900">{patient.name}</h3>
                          <Badge variant="outline">{patient.patient_id}</Badge>
                          {patient.blood_group && (
                            <Badge className="bg-red-100 text-red-700 font-bold">{patient.blood_group}</Badge>
                          )}
                          <Badge className={patient.is_active === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {patient.is_active === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{calculateAge(patient.date_of_birth)} years • {patient.gender}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{patient.contact_number}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Registered: {new Date(patient.registration_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {patient.address && (
                          <div className="flex items-start space-x-2 text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span className="text-sm">
                              {patient.address}
                              {patient.city && `, ${patient.city}`}
                              {patient.state && `, ${patient.state}`}
                              {patient.pincode && ` - ${patient.pincode}`}
                            </span>
                          </div>
                        )}

                        {patient.emergency_contact_name && (
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <h4 className="font-semibold text-orange-900 text-sm mb-1">Emergency Contact</h4>
                            <div className="text-sm text-orange-700">
                              {patient.emergency_contact_name} - {patient.emergency_contact_number}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        onClick={() => handleViewPatient(patient)}
                        title="View Patient Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        onClick={() => handleViewDocuments(patient)}
                        title="View Patient Documents & Records"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Medical History</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Add Vitals</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Heart className="h-6 w-6" />
              <span>Critical Patients</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Follow-up</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Patient Management Features Coming Soon</span>
        </div>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white">
                  {selectedPatient?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{selectedPatient?.name}</h2>
                <p className="text-sm text-gray-500">Patient ID: {selectedPatient?.patient_id}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Age:</span>
                      <span>{calculateAge(selectedPatient.date_of_birth)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedPatient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Blood Group:</span>
                      <span>{selectedPatient.blood_group || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Contact:</span>
                      <span>{selectedPatient.contact_number}</span>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedPatient.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge className={selectedPatient.is_active === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {selectedPatient.is_active === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedPatient.address && (
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedPatient.address}
                          {selectedPatient.city && <><br />{selectedPatient.city}</>}
                          {selectedPatient.state && <>, {selectedPatient.state}</>}
                          {selectedPatient.pincode && <> - {selectedPatient.pincode}</>}
                        </p>
                      </div>
                    )}
                    {selectedPatient.emergency_contact_name && (
                      <div>
                        <span className="font-medium">Emergency Contact:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedPatient.emergency_contact_name}<br />
                          {selectedPatient.emergency_contact_number}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Registration Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registration Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Registration Date:</span>
                      <p className="text-sm text-gray-600">{new Date(selectedPatient.registration_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <p className="text-sm text-gray-600">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Patient ID:</span>
                      <p className="text-sm text-gray-600">{selectedPatient.patient_id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleViewDocuments(selectedPatient)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

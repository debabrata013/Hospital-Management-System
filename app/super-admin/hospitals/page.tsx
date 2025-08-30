"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Building2, Plus, Search, Filter, Edit, Trash2, Eye, MapPin, Phone, Mail, Users, Activity, Star
} from 'lucide-react'

// Mock hospital data
const mockHospitals = [
  {
    id: 1,
    name: "Arogya Central Hospital",
    location: "Mumbai, Maharashtra",
    address: "123 Health Street, Andheri West, Mumbai - 400058",
    phone: "+91 22 2674 5678",
    email: "info@arogyacentral.com",
    type: "Multi-Specialty",
    beds: 250,
    doctors: 45,
    staff: 120,
    status: "active",
    rating: 4.8,
    established: "2015",
    lastUpdate: "2 hours ago"
  },
  {
    id: 2,
    name: "Arogya City Medical Center",
    location: "Delhi, NCR",
    address: "456 Medical Plaza, Connaught Place, New Delhi - 110001",
    phone: "+91 11 4567 8901",
    email: "contact@arogyacity.com",
    type: "General Hospital",
    beds: 180,
    doctors: 32,
    staff: 85,
    status: "active",
    rating: 4.6,
    established: "2018",
    lastUpdate: "1 day ago"
  },
  {
    id: 3,
    name: "Arogya Specialty Clinic",
    location: "Bangalore, Karnataka",
    address: "789 Care Avenue, Koramangala, Bangalore - 560034",
    phone: "+91 80 9876 5432",
    email: "admin@arogyaspecialty.com",
    type: "Specialty Clinic",
    beds: 50,
    doctors: 15,
    staff: 35,
    status: "maintenance",
    rating: 4.4,
    established: "2020",
    lastUpdate: "3 days ago"
  }
]

export default function HospitalsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [hospitals, setHospitals] = useState(mockHospitals)
  const [formData, setFormData] = useState({
    name: '', location: '', address: '', phone: '', email: '', type: '',
    beds: '', doctors: '', staff: '', established: ''
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'maintenance': return <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
      case 'inactive': return <Badge className="bg-red-100 text-red-700">Inactive</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Multi-Specialty': return <Badge className="bg-blue-100 text-blue-700">Multi-Specialty</Badge>
      case 'General Hospital': return <Badge className="bg-purple-100 text-purple-700">General Hospital</Badge>
      case 'Specialty Clinic': return <Badge className="bg-orange-100 text-orange-700">Specialty Clinic</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700">{type}</Badge>
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.location || !formData.address || !formData.phone || !formData.email || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }
    const newHospital = {
      id: hospitals.length + 1,
      ...formData,
      beds: parseInt(formData.beds) || 0,
      doctors: parseInt(formData.doctors) || 0,
      staff: parseInt(formData.staff) || 0,
      status: "active",
      rating: 0,
      lastUpdate: "Just now"
    }
    setHospitals(prev => [newHospital, ...prev])
    setFormData({ name:'', location:'', address:'', phone:'', email:'', type:'', beds:'', doctors:'', staff:'', established:'' })
    setIsAddModalOpen(false)
    toast.success('Hospital added successfully!')
  }

  const handleDeleteHospital = (hospitalId: number) => {
    if(confirm('Are you sure you want to delete this hospital?')) {
      setHospitals(prev => prev.filter(h => h.id !== hospitalId))
      toast.success('Hospital deleted successfully!')
    }
  }

  const resetForm = () => setFormData({ name:'', location:'', address:'', phone:'', email:'', type:'', beds:'', doctors:'', staff:'', established:'' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-pink-500" /> Manage Hospitals
          </h1>
          <p className="text-gray-600 mt-1">Manage hospital network, locations, and facilities</p>
        </div>

        {/* Add Hospital Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 flex items-center gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-pink-500" /> Add New Hospital
              </DialogTitle>
              <DialogDescription>Fill in the details below to add a new hospital.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hospital Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Hospital Name *</Label><Input value={formData.name} onChange={e=>handleInputChange('name',e.target.value)} required /></div>
                <div className="space-y-2"><Label>Hospital Type *</Label>
                  <Select value={formData.type || undefined} onValueChange={(v)=>handleInputChange('type',v)}>
                    <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multi-Specialty">Multi-Specialty</SelectItem>
                      <SelectItem value="General Hospital">General Hospital</SelectItem>
                      <SelectItem value="Specialty Clinic">Specialty Clinic</SelectItem>
                      <SelectItem value="Emergency Center">Emergency Center</SelectItem>
                      <SelectItem value="Rehabilitation Center">Rehabilitation Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={e=>handleInputChange('location',e.target.value)} required /></div>
                <div className="space-y-2"><Label>Established Year</Label><Input type="number" value={formData.established} onChange={e=>handleInputChange('established',e.target.value)} min="1900" max={new Date().getFullYear()}/></div>
              </div>

              <div className="space-y-2"><Label>Full Address *</Label><Textarea value={formData.address} onChange={e=>handleInputChange('address',e.target.value)} rows={3} required/></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Phone *</Label><Input value={formData.phone} onChange={e=>handleInputChange('phone',e.target.value)} required /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={e=>handleInputChange('email',e.target.value)} required /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Beds</Label><Input type="number" value={formData.beds} onChange={e=>handleInputChange('beds',e.target.value)} min={0}/></div>
                <div className="space-y-2"><Label>Doctors</Label><Input type="number" value={formData.doctors} onChange={e=>handleInputChange('doctors',e.target.value)} min={0}/></div>
                <div className="space-y-2"><Label>Staff</Label><Input type="number" value={formData.staff} onChange={e=>handleInputChange('staff',e.target.value)} min={0}/></div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setIsAddModalOpen(false) }}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center gap-2"><Plus className="h-4 w-4"/> Add Hospital</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Hospitals</p><p className="text-2xl font-bold">{hospitals.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Active Hospitals</p><p className="text-2xl font-bold text-green-600">{hospitals.filter(h => h.status==='active').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Beds</p><p className="text-2xl font-bold text-blue-600">{hospitals.reduce((sum,h)=>sum+h.beds,0)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Avg Rating</p><p className="text-2xl font-bold text-yellow-600">{(hospitals.reduce((sum,h)=>sum+h.rating,0)/hospitals.length).toFixed(1)}</p></CardContent></Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
            <Input placeholder="Search hospitals..." className="pl-10"/>
          </div>
          <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex items-center gap-2"><Filter className="h-4 w-4"/> Filter</Button>
        </CardContent>
      </Card>

      {/* Hospitals List */}
      <div className="space-y-4">
        {hospitals.map(hospital => (
          <Card key={hospital.id} className="hover:shadow-md transition">
            <CardContent className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-1 gap-4">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white h-16 w-16 flex items-center justify-center font-bold text-lg rounded-lg">{hospital.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                    {getTypeBadge(hospital.type)}
                    {getStatusBadge(hospital.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="space-y-1"><MapPin className="inline h-4 w-4 mr-1 text-pink-500"/>{hospital.location}</div>
                    <div className="space-y-1"><Phone className="inline h-4 w-4 mr-1 text-pink-500"/>{hospital.phone}</div>
                    <div className="space-y-1"><Mail className="inline h-4 w-4 mr-1 text-pink-500"/>{hospital.email}</div>
                    <div className="space-y-1">Beds: {hospital.beds} • Doctors: {hospital.doctors} • Staff: {hospital.staff}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-start md:items-center">
                <Button variant="outline" size="sm"><Eye className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={()=>handleDeleteHospital(hospital.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Overview */}
      <Card>
        <CardHeader><CardTitle>Network Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg"><h4 className="font-semibold text-blue-800">Multi-Specialty Hospitals</h4><p className="text-sm text-blue-600 mt-1">45 hospitals • 8,500 beds</p></div>
          <div className="p-4 bg-green-50 rounded-lg"><h4 className="font-semibold text-green-800">General Hospitals</h4><p className="text-sm text-green-600 mt-1">62 hospitals • 5,200 beds</p></div>
          <div className="p-4 bg-purple-50 rounded-lg"><h4 className="font-semibold text-purple-800">Specialty Clinics</h4><p className="text-sm text-purple-600 mt-1">20 clinics • 1,720 beds</p></div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {/* Quick Actions */}
<Card className="border-pink-100 mt-6">
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
        <Plus className="h-6 w-6" />
        <span>Add Hospital</span>
      </Button>
      <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
        <MapPin className="h-6 w-6" />
        <span>View Map</span>
      </Button>
      <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
        <Activity className="h-6 w-6" />
        <span>Performance Report</span>
      </Button>
      <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
        <Star className="h-6 w-6" />
        <span>Quality Metrics</span>
      </Button>
    </div>
  </CardContent>
</Card>


      {/* Coming Soon Notice */}
      <Card className="bg-pink-50 border-pink-200">
        <CardContent className="text-center text-pink-700 font-semibold py-6">
          🚧 More features coming soon!
        </CardContent>
      </Card>

    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Search, 
  Eye, 
  CheckCircle, 
  ArrowLeft,
  Stethoscope,
  UserCheck,
  ArrowUp,
  RefreshCw,
  Phone,
  Edit,
  XCircle,
  AlertCircle,
  Timer,
  Calendar
} from 'lucide-react'
import Cookies from 'js-cookie'

interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  gender: string
  contact_number: string
  address?: string
}

export default function SearchPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to load from cookies first
    const cookieData = Cookies.get('receptionist_patients')
    if (cookieData) {
      try {
        const parsed = JSON.parse(cookieData)
        setAllPatients(parsed)
        setPatients(parsed)
        setIsLoading(false)
        return
      } catch {}
    }
    // Otherwise fetch from API
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/receptionist/patients')
      const data = await response.json()
      setAllPatients(data.patients || [])
      setPatients(data.patients || [])
      // Store in cookies for 1 hour
      Cookies.set('receptionist_patients', JSON.stringify(data.patients || []), { expires: 1/24 })
    } catch (error) {
      setAllPatients([])
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setPatients(allPatients)
      return
    }
    const filtered = allPatients.filter(patient =>
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.contact_number.includes(query)
    )
    setPatients(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
           <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
          </div>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>Find any patient by name or mobile number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Enter name or mobile number..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
              <Button variant="outline" className="absolute right-2 top-2" onClick={fetchPatients}>
                Refresh
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No patients found</div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden">
              {patients.map(patient => (
                <div key={patient.id} className="flex items-center p-4 hover:bg-gray-50">
                  <div className="bg-pink-100 p-2 rounded-lg mr-4">
                    <User className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{patient.name}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {patient.contact_number}
                      <span className="mx-2">•</span>
                      {patient.age}Y {patient.gender}
                      <span className="mx-2">•</span>
                      ID: {patient.patient_id}
                    </div>
                    {patient.address && (
                      <div className="text-xs text-gray-500 mt-1">📍 {patient.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  AlertTriangle,
  Phone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  User,
  Heart,
  Activity,
  Zap,
  Siren,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Stethoscope
} from 'lucide-react'

// Mock data for emergency contacts
const emergencyContacts = [
  {
    id: "EC001",
    patientId: "P001",
    patientName: "Ram Sharma",
    contactName: "Sita Sharma",
    relationship: "Wife",
    primaryPhone: "+91 98765 43210",
    alternatePhone: "+91 98765 43211",
    email: "sita.sharma@email.com",
    address: "123 Main Street, Delhi",
    priority: "high",
    status: "active",
    lastContacted: "2024-01-08 10:30 AM",
    contactedBy: "Reception-1",
    notes: "Primary emergency contact, available 24/7"
  },
  {
    id: "EC002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    contactName: "Priya Kumar",
    relationship: "Wife",
    primaryPhone: "+91 98765 43212",
    alternatePhone: "+91 98765 43213",
    email: "priya.kumar@email.com",
    address: "456 Park Avenue, Mumbai",
    priority: "critical",
    status: "contacted",
    lastContacted: "2024-01-08 02:45 PM",
    contactedBy: "Dr. Rajesh Gupta",
    notes: "Patient in ICU, family informed about critical condition"
  },
  {
    id: "EC003",
    patientId: "P005",
    patientName: "Elderly Patient",
    contactName: "Dr. Family Doctor",
    relationship: "Family Doctor",
    primaryPhone: "+91 98765 43214",
    alternatePhone: "+91 98765 43215",
    email: "family.doctor@clinic.com",
    address: "Medical Clinic, Sector 15",
    priority: "high",
    status: "pending",
    lastContacted: "Never",
    contactedBy: "",
    notes: "No immediate family available, contact family doctor"
  }
]

const emergencyProtocols = [
  {
    id: "EP001",
    title: "Cardiac Emergency",
    description: "Heart attack, cardiac arrest, chest pain",
    steps: [
      "Call emergency medical team immediately",
      "Contact cardiologist on duty",
      "Prepare emergency medications",
      "Notify family members",
      "Arrange ICU bed if needed"
    ],
    contacts: ["Dr. Cardio - 9876543210", "ICU Nurse - 9876543211"],
    priority: "critical"
  },
  {
    id: "EP002", 
    title: "Trauma Emergency",
    description: "Accidents, injuries, bleeding",
    steps: [
      "Assess patient condition",
      "Contact trauma surgeon",
      "Prepare operation theater",
      "Notify blood bank",
      "Contact emergency contacts"
    ],
    contacts: ["Dr. Trauma - 9876543212", "OT Coordinator - 9876543213"],
    priority: "high"
  },
  {
    id: "EP003",
    title: "Pediatric Emergency", 
    description: "Child emergencies, fever, breathing issues",
    steps: [
      "Contact pediatrician immediately",
      "Prepare pediatric equipment",
      "Comfort the child and parents",
      "Monitor vital signs closely",
      "Arrange pediatric ICU if needed"
    ],
    contacts: ["Dr. Pediatric - 9876543214", "Pediatric Nurse - 9876543215"],
    priority: "high"
  }
]

const quickContacts = [
  { name: "Emergency Services", number: "108", type: "emergency" },
  { name: "Police", number: "100", type: "police" },
  { name: "Fire Department", number: "101", type: "fire" },
  { name: "Hospital Director", number: "+91 98765 43220", type: "internal" },
  { name: "Chief Medical Officer", number: "+91 98765 43221", type: "internal" },
  { name: "Security", number: "+91 98765 43222", type: "internal" }
]

export default function EmergencyPage() {
  const [activeTab, setActiveTab] = useState("contacts")
  const [newContactDialog, setNewContactDialog] = useState(false)
  const [callDialog, setCallDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 animate-pulse">Critical</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'contacted':
        return <Badge className="bg-green-100 text-green-700">Contacted</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-red-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/receptionist" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Emergency Management</h1>
              <p className="text-sm text-gray-500">Emergency contacts and protocols</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setNewContactDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Siren className="h-4 w-4 mr-2" />
              Emergency Alert
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Emergency Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emergency Contacts</p>
                  <p className="text-3xl font-bold text-gray-900">{emergencyContacts.length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <Phone className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {emergencyContacts.filter(c => c.priority === 'critical').length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Contacts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {emergencyContacts.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contacted Today</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {emergencyContacts.filter(c => c.lastContacted.includes('2024-01-08')).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Emergency Contacts */}
        <Card className="mb-6 border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Siren className="h-5 w-5 text-red-500" />
              <span>Quick Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickContacts.map((contact, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                    contact.type === 'emergency' ? 'border-red-200 hover:bg-red-50' :
                    contact.type === 'police' ? 'border-blue-200 hover:bg-blue-50' :
                    contact.type === 'fire' ? 'border-orange-200 hover:bg-orange-50' :
                    'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => window.open(`tel:${contact.number}`)}
                >
                  <PhoneCall className="h-6 w-6" />
                  <div className="text-center">
                    <p className="text-xs font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.number}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Emergency Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Emergency Contacts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={`${
                              contact.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              contact.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {contact.contactName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{contact.contactName}</h3>
                            <p className="text-sm text-gray-600">
                              {contact.relationship} of {contact.patientName}
                            </p>
                            <p className="text-sm text-gray-500">Patient ID: {contact.patientId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Priority</p>
                            {getPriorityBadge(contact.priority)}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Status</p>
                            {getStatusBadge(contact.status)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`tel:${contact.primaryPhone}`)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact)
                                setCallDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Primary Phone: </span>
                          <span>{contact.primaryPhone}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Alternate Phone: </span>
                          <span>{contact.alternatePhone}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Email: </span>
                          <span>{contact.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Last Contacted: </span>
                          <span>{contact.lastContacted}</span>
                        </div>
                      </div>
                      
                      {contact.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes: </span>
                            {contact.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Protocols Tab */}
          <TabsContent value="protocols" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Response Protocols</CardTitle>
                <CardDescription>Standard procedures for different emergency situations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {emergencyProtocols.map((protocol) => (
                    <Card key={protocol.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{protocol.title}</CardTitle>
                          {getPriorityBadge(protocol.priority)}
                        </div>
                        <CardDescription>{protocol.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Emergency Steps:</h4>
                            <ol className="space-y-2">
                              {protocol.steps.map((step, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Emergency Contacts:</h4>
                            <div className="space-y-2">
                              {protocol.contacts.map((contact, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{contact}</span>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`tel:${contact.split(' - ')[1]}`)}
                                  >
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact History</CardTitle>
                <CardDescription>Log of all emergency contact attempts and communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Contact history will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">Track all emergency communications and follow-ups</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add New Contact Dialog */}
      <Dialog open={newContactDialog} onOpenChange={setNewContactDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>
              Add a new emergency contact for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientSearch">Search Patient</Label>
                <Input id="patientSearch" placeholder="Search by name or ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input id="contactName" placeholder="Enter contact name" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input id="primaryPhone" placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input id="alternatePhone" placeholder="+91 98765 43211" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="contact@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter complete address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes or special instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContactDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-600">
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Details Dialog */}
      <Dialog open={callDialog} onOpenChange={setCallDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Emergency contact information and communication options
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedContact.contactName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedContact.relationship} of {selectedContact.patientName}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {getPriorityBadge(selectedContact.priority)}
                  {getStatusBadge(selectedContact.status)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Primary Phone</p>
                    <p className="text-sm text-gray-600">{selectedContact.primaryPhone}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`tel:${selectedContact.primaryPhone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Alternate Phone</p>
                    <p className="text-sm text-gray-600">{selectedContact.alternatePhone}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`tel:${selectedContact.alternatePhone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedContact.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm">
                  <span className="font-medium">Last Contacted: </span>
                  {selectedContact.lastContacted}
                </p>
                {selectedContact.contactedBy && (
                  <p className="text-sm">
                    <span className="font-medium">Contacted By: </span>
                    {selectedContact.contactedBy}
                  </p>
                )}
              </div>

              {selectedContact.notes && (
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Notes: </span>
                    {selectedContact.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCallDialog(false)}>
              Close
            </Button>
            <Button className="bg-green-500 hover:bg-green-600">
              Mark as Contacted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

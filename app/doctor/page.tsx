"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Heart, LayoutDashboard, Calendar, Users, FileText, Stethoscope, Bell, LogOut, Plus, Clock, Activity, TrendingUp, Eye, FlaskConical, Brain, Pill, User, Phone, MapPin, CalendarDays, FileEdit, HeartPulse } from 'lucide-react'


// Mock data removed - using real API data from /api/doctor/appointments

// Mock recent patients data removed - using real API data from /api/doctor/recent-patients


// Navigation items
const navigationItems = [
  {
    title: "मुख्य (Main)",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/doctor", isActive: true },
      { title: "Today's Schedule", icon: Calendar, url: "/doctor/schedule" },
      { title: "Leave Requests", icon: CalendarDays, url: "/doctor/leave-requests" },
    ]
  },
  {
    title: "रोगी प्रबंधन (Patient Care)",
    items: [
      { title: "Patient Records", icon: Users, url: "/doctor/patients" },
      { title: "Patient Information Center", icon: FileText, url: "/doctor/patient-info" },
      { title: "Medical History", icon: FileText, url: "/doctor/history" },
    ]
  },
  {
    title: "उपकरण (Tools)",
    items: [
      { title: "AI Assistant", icon: Brain, url: "/doctor/ai-tools" },
    ]
  }
]

export default function DoctorDashboard() {
  const { authState, logout } = useAuth();
  const { user, isLoading } = authState;
  const [notifications] = useState(5);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    emergencyCalls: 0,
    surgeriesToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [admittedPatientsLoading, setAdmittedPatientsLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [recentPatientsLoading, setRecentPatientsLoading] = useState(true);
  const [assignedNurses, setAssignedNurses] = useState<any>({ opd: { count: 0, nurses: [] }, ward: { count: 0, nurses: [] } });
  const [nursesLoading, setNursesLoading] = useState(true);
  
  // Vitals modal states
  const [vitalsDialog, setVitalsDialog] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  
  // Appointment details modal states
  const [appointmentDetailsDialog, setAppointmentDetailsDialog] = useState(false);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<any>(null);
  
  // Prescription modal states
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<any>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    remarks: ''
  });

  // Patient assignment modal states
  const [patientAssignmentDialog, setPatientAssignmentDialog] = useState(false);
  const [selectedNurseForAssignment, setSelectedNurseForAssignment] = useState<any>(null);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Admitted patient prescription modal states
  const [admittedPatientPrescriptionDialog, setAdmittedPatientPrescriptionDialog] = useState(false);
  const [selectedAdmittedPatient, setSelectedAdmittedPatient] = useState<any>(null);
  const [admittedPatientPrescriptionForm, setAdmittedPatientPrescriptionForm] = useState({
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    remarks: ''
  });

  useEffect(() => {
    if (user) {
      console.log('Auth User Object:', user);
    }
  }, [user]);

  const updateMedicine = (index: number, field: string, value: string) => {
    const updatedMedicines = [...prescriptionForm.medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setPrescriptionForm(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const updateVitals = (field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }));
  };

  // Patient assignment functions
  const handleAssignPatientClick = async (nurse: any) => {
    setSelectedNurseForAssignment(nurse);
    setPatientAssignmentDialog(true);
    
    // Fetch doctor's patients
    try {
      setPatientsLoading(true);
      const response = await fetch('/api/doctor/patients');
      if (response.ok) {
        const data = await response.json();
        setDoctorPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handlePatientAssignment = async () => {
    if (!selectedPatientId || !selectedNurseForAssignment) return;

    try {
      const response = await fetch('/api/doctor/assign-patient-to-nurse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nurseId: selectedNurseForAssignment.nurse_id,
          patientId: selectedPatientId,
        }),
      });

      if (response.ok) {
        // Show success message
        alert('Patient assigned successfully!');
        setPatientAssignmentDialog(false);
        setSelectedPatientId('');
        setSelectedNurseForAssignment(null);
      } else {
        alert('Failed to assign patient. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      alert('Error assigning patient. Please try again.');
    }
  };

  // Admitted patient prescription functions
  const handleAdmittedPatientPrescription = (patient: any) => {
    setSelectedAdmittedPatient(patient);
    setAdmittedPatientPrescriptionDialog(true);
    
    // Reset form with empty vitals (since we show current vitals separately)
    setAdmittedPatientPrescriptionForm({
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      remarks: ''
    });
  };

  const updateAdmittedPatientMedicine = (index: number, field: string, value: string) => {
    const updatedMedicines = [...admittedPatientPrescriptionForm.medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setAdmittedPatientPrescriptionForm(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const addAdmittedPatientMedicine = () => {
    setAdmittedPatientPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeAdmittedPatientMedicine = (index: number) => {
    if (admittedPatientPrescriptionForm.medicines.length > 1) {
      const updatedMedicines = admittedPatientPrescriptionForm.medicines.filter((_, i) => i !== index);
      setAdmittedPatientPrescriptionForm(prev => ({ ...prev, medicines: updatedMedicines }));
    }
  };

  const updateAdmittedPatientVitals = (field: string, value: string) => {
    setAdmittedPatientPrescriptionForm(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }));
  };

  const saveAdmittedPatientPrescription = async () => {
    if (!selectedAdmittedPatient) return;

    try {
      const response = await fetch('/api/doctor/save-prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedAdmittedPatient.patient_id,
          admissionId: selectedAdmittedPatient.admission_id,
          vitals: admittedPatientPrescriptionForm.vitals,
          medicines: admittedPatientPrescriptionForm.medicines,
          remarks: admittedPatientPrescriptionForm.remarks,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Prescription saved successfully! ID: ${data.prescriptionId}`);
        setAdmittedPatientPrescriptionDialog(false);
        setSelectedAdmittedPatient(null);
        // Refresh admitted patients to show updated data
        fetchAdmittedPatients();
      } else {
        alert('Failed to save prescription. Please try again.');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription. Please try again.');
    }
  };

  const fetchAdmittedPatients = async () => {
    try {
      setAdmittedPatientsLoading(true);
      const response = await fetch('/api/doctor/admitted-patients');
      if (!response.ok) {
        throw new Error('Failed to fetch admitted patients');
      }
      const data = await response.json();
      console.log('Admitted Patients API response:', data); // Debug log
      setAdmittedPatients(data.patients || []);
    } catch (error) {
      console.error("Error fetching admitted patients:", error);
      // Set empty array instead of leaving undefined
      setAdmittedPatients([]);
    } finally {
      setAdmittedPatientsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/doctor/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchRecentPatients = async () => {
      try {
        setRecentPatientsLoading(true);
        const response = await fetch('/api/doctor/recent-patients');
        if (!response.ok) {
          throw new Error('Failed to fetch recent patients');
        }
        const data = await response.json();
        setRecentPatients(data);
      } catch (error) {
        console.error("Error fetching recent patients:", error);
      } finally {
        setRecentPatientsLoading(false);
      }
    };

    const fetchAssignedNurses = async () => {
      try {
        setNursesLoading(true);
        const response = await fetch('/api/doctor/assigned-nurses');
        if (!response.ok) {
          throw new Error('Failed to fetch assigned nurses');
        }
        const data = await response.json();
        if (data.success) {
          setAssignedNurses(data);
        }
      } catch (error) {
        console.error("Error fetching assigned nurses:", error);
      } finally {
        setNursesLoading(false);
      }
    };


    if (user) {
      fetchStats();
      fetchAdmittedPatients();
      fetchRecentPatients();
      fetchAssignedNurses();
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to view the dashboard.</div>;
  }

  // Use logged-in user data, with placeholders for details not in the auth state
  const doctorInfo = {
    name: user.name || 'Doctor',
    specialization: user.department || "Cardiologist", // Use department from auth or placeholder
    department: user.department || "Cardiology Department", // Use department from auth or placeholder
    employeeId: user.id,
    experience: "12 years" // Placeholder
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700">Scheduled</Badge>
      case 'stable':
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case 'under_observation':
        return <Badge className="bg-yellow-100 text-yellow-700">Under Observation</Badge>
      case 'improving':
        return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'prescription_review': return <Pill className="h-4 w-4" />
      case 'lab_review': return <FlaskConical className="h-4 w-4" />
      case 'ai_summary': return <Brain className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleTaskClick = (task: any) => {
    switch (task.type) {
      case 'prescription_review':
        // Navigate to patient page with prescription focus
        window.location.href = `/doctor/patients/${task.Patient.id}?tab=prescriptions&prescriptionId=${task.id.replace('PRESC_', '')}`;
        break;
      case 'appointment_prep':
        // Navigate to patient page for appointment preparation
        window.location.href = `/doctor/patients/${task.Patient.id}?tab=appointments&appointmentId=${task.id.replace('APPT_', '')}`;
        break;
      case 'lab_review':
        // Navigate to lab results
        window.location.href = `/doctor/lab-results?patientId=${task.Patient.id}`;
        break;
      default:
        // Default to patient page
        window.location.href = `/doctor/patients/${task.Patient.id}`;
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-pink-100">
         <SidebarHeader className="border-b border-pink-100 p-6">
  <div className="flex items-center space-x-3">
    <Image
      src="/logo.jpg"
      alt="NMSC Logo"
      width={40}
      height={40}
      className="rounded-md"
    />
    <div>
      <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
        NMSC
      </h2>
      <p className="text-sm text-gray-500">Doctor pannel</p>
    </div>
  </div>
</SidebarHeader>

          
          <SidebarContent className="px-4 py-6">
            {navigationItems.map((section: any) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item: any) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={item.isActive}
                          className="w-full justify-start hover:bg-pink-50 data-[active=true]:bg-pink-100 data-[active=true]:text-pink-700"
                        >
                          <Link href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          
          <SidebarFooter className="border-t border-pink-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-pink-700">DR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user ? user.name : 'Doctor'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.department || 'Cardiologist'}</p>
              </div>
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <SidebarTrigger className="text-gray-600 hover:text-pink-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user ? user.name : 'Doctor'}</h1>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {user?.department || 'Cardiologist'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
   

                
                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-pink-50">
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-pink-700">DR</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Doctor Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/settings">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/schedule">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Schedule
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onSelect={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{statsLoading ? '...' : stats.todaysAppointments}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Scheduled for today
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
                      <p className="text-3xl font-bold text-yellow-600">{statsLoading ? '...' : stats.totalPatients}</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Under your care
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emergency Calls</p>
                      <p className="text-3xl font-bold text-red-600">{statsLoading ? '...' : stats.emergencyCalls}</p>
                      <p className="text-sm text-red-600 mt-1">
                        Urgent attention needed
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/doctor/patients">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Users className="h-5 w-5" />
                      <span className="text-sm">Patient Records</span>
                    </Button>
                  </Link>
                  
                  <Link href="/doctor/opd-patients">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Stethoscope className="h-5 w-5" />
                      <span className="text-sm">OPD Patients</span>
                    </Button>
                  </Link>
                  
                  <Link href="/doctor/ai-tools">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Brain className="h-5 w-5" />
                      <span className="text-sm">AI Assistant</span>
                    </Button>
                  </Link>
                  
                </div>
              </CardContent>
            </Card>

            {/* Main Dashboard Widgets */}
            <div className="w-full">
              {/* Admitted Patients */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Admitted Patients</CardTitle>
                    <CardDescription>Patients currently admitted under your care</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-pink-600 border-pink-200">
                    {admittedPatients.length} Total
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {admittedPatientsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading admitted patients...</div>
                      </div>
                    ) : admittedPatients.length > 0 ? (
                      admittedPatients.map((patient: any) => (
                        <div key={patient.admission_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {patient.patient_name ? patient.patient_name.charAt(0).toUpperCase() : 'P'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {patient.patient_name}
                                  </h4>
                                  <Badge variant={patient.admission_type === 'emergency' ? 'destructive' : 'default'}>
                                    {patient.admission_type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  Room: {patient.room_number || 'Not assigned'} • {patient.patient_code}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Admitted: {new Date(patient.admission_date).toLocaleDateString()}</span>
                                  </div>
                                  {patient.vitals && patient.vitals.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <HeartPulse className="h-3 w-3" />
                                      <span>Latest vitals: {new Date(patient.vitals[0].recorded_at).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                {patient.vitals && patient.vitals.length > 0 && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                      {patient.vitals[0].blood_pressure && (
                                        <span>BP: {patient.vitals[0].blood_pressure}</span>
                                      )}
                                      {patient.vitals[0].heart_rate && (
                                        <span>HR: {patient.vitals[0].heart_rate} bpm</span>
                                      )}
                                      {patient.vitals[0].temperature && (
                                        <span>Temp: {patient.vitals[0].temperature}°F</span>
                                      )}
                                      {patient.vitals[0].oxygen_saturation && (
                                        <span>SpO2: {patient.vitals[0].oxygen_saturation}%</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 flex-shrink-0 w-24">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                onClick={async () => {
                                  setSelectedPatientForVitals(patient);
                                  setVitalsLoading(true);
                                  setVitalsDialog(true);
                                  
                                  try {
                                    const response = await fetch(`/api/doctor/vitals?patientId=${patient.patient_id}`);
                                    const data = await response.json();
                                    setVitalsData(data.vitals || []);
                                  } catch (error) {
                                    console.error('Error fetching vitals:', error);
                                    setVitalsData([]);
                                  } finally {
                                    setVitalsLoading(false);
                                  }
                                }}
                              >
                                <HeartPulse className="h-3 w-3 mr-1" />
                                Vitals
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-full text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={() => handleAdmittedPatientPrescription(patient)}
                              >
                                <FileEdit className="h-3 w-3 mr-1" />
                                Prescription
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No patients currently admitted</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Available Nurses */}
              <Card className="border-pink-100 mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Available Nurses</CardTitle>
                    <CardDescription>Nurses assigned to work with you</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-pink-600 border-pink-200">
                    {assignedNurses.opd.count + assignedNurses.ward.count} Total
                  </Badge>
                </CardHeader>
                <CardContent>
                  {nursesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Loading nurses...</div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* OPD Nurses */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">OPD Nurses</h3>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {assignedNurses.opd.count} nurses
                          </Badge>
                        </div>
                        {assignedNurses.opd.nurses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignedNurses.opd.nurses.map((nurse: any) => (
                              <div key={nurse.nurse_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {nurse.nurse_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{nurse.nurse_name}</h4>
                                    <p className="text-sm text-gray-600 truncate">{nurse.nurse_email}</p>
                                    {nurse.nurse_mobile && (
                                      <div className="flex items-center space-x-1 mt-1">
                                        <Phone className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{nurse.nurse_mobile}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1 mt-1">
                                      <CalendarDays className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        Assigned: {new Date(nurse.assigned_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAssignPatientClick(nurse)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Assign Patient
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No OPD nurses assigned</p>
                          </div>
                        )}
                      </div>

                      {/* Ward Nurses */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Ward Nurses</h3>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            {assignedNurses.ward.count} nurses
                          </Badge>
                        </div>
                        {assignedNurses.ward.nurses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignedNurses.ward.nurses.map((nurse: any) => (
                              <div key={nurse.nurse_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-green-100 text-green-600">
                                      {nurse.nurse_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{nurse.nurse_name}</h4>
                                    <p className="text-sm text-gray-600 truncate">{nurse.nurse_email}</p>
                                    {nurse.nurse_mobile && (
                                      <div className="flex items-center space-x-1 mt-1">
                                        <Phone className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{nurse.nurse_mobile}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1 mt-1">
                                      <CalendarDays className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        Assigned: {new Date(nurse.assigned_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAssignPatientClick(nurse)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Assign Patient
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No ward nurses assigned</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </main>
        </SidebarInset>
      </div>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create prescription for {selectedAppointmentForPrescription?.Patient?.firstName} {selectedAppointmentForPrescription?.Patient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Vitals Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    placeholder="120/80"
                    value={prescriptionForm.vitals.bloodPressure}
                    onChange={(e) => updateVitals('bloodPressure', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    placeholder="72"
                    value={prescriptionForm.vitals.heartRate}
                    onChange={(e) => updateVitals('heartRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    placeholder="98.6"
                    value={prescriptionForm.vitals.temperature}
                    onChange={(e) => updateVitals('temperature', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    placeholder="70"
                    value={prescriptionForm.vitals.weight}
                    onChange={(e) => updateVitals('weight', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    placeholder="170"
                    value={prescriptionForm.vitals.height}
                    onChange={(e) => updateVitals('height', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Medicines Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Medicines</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPrescriptionForm(prev => ({
                      ...prev,
                      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Button>
              </div>
              
              <div className="space-y-4">
                {prescriptionForm.medicines.map((medicine, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Medicine Name</Label>
                      <Input
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="500mg"
                        value={medicine.dosage}
                        onChange={(e) => {
                          const newMedicines = [...prescriptionForm.medicines];
                          newMedicines[index].dosage = e.target.value;
                          setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Input
                        placeholder="2 times daily"
                        value={medicine.frequency}
                        onChange={(e) => {
                          const newMedicines = [...prescriptionForm.medicines];
                          newMedicines[index].frequency = e.target.value;
                          setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="7 days"
                          value={medicine.duration}
                          onChange={(e) => {
                            const newMedicines = [...prescriptionForm.medicines];
                            newMedicines[index].duration = e.target.value;
                            setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                          }}
                        />
                        {prescriptionForm.medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              const newMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
                              setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks Section */}
            <div>
              <Label>Remarks & Instructions</Label>
              <Textarea
                placeholder="Additional remarks, instructions for patient..."
                rows={4}
                value={prescriptionForm.remarks}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/doctor/prescriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      appointmentId: selectedAppointmentForPrescription?.id,
                      patientId: selectedAppointmentForPrescription?.Patient?.id,
                      vitals: prescriptionForm.vitals,
                      medicines: prescriptionForm.medicines.filter(med => med.name.trim() !== ''),
                      remarks: prescriptionForm.remarks
                    })
                  });

                  if (response.ok) {
                    setPrescriptionDialog(false);
                    setPrescriptionForm({
                      vitals: {
                        bloodPressure: '',
                        heartRate: '',
                        temperature: '',
                        weight: '',
                        height: ''
                      },
                      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
                      remarks: ''
                    });
                    alert('Prescription created successfully!');
                  } else {
                    const error = await response.json();
                    alert(error.message || 'Failed to create prescription');
                  }
                } catch (error) {
                  console.error('Error creating prescription:', error);
                  alert('Failed to create prescription');
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileEdit className="h-4 w-4 mr-1" />
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vitals Dialog */}
      <Dialog open={vitalsDialog} onOpenChange={setVitalsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Vitals</DialogTitle>
            <DialogDescription>
              {selectedPatientForVitals && (
                <>Vitals history for {selectedPatientForVitals.Patient?.firstName || selectedPatientForVitals.name} {selectedPatientForVitals.Patient?.lastName || ''}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {vitalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading vitals...</div>
              </div>
            ) : vitalsData.length > 0 ? (
              <div className="space-y-4">
                {vitalsData.map((vital: any, index: number) => (
                  <Card key={vital.id || index} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {new Date(vital.recorded_at).toLocaleDateString()} at {new Date(vital.recorded_at).toLocaleTimeString()}
                        </CardTitle>
                        <Badge variant={vital.status === 'Normal' ? 'default' : 'destructive'}>
                          {vital.status || 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">Recorded by: {vital.recorded_by || 'Staff'}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {vital.blood_pressure && (
                          <div>
                            <span className="font-medium text-gray-600">Blood Pressure:</span>
                            <p>{vital.blood_pressure}</p>
                          </div>
                        )}
                        {vital.pulse && (
                          <div>
                            <span className="font-medium text-gray-600">Pulse:</span>
                            <p>{vital.pulse} bpm</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <span className="font-medium text-gray-600">Temperature:</span>
                            <p>{vital.temperature}°F</p>
                          </div>
                        )}
                        {vital.oxygen_saturation && (
                          <div>
                            <span className="font-medium text-gray-600">Oxygen Saturation:</span>
                            <p>{vital.oxygen_saturation}%</p>
                          </div>
                        )}
                        {vital.respiratory_rate && (
                          <div>
                            <span className="font-medium text-gray-600">Respiratory Rate:</span>
                            <p>{vital.respiratory_rate}/min</p>
                          </div>
                        )}
                        {vital.weight && (
                          <div>
                            <span className="font-medium text-gray-600">Weight:</span>
                            <p>{vital.weight} kg</p>
                          </div>
                        )}
                        {vital.height && (
                          <div>
                            <span className="font-medium text-gray-600">Height:</span>
                            <p>{vital.height} cm</p>
                          </div>
                        )}
                      </div>
                      {vital.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-medium text-gray-600">Notes:</span>
                          <p className="text-sm mt-1">{vital.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HeartPulse className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No vitals recorded for this patient</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVitalsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={appointmentDetailsDialog} onOpenChange={setAppointmentDetailsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View complete appointment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointmentForDetails && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {selectedAppointmentForDetails.name ? selectedAppointmentForDetails.name.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedAppointmentForDetails.Patient?.firstName && selectedAppointmentForDetails.Patient?.lastName 
                      ? `${selectedAppointmentForDetails.Patient.firstName} ${selectedAppointmentForDetails.Patient.lastName}`
                      : selectedAppointmentForDetails.name || 'Unknown Patient'
                    }
                  </h3>
                  {getStatusBadge(selectedAppointmentForDetails.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="text-sm">{new Date(selectedAppointmentForDetails.appointmentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Time</Label>
                    <p className="text-sm">
                      {selectedAppointmentForDetails.appointmentTime 
                        ? new Date(`2000-01-01T${selectedAppointmentForDetails.appointmentTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '12:00'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <p className="text-sm capitalize">{selectedAppointmentForDetails.status}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Type</Label>
                    <p className="text-sm capitalize">
                      {selectedAppointmentForDetails.appointmentType?.replace('-', ' ') || 'Consultation'}
                    </p>
                  </div>
                  {selectedAppointmentForDetails.Patient?.contactNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Contact</Label>
                      <p className="text-sm">{selectedAppointmentForDetails.Patient.contactNumber}</p>
                    </div>
                  )}
                  {selectedAppointmentForDetails.Patient?.age && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Age</Label>
                      <p className="text-sm">{selectedAppointmentForDetails.Patient.age} years</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Reason for Visit</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedAppointmentForDetails.reason || 'General Consultation'}
                </p>
              </div>

              {(selectedAppointmentForDetails.createdBy?.name || selectedAppointmentForDetails.createdByName) && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Scheduled By</Label>
                  <p className="text-sm mt-1">
                    {selectedAppointmentForDetails.createdBy?.name || selectedAppointmentForDetails.createdByName}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentDetailsDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setAppointmentDetailsDialog(false);
                setSelectedAppointmentForPrescription(selectedAppointmentForDetails);
                setPrescriptionDialog(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileEdit className="h-4 w-4 mr-1" />
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Assignment Dialog */}
      <Dialog open={patientAssignmentDialog} onOpenChange={setPatientAssignmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Patient to Nurse</DialogTitle>
            <DialogDescription>
              Assign a patient to {selectedNurseForAssignment?.nurse_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                  ) : doctorPatients.length > 0 ? (
                    doctorPatients.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} - {patient.contact_number}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-patients" disabled>No patients found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPatientAssignmentDialog(false);
              setSelectedPatientId('');
              setSelectedNurseForAssignment(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePatientAssignment}
              disabled={!selectedPatientId || patientsLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Assign Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admitted Patient Prescription Dialog */}
      <Dialog open={admittedPatientPrescriptionDialog} onOpenChange={setAdmittedPatientPrescriptionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription - {selectedAdmittedPatient?.patient_name}</DialogTitle>
            <DialogDescription>
              Room: {selectedAdmittedPatient?.room_number || 'Not assigned'} • Admission: {selectedAdmittedPatient?.admission_code}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Vitals Display (Read-only) */}
            {selectedAdmittedPatient?.vitals && selectedAdmittedPatient.vitals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Vitals</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-blue-800">
                      Latest recorded vitals - {new Date(selectedAdmittedPatient.vitals[0].recorded_at).toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-600">
                      Recorded by: {selectedAdmittedPatient.vitals[0].recorded_by || 'System'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Blood Pressure</Label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAdmittedPatient.vitals[0].blood_pressure || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Heart Rate</Label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAdmittedPatient.vitals[0].heart_rate ? `${selectedAdmittedPatient.vitals[0].heart_rate} bpm` : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Temperature</Label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAdmittedPatient.vitals[0].temperature ? `${selectedAdmittedPatient.vitals[0].temperature}°F` : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Weight</Label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAdmittedPatient.vitals[0].weight ? `${selectedAdmittedPatient.vitals[0].weight} kg` : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">SpO2</Label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAdmittedPatient.vitals[0].oxygen_saturation ? `${selectedAdmittedPatient.vitals[0].oxygen_saturation}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New Vitals Input Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Record New Vitals (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bp">Blood Pressure</Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={admittedPatientPrescriptionForm.vitals.bloodPressure}
                    onChange={(e) => updateAdmittedPatientVitals('bloodPressure', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hr">Heart Rate (bpm)</Label>
                  <Input
                    id="hr"
                    placeholder="72"
                    value={admittedPatientPrescriptionForm.vitals.heartRate}
                    onChange={(e) => updateAdmittedPatientVitals('heartRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temp">Temperature (°F)</Label>
                  <Input
                    id="temp"
                    placeholder="98.6"
                    value={admittedPatientPrescriptionForm.vitals.temperature}
                    onChange={(e) => updateAdmittedPatientVitals('temperature', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="70"
                    value={admittedPatientPrescriptionForm.vitals.weight}
                    onChange={(e) => updateAdmittedPatientVitals('weight', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    placeholder="170"
                    value={admittedPatientPrescriptionForm.vitals.height}
                    onChange={(e) => updateAdmittedPatientVitals('height', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Latest Vitals Display */}
            {selectedAdmittedPatient?.vitals && selectedAdmittedPatient.vitals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Vitals History</h3>
                <div className="space-y-2">
                  {selectedAdmittedPatient.vitals.slice(0, 3).map((vital: any, index: number) => (
                    <div key={vital.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {new Date(vital.recorded_at).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Recorded by: {vital.recorded_by || 'System'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {vital.blood_pressure && <span>BP: {vital.blood_pressure}</span>}
                        {vital.heart_rate && <span>HR: {vital.heart_rate} bpm</span>}
                        {vital.temperature && <span>Temp: {vital.temperature}°F</span>}
                        {vital.oxygen_saturation && <span>SpO2: {vital.oxygen_saturation}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medicines Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Medications</h3>
                <Button type="button" variant="outline" size="sm" onClick={addAdmittedPatientMedicine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Button>
              </div>
              <div className="space-y-3">
                {admittedPatientPrescriptionForm.medicines.map((medicine, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                    <div>
                      <Label htmlFor={`medicine-${index}`}>Medicine Name</Label>
                      <Input
                        id={`medicine-${index}`}
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) => updateAdmittedPatientMedicine(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                      <Input
                        id={`dosage-${index}`}
                        placeholder="500mg"
                        value={medicine.dosage}
                        onChange={(e) => updateAdmittedPatientMedicine(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                      <Input
                        id={`frequency-${index}`}
                        placeholder="Twice daily"
                        value={medicine.frequency}
                        onChange={(e) => updateAdmittedPatientMedicine(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`duration-${index}`}>Duration</Label>
                        <Input
                          id={`duration-${index}`}
                          placeholder="7 days"
                          value={medicine.duration}
                          onChange={(e) => updateAdmittedPatientMedicine(index, 'duration', e.target.value)}
                        />
                      </div>
                      {admittedPatientPrescriptionForm.medicines.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAdmittedPatientMedicine(index)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks Section */}
            <div>
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Additional instructions or remarks..."
                value={admittedPatientPrescriptionForm.remarks}
                onChange={(e) => setAdmittedPatientPrescriptionForm(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmittedPatientPrescriptionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAdmittedPatientPrescription} className="bg-green-600 hover:bg-green-700">
              <FileEdit className="h-4 w-4 mr-1" />
              Save Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

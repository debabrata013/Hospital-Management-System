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
import { Heart, LayoutDashboard, Calendar, Users, FileText, Stethoscope, Bell, LogOut, Plus, Clock, Activity, TrendingUp, Eye, FlaskConical, Brain, Pill, User, Phone, MapPin, CalendarDays, FileEdit, HeartPulse, Loader2, Search, FileImage, Download } from 'lucide-react'
import NewbornSection from '@/doctor-dashboard-newborn-section';


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
      { title: "Ultrasonography reports", icon: FileImage, url: "/doctor/usg-reports" },
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
  const [admittedPatients, setAdmittedPatients] = useState<any[]>([]);
  const [admittedPatientsLoading, setAdmittedPatientsLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [recentPatientsLoading, setRecentPatientsLoading] = useState(true);
  const [assignedNurses, setAssignedNurses] = useState<any>({ opd: { count: 0, nurses: [] }, ward: { count: 0, nurses: [] } });
  const [nursesLoading, setNursesLoading] = useState(true);
  const [newbornRecords, setNewbornRecords] = useState<any[]>([]);
  const [newbornsLoading, setNewbornsLoading] = useState(true);
  
  // Calculate newborn stats from the records
  const newbornStats = {
    healthy: newbornRecords.filter(r => r.status === 'healthy').length,
    under_observation: newbornRecords.filter(r => r.status === 'under_observation').length,
    total: newbornRecords.length,
  };
  
  // Patient filter state
  const [patientFilter, setPatientFilter] = useState<'all' | 'active' | 'discharged'>('all');
  
  // Filter patients based on selected filter
  const filteredPatients = admittedPatients.filter(patient => {
    if (patientFilter === 'all') return true;
    return patient.status === patientFilter;
  });
  
  // Vitals modal states
  const [vitalsDialog, setVitalsDialog] = useState(false);
  const [dischargeDialog, setDischargeDialog] = useState(false);
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<any>(null);
  const [dischargeForm, setDischargeForm] = useState({
    admissionDiagnoses: '',
    treatingDoctor: '',
    dischargeDiagnoses: '',
    consults: '',
    procedures: '',
    hospitalCourse: '',
    // Investigations
    hbPercent: '',
    bloodGroup: '',
    hivStatus: '',
    hbsag: '',
    vdrl: '',
    sickling: '',
    rbs: '',
    investigationsNotes: '',
    // Discharge core
    dischargeTo: '',
    dischargeCondition: '',
    dischargeMedications: '',
    dischargeInstructions: '',
    whenToCall: '',
    pendingLabs: '',
    followUp: '',
    copyTo: '',
  });
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  
  // Auto-prefill gyn-specific instructions when dialog opens
  useEffect(() => {
    if (dischargeDialog && user?.department?.toLowerCase() === 'gynecology') {
      setDischargeForm(prev => ({
        ...prev,
        dischargeInstructions: prev.dischargeInstructions || 'Resume physical activity gradually.\nConsume protein and fibre rich food.\nDo not lift heavy weights.',
        whenToCall: prev.whenToCall || 'If you have chills and fever.\nDifficulty or pain when you urinate, or if you are urinating frequently with only small amounts of urine each time.\nHeavy, bright red bleeding saturating more than two pads in one hour.\nFainting episodes.\nRedness or severe pain in the breast area.\nPain, tiredness, redness or swelling in your calves or thighs.\nIf you have increased amount of pain medication with time.'
      }));
    }
    // Prefill admission diagnosis from selected patient at open
    if (dischargeDialog && selectedPatientForDischarge && !dischargeForm.admissionDiagnoses) {
      const adm = selectedPatientForDischarge.admission_diagnosis || selectedPatientForDischarge.admissionDiagnosis || selectedPatientForDischarge.diagnosis || '';
      setDischargeForm(prev => ({ ...prev, admissionDiagnoses: adm }));
    }
  }, [dischargeDialog, user]);
  
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

  // View reports modal states
  const [isViewReportsDialogOpen, setIsViewReportsDialogOpen] = useState(false);
  const [selectedPatientForReports, setSelectedPatientForReports] = useState<any>(null);
  const [patientReports, setPatientReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);


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

  const handleViewReportsClick = async (patient: any) => {
    setSelectedPatientForReports(patient);
    setIsViewReportsDialogOpen(true);
    setReportsLoading(true);
    try {
      const response = await fetch(`/api/doctor/reports/${patient.patient_id}` );
      if (response.ok) {
        const data = await response.json();
        setPatientReports(data.reports || []);
      } else {
        setPatientReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setPatientReports([]);
    } finally {
      setReportsLoading(false);
    }
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

  // Discharge functions
  const handleDischargePatient = async () => {
    if (!selectedPatientForDischarge) return;

    // Validate required fields
    const requiredFields = [
      'dischargeDiagnoses',
      'hospitalCourse', 
      'dischargeTo',
      'dischargeCondition',
      'dischargeMedications',
      'dischargeInstructions',
      'followUp'
    ];

    const missingFields = requiredFields.filter(field => !dischargeForm[field as keyof typeof dischargeForm]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('/api/doctor/discharge-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionId: selectedPatientForDischarge.admission_id,
          admissionCode: selectedPatientForDischarge.admission_code,
          patientId: selectedPatientForDischarge.patient_id,
          doctorId: selectedPatientForDischarge.doctor_id,
          dischargeSummary: {
            ...dischargeForm,
            // Persist investigations and when-to-call inside dischargeInstructions
            dischargeInstructions: [
              dischargeForm.dischargeInstructions,
              // Investigations block
              (dischargeForm.hbPercent || dischargeForm.bloodGroup || dischargeForm.hivStatus || dischargeForm.hbsag || dischargeForm.vdrl || dischargeForm.sickling || dischargeForm.rbs || dischargeForm.investigationsNotes)
                ? `Investigations:\nHB%: ${dischargeForm.hbPercent || '—'}\nBlood Group: ${dischargeForm.bloodGroup || '—'}\nHIV: ${dischargeForm.hivStatus || '—'}\nHBSAG: ${dischargeForm.hbsag || '—'}\nVDRL: ${dischargeForm.vdrl || '—'}\nSickling: ${dischargeForm.sickling || '—'}\nRBS: ${dischargeForm.rbs || '—'}${dischargeForm.investigationsNotes ? `\nNotes: ${dischargeForm.investigationsNotes}` : ''}`
                : '',
              // When to call block
              (dischargeForm.whenToCall && dischargeForm.whenToCall.trim())
                ? `When to call the doctor:\n${dischargeForm.whenToCall}`
                : (user?.department?.toLowerCase() === 'gynecology'
                    ? 'When to call the doctor:\nIf you have chills and fever.\nDifficulty or pain when you urinate, or if you are urinating frequently with only small amounts of urine each time.\nHeavy, bright red bleeding saturating more than two pads in one hour.\nFainting episodes.\nRedness or severe pain in the breast area.\nPain, tiredness, redness or swelling in your calves or thighs.\nIf you have increased amount of pain medication with time.'
                    : '')
            ].filter(Boolean).join('\n\n')
          },
          dischargedBy: user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Patient discharged successfully! Discharge Summary ID: ${data.dischargeSummaryId}`);
        setDischargeDialog(false);
        setSelectedPatientForDischarge(null);
        // Reset form
        setDischargeForm({
          admissionDiagnoses: '',
          treatingDoctor: '',
          dischargeDiagnoses: '',
          consults: '',
          procedures: '',
          hospitalCourse: '',
          hbPercent: '',
          bloodGroup: '',
          hivStatus: '',
          hbsag: '',
          vdrl: '',
          sickling: '',
          rbs: '',
          investigationsNotes: '',
          dischargeTo: '',
          dischargeCondition: '',
          dischargeMedications: '',
          dischargeInstructions: '',
          whenToCall: '',
          pendingLabs: '',
          followUp: '',
          copyTo: '',
        });
        // Refresh admitted patients
        fetchAdmittedPatients();
      } else {
        const errorData = await response.json();
        alert(`Failed to discharge patient: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error discharging patient:', error);
      alert('Error discharging patient. Please try again.');
    }
  };

  const handlePreviewPDF = () => {
    if (!selectedPatientForDischarge) return;

    // Create a new window for PDF preview
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Discharge Summary - ${selectedPatientForDischarge.patient_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; color: #333; margin-bottom: 5px; border-bottom: 1px solid #ccc; }
          .content { margin-left: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DISCHARGE SUMMARY</h1>
          <h2>NMSC Hospital</h2>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Patient Name:</strong> ${selectedPatientForDischarge.patient_name}</p>
          <p><strong>Patient ID:</strong> ${selectedPatientForDischarge.patient_code}</p>
          <p><strong>Admission Date:</strong> ${new Date(selectedPatientForDischarge.admission_date).toLocaleDateString()}</p>
          <p><strong>Discharge Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <div class="section-title">ADMISSION DIAGNOSIS:</div>
          <div class="content">${selectedPatientForDischarge.admission_diagnosis || selectedPatientForDischarge.admissionDiagnosis || selectedPatientForDischarge.diagnosis || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">TREATING DOCTOR:</div>
          <div class="content">${dischargeForm.treatingDoctor || user?.name || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE DIAGNOSIS:</div>
          <div class="content">${dischargeForm.dischargeDiagnoses || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">PROCEDURES:</div>
          <div class="content">${dischargeForm.procedures || 'None'}</div>
        </div>

        <div class="section">
          <div class="section-title">INVESTIGATIONS:</div>
          <div class="content">
            <div>HB%: ${dischargeForm.hbPercent || '—'}</div>
            <div>Blood Group: ${dischargeForm.bloodGroup || '—'}</div>
            <div>HIV: ${dischargeForm.hivStatus || '—'}</div>
            <div>HBSAG: ${dischargeForm.hbsag || '—'}</div>
            <div>VDRL: ${dischargeForm.vdrl || '—'}</div>
            <div>Sickling: ${dischargeForm.sickling || '—'}</div>
            <div>RBS: ${dischargeForm.rbs || '—'}</div>
            ${dischargeForm.investigationsNotes ? `<div style="margin-top:6px">Notes: ${dischargeForm.investigationsNotes}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">HOSPITAL COURSE:</div>
          <div class="content">${dischargeForm.hospitalCourse || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE CONDITION:</div>
          <div class="content">${dischargeForm.dischargeCondition || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE MEDICATIONS:</div>
          <div class="content">${dischargeForm.dischargeMedications || 'None'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE TO:</div>
          <div class="content">${dischargeForm.dischargeTo || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE CONDITION:</div>
          <div class="content">${dischargeForm.dischargeCondition || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE MEDICATIONS:</div>
          <div class="content">${dischargeForm.dischargeMedications || 'None'}</div>
        </div>

        <div class="section">
          <div class="section-title">DISCHARGE INSTRUCTIONS:</div>
          <div class="content">${dischargeForm.dischargeInstructions || 'None'}</div>
        </div>

        <div class="section">
          <div class="section-title">WHEN TO CALL THE DOCTOR:</div>
          <div class="content">${(dischargeForm.whenToCall || '').replace(/\n/g,'<br/>') || (user?.department?.toLowerCase() === 'gynecology' ? 'If you have chills and fever.<br/>Difficulty or pain when you urinate, or if you are urinating frequently with only small amounts of urine each time.<br/>Heavy, bright red bleeding saturating more than two pads in one hour.<br/>Fainting episodes.<br/>Redness or severe pain in the breast area.<br/>Pain, tiredness, redness or swelling in your calves or thighs.<br/>If you have increased amount of pain medication with time.' : 'As advised')}</div>
        </div>

        <div class="section">
          <div class="section-title">PENDING LABS:</div>
          <div class="content">${dischargeForm.pendingLabs || 'None'}</div>
        </div>

        <div class="section">
          <div class="section-title">FOLLOW-UP:</div>
          <div class="content">${dischargeForm.followUp || 'Not specified'}</div>
        </div>

        <div class="section">
          <div class="section-title">COPY TO:</div>
          <div class="content">${dischargeForm.copyTo || 'None'}</div>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Discharged by:</strong> Dr. ${user?.name || 'Doctor'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadDischargeSummary = async (patient: any) => {
    if (!patient.discharge_summary_id) {
      alert('No discharge summary found for this patient');
      return;
    }

    try {
      // Fetch the discharge summary data
      const response = await fetch(`/api/doctor/discharge-summary?id=${patient.discharge_summary_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch discharge summary');
      }
      
      const data = await response.json();
      const summary = data.dischargeSummary;

      // Create a new window for PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discharge Summary - ${summary.patient_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; color: #333; margin-bottom: 5px; border-bottom: 1px solid #ccc; }
            .content { margin-left: 10px; white-space: pre-wrap; }
            @media print { body { margin: 0; } }
            .print-button { margin: 20px 0; text-align: center; }
            .print-button button { 
              background: #007bff; color: white; border: none; padding: 10px 20px; 
              border-radius: 5px; cursor: pointer; margin: 0 10px; 
            }
            @media print { .print-button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DISCHARGE SUMMARY</h1>
            <h2>NMSC Hospital</h2>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Patient Name:</strong> ${summary.patient_name}</p>
            <p><strong>Patient ID:</strong> ${summary.patient_code}</p>
            <p><strong>Gender:</strong> ${summary.gender}</p>
            <p><strong>Age:</strong> ${summary.age}</p>
            <p><strong>Admission Date:</strong> ${new Date(summary.admission_date).toLocaleDateString()}</p>
            <p><strong>Discharge Date:</strong> ${new Date(summary.created_at).toLocaleDateString()}</p>
            <p><strong>Admission Type:</strong> ${summary.admission_type}</p>
          </div>

          <div class="section">
            <div class="section-title">ADMISSION DIAGNOSES:</div>
            <div class="content">${summary.admission_diagnosis || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">DISCHARGE DIAGNOSES:</div>
            <div class="content">${summary.discharge_diagnoses || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">CONSULTS:</div>
            <div class="content">${summary.consults || 'None'}</div>
          </div>

          <div class="section">
            <div class="section-title">PROCEDURES:</div>
            <div class="content">${summary.procedures || 'None'}</div>
          </div>

          <div class="section">
            <div class="section-title">HOSPITAL COURSE:</div>
            <div class="content">${summary.hospital_course || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">DISCHARGE TO:</div>
            <div class="content">${summary.discharge_to || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">DISCHARGE CONDITION:</div>
            <div class="content">${summary.discharge_condition || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">DISCHARGE MEDICATIONS:</div>
            <div class="content">${summary.discharge_medications || 'None'}</div>
          </div>

          <div class="section">
            <div class="section-title">DISCHARGE INSTRUCTIONS:</div>
            <div class="content">${summary.discharge_instructions || 'None'}</div>
          </div>

          <div class="section">
            <div class="section-title">PENDING LABS:</div>
            <div class="content">${summary.pending_labs || 'None'}</div>
          </div>

          <div class="section">
            <div class="section-title">FOLLOW-UP:</div>
            <div class="content">${summary.follow_up || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="section-title">COPY TO:</div>
            <div class="content">${summary.copy_to || 'None'}</div>
          </div>

          <div class="print-button">
            <button onclick="window.print()">🖨️ Print</button>
            <button onclick="window.close()">❌ Close</button>
          </div>

          <div style="margin-top: 40px; text-align: right;">
            <p><strong>Discharged by:</strong> Dr. ${summary.doctor_name}</p>
            <p><strong>Date:</strong> ${new Date(summary.created_at).toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error downloading discharge summary:', error);
      alert('Failed to download discharge summary. Please try again.');
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

    const fetchNewbornRecords = async () => {
      if (user?.department?.toLowerCase() !== 'gynecology') return;
      try {
        setNewbornsLoading(true);
        const response = await fetch('/api/doctor/newborn-records');
        if (response.ok) {
          const data = await response.json();
          setNewbornRecords(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching newborn records:", error);
      } finally {
        setNewbornsLoading(false);
      }
    };


    if (user) {
      fetchStats();
      fetchAdmittedPatients();
      fetchRecentPatients();
      fetchAssignedNurses();
      fetchNewbornRecords();
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/doctor/patients" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-pink-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-pink-100 rounded-lg">
                        <Users className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
                        <p className="text-sm text-gray-600">Access and manage patient files</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/doctor/opd-patients" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-pink-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-pink-100 rounded-lg">
                        <Stethoscope className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">OPD Patients</h3>
                        <p className="text-sm text-gray-600">View today's OPD patient list</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/doctor/ai-tools" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-pink-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-pink-100 rounded-lg">
                        <Brain className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                        <p className="text-sm text-gray-600">Clinical decision support tools</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Newborn Records Section */}
            {user?.department?.toLowerCase() === 'gynecology' && (
              <div className="mt-8">
                <NewbornSection user={user} newbornStats={newbornStats} />
              </div>
            )}

            {/* Patient Management Section */}
            <Card className="border-pink-100 mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Patient Management</CardTitle>
                    <CardDescription>Active admissions and recent discharges under your care</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={patientFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 ${patientFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-600 border-gray-200'}`}
                      onClick={() => setPatientFilter('all')}
                    >
                      All ({admittedPatients.length})
                    </Button>
                    <Button
                      variant={patientFilter === 'active' ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 ${patientFilter === 'active' ? 'bg-blue-600 text-white' : 'text-blue-600 border-blue-200'}`}
                      onClick={() => setPatientFilter('active')}
                    >
                      {admittedPatients.filter(p => p.status === 'active').length} Active
                    </Button>
                    <Button
                      variant={patientFilter === 'discharged' ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 ${patientFilter === 'discharged' ? 'bg-green-600 text-white' : 'text-green-600 border-green-200'}`}
                      onClick={() => setPatientFilter('discharged')}
                    >
                      {admittedPatients.filter(p => p.status === 'discharged').length} Discharged
                    </Button>
                  </div>
                </div>
              </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {admittedPatientsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading admitted patients...</div>
                      </div>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient: any) => (
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
                              {patient.status === 'active' ? (
                                <>
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
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-full text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                    onClick={() => {
                                      setSelectedPatientForDischarge(patient);
                                      setDischargeDialog(true);
                                    }}
                                  >
                                    <LogOut className="h-3 w-3 mr-1" />
                                    Discharge
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-full text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                    onClick={() => handleViewReportsClick(patient)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Reports
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    Discharged
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={() => handleDownloadDischargeSummary(patient)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Export PDF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-full text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                    onClick={() => handleViewReportsClick(patient)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Reports
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>
                          {patientFilter === 'all' 
                            ? 'No patients currently admitted'
                            : patientFilter === 'active'
                            ? 'No active patients'
                            : 'No discharged patients'
                          }
                        </p>
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

          </main>
        </SidebarInset>
      </div>

      {/* View Reports Dialog */}
      <Dialog open={isViewReportsDialogOpen} onOpenChange={setIsViewReportsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reports for {selectedPatientForReports?.patient_name}</DialogTitle>
            <DialogDescription>
              Viewing all uploaded test reports for this patient.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {reportsLoading ? (
              <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>
            ) : patientReports.length > 0 ? (
              <ul className="space-y-3">
                {patientReports.map(report => (
                  <li key={report.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <a href={report.file_path} target="_blank" rel="noopener noreferrer" className="font-medium text-pink-600 hover:underline">
                        {report.report_name}
                      </a>
                      <p className="text-sm text-gray-500">Uploaded by {report.nurse_name} on {new Date(report.upload_date).toLocaleString()}</p>
                    </div>
                    <a href={report.file_path} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No reports found for this patient.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Discharge Summary Dialog */}
      <Dialog open={dischargeDialog} onOpenChange={setDischargeDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Discharge Summary</DialogTitle>
            <DialogDescription>
              Complete the discharge summary for {selectedPatientForDischarge?.patient_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Patient Info Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patient:</span> {selectedPatientForDischarge?.patient_name}
                </div>
                <div>
                  <span className="font-medium">Patient ID:</span> {selectedPatientForDischarge?.patient_code}
                </div>
                <div>
                  <span className="font-medium">Admission Date:</span> {selectedPatientForDischarge?.admission_date ? new Date(selectedPatientForDischarge.admission_date).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Discharge Date:</span> {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Admission Diagnosis */}
            <div>
              <Label htmlFor="admissionDiagnoses" className="text-sm font-medium">
                Admission Diagnosis
              </Label>
              <p className="text-xs text-gray-600 mb-2">Initial diagnosis based on presenting information, or reason for admission based on symptoms if tentative diagnosis not possible.</p>
              <Textarea 
                id="admissionDiagnoses" 
                className="min-h-[80px]"
                placeholder="Enter admission diagnosis..."
                value={dischargeForm.admissionDiagnoses}
                onChange={(e)=> setDischargeForm({ ...dischargeForm, admissionDiagnoses: e.target.value })}
              />
            </div>

            {/* Treating Doctor */}
            <div>
              <Label htmlFor="treatingDoctor" className="text-sm font-medium">Treating Doctor</Label>
              <Input 
                id="treatingDoctor"
                placeholder="Enter treating doctor name"
                value={dischargeForm.treatingDoctor}
                onChange={(e)=> setDischargeForm({...dischargeForm, treatingDoctor: e.target.value})}
              />
            </div>

            {/* Discharge Diagnosis */}
            <div>
              <Label htmlFor="dischargeDiagnoses" className="text-sm font-medium">
                Discharge Diagnosis *
              </Label>
              <p className="text-xs text-gray-600 mb-2">Concluding diagnosis(es) based on testing, studies, examination, etc.</p>
              <Textarea 
                id="dischargeDiagnoses" 
                placeholder="Enter final diagnosis based on tests and examination..."
                value={dischargeForm.dischargeDiagnoses} 
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeDiagnoses: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>

            {/* Consults */}
            <div>
              <Label htmlFor="consults" className="text-sm font-medium">
                Consults
              </Label>
              <p className="text-xs text-gray-600 mb-2">Any consultation(s) had during stay, including dates, specialty(ies) involved, findings or recommendations.</p>
              <Textarea 
                id="consults" 
                placeholder="List consultations with dates, specialties, and recommendations..."
                value={dischargeForm.consults} 
                onChange={(e) => setDischargeForm({...dischargeForm, consults: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>

            {/* Procedures */}
            <div>
              <Label htmlFor="procedures" className="text-sm font-medium">
                Procedures
              </Label>
              <p className="text-xs text-gray-600 mb-2">Any procedure(s) had during stay, including dates, specialty(ies) involved, findings or recommendations.</p>
              <Textarea 
                id="procedures" 
                placeholder="List procedures with dates, specialties, and outcomes..."
                value={dischargeForm.procedures} 
                onChange={(e) => setDischargeForm({...dischargeForm, procedures: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>

            {/* Investigations (no header label requested) */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hbPercent" className="text-sm font-medium">HB% (g/dL)</Label>
                  <Input id="hbPercent" type="text" inputMode="decimal" placeholder="12"
                    value={dischargeForm.hbPercent}
                    onChange={(e)=>{ const v=e.target.value; if(/^\d*(?:\.\d*)?$/.test(v)) setDischargeForm({...dischargeForm, hbPercent: v}) }}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodGroup" className="text-sm font-medium">Blood Group</Label>
                  <select id="bloodGroup" className="w-full border rounded-md h-9 px-3"
                    value={dischargeForm.bloodGroup}
                    onChange={(e)=> setDischargeForm({...dischargeForm, bloodGroup: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hivStatus" className="text-sm font-medium">HIV</Label>
                  <select id="hivStatus" className="w-full border rounded-md h-9 px-3"
                    value={dischargeForm.hivStatus}
                    onChange={(e)=> setDischargeForm({...dischargeForm, hivStatus: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hbsag" className="text-sm font-medium">HBSAG</Label>
                  <select id="hbsag" className="w-full border rounded-md h-9 px-3"
                    value={dischargeForm.hbsag}
                    onChange={(e)=> setDischargeForm({...dischargeForm, hbsag: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Reactive">Reactive</option>
                    <option value="Non-reactive">Non-reactive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="vdrl" className="text-sm font-medium">VDRL</Label>
                  <select id="vdrl" className="w-full border rounded-md h-9 px-3"
                    value={dischargeForm.vdrl}
                    onChange={(e)=> setDischargeForm({...dischargeForm, vdrl: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Reactive">Reactive</option>
                    <option value="Non-reactive">Non-reactive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sickling" className="text-sm font-medium">Sickling</Label>
                  <select id="sickling" className="w-full border rounded-md h-9 px-3"
                    value={dischargeForm.sickling}
                    onChange={(e)=> setDischargeForm({...dischargeForm, sickling: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="rbs" className="text-sm font-medium">RBS (mg/dL)</Label>
                  <Input id="rbs" type="text" inputMode="numeric" placeholder="110"
                    value={dischargeForm.rbs}
                    onChange={(e)=>{ const v=e.target.value; if(/^\d*$/.test(v)) setDischargeForm({...dischargeForm, rbs: v}) }}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="investigationsNotes" className="text-sm font-medium">Other Investigation Notes</Label>
                <Textarea id="investigationsNotes" placeholder="Any additional investigation details..."
                  value={dischargeForm.investigationsNotes}
                  onChange={(e)=> setDischargeForm({...dischargeForm, investigationsNotes: e.target.value})}
                />
              </div>
            </div>

            {/* Hospital Course */}
            <div>
              <Label htmlFor="hospitalCourse" className="text-sm font-medium">
                Hospital Course *
              </Label>
              <p className="text-xs text-gray-600 mb-2">Consider what information would be important for you as the primary, or receiving physician seeing the patient in follow-up. Be succinct and only include pertinent information.</p>
              <Textarea 
                id="hospitalCourse" 
                placeholder="Describe the patient's hospital stay, treatments, and progress..."
                value={dischargeForm.hospitalCourse} 
                onChange={(e) => setDischargeForm({...dischargeForm, hospitalCourse: e.target.value})} 
                className="min-h-[100px]"
              />
            </div>

            {/* Discharge To */}
            <div>
              <Label htmlFor="dischargeTo" className="text-sm font-medium">
                Discharge To *
              </Label>
              <p className="text-xs text-gray-600 mb-2">Home or facility, include homecare if applicable.</p>
              <Input 
                id="dischargeTo" 
                placeholder="e.g., Home, Nursing facility, Rehabilitation center..."
                value={dischargeForm.dischargeTo} 
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeTo: e.target.value})} 
              />
            </div>

            {/* Discharge Condition */}
            <div>
              <Label htmlFor="dischargeCondition" className="text-sm font-medium">
                Discharge Condition *
              </Label>
              <p className="text-xs text-gray-600 mb-2">One line summary of patient's condition.</p>
              <Input 
                id="dischargeCondition" 
                placeholder="e.g., Stable, Improved, Good condition..."
                value={dischargeForm.dischargeCondition} 
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeCondition: e.target.value})} 
              />
            </div>

            {/* Discharge Medications */}
            <div>
              <Label htmlFor="dischargeMedications" className="text-sm font-medium">
                Discharge Medications *
              </Label>
              <p className="text-xs text-gray-600 mb-2">Include doses, frequency, length of therapy, and any changes to pre-existing medications.</p>
              <Textarea 
                id="dischargeMedications" 
                placeholder="List medications with dosage, frequency, and duration..."
                value={dischargeForm.dischargeMedications} 
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeMedications: e.target.value})} 
                className="min-h-[100px]"
              />
            </div>

            {/* Discharge Instructions */}
            <div>
              <Label htmlFor="dischargeInstructions" className="text-sm font-medium">
                Discharge Instructions *
              </Label>
              <p className="text-xs text-gray-600 mb-2">List all instructions that were written on patient's discharge form.</p>
              <Textarea 
                id="dischargeInstructions" 
                placeholder="Activity restrictions, diet, wound care..."
                value={dischargeForm.dischargeInstructions} 
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeInstructions: e.target.value})} 
                className="min-h-[100px]"
              />
              {user?.department?.toLowerCase() === 'gynecology' && !dischargeForm.dischargeInstructions && (
                <p className="text-xs text-gray-500 mt-2">Tip: For gynecology patients, include: Resume physical activity gradually; Consume protein and fibre rich food; Do not lift heavy weights.</p>
              )}
            </div>

            {/* When to call the doctor */}
            <div>
              <Label htmlFor="whenToCall" className="text-sm font-medium">When to call the doctor</Label>
              <Textarea id="whenToCall" placeholder="If you have chills and fever; difficulty or pain when you urinate or frequent small urination; heavy bright red bleeding saturating >2 pads in one hour; fainting episodes; redness or severe pain in the breast; pain/tiredness/redness/swelling in calves or thighs; increased amount of pain medication with time..."
                value={dischargeForm.whenToCall}
                onChange={(e)=> setDischargeForm({...dischargeForm, whenToCall: e.target.value})}
                className="min-h-[80px]"
              />
            </div>

            {/* Pending Labs */}
            <div>
              <Label htmlFor="pendingLabs" className="text-sm font-medium">
                Pending Labs
              </Label>
              <p className="text-xs text-gray-600 mb-2">List all lab results that have not yet arrived at time of dictation, as well as any lab results that arrived between time of discharge and time of dictation.</p>
              <Textarea 
                id="pendingLabs" 
                placeholder="List pending laboratory results and follow-up requirements..."
                value={dischargeForm.pendingLabs} 
                onChange={(e) => setDischargeForm({...dischargeForm, pendingLabs: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>

            {/* Follow-Up */}
            <div>
              <Label htmlFor="followUp" className="text-sm font-medium">
                Follow-Up *
              </Label>
              <p className="text-xs text-gray-600 mb-2">List all follow-up appointments with dates, times, names of physicians/services involved, and contact information.</p>
              <Textarea 
                id="followUp" 
                placeholder="Appointment dates, physician names, contact information..."
                value={dischargeForm.followUp} 
                onChange={(e) => setDischargeForm({...dischargeForm, followUp: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>

            {/* Copy To */}
            <div>
              <Label htmlFor="copyTo" className="text-sm font-medium">
                Copy To (Primary Care Provider)
              </Label>
              <p className="text-xs text-gray-600 mb-2">Request a copy sent to the primary care provider (PCP) which includes PCP's fax, address and phone number.</p>
              <Textarea 
                id="copyTo" 
                placeholder="Primary care provider name, address, phone, and fax..."
                value={dischargeForm.copyTo} 
                onChange={(e) => setDischargeForm({...dischargeForm, copyTo: e.target.value})} 
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setDischargeDialog(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" onClick={handlePreviewPDF}>
                <Eye className="h-4 w-4 mr-1" />
                Preview PDF
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleDischargePatient}>
                <LogOut className="h-4 w-4 mr-1" />
                Save & Discharge Patient
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reports Dialog */}
      <Dialog open={isViewReportsDialogOpen} onOpenChange={setIsViewReportsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reports for {selectedPatientForReports?.patient_name}</DialogTitle>
            <DialogDescription>
              Viewing all uploaded test reports for this patient.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {reportsLoading ? (
              <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>
            ) : patientReports.length > 0 ? (
              <ul className="space-y-3">
                {patientReports.map(report => (
                  <li key={report.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <a href={report.file_path} target="_blank" rel="noopener noreferrer" className="font-medium text-pink-600 hover:underline">
                        {report.report_name}
                      </a>
                      <p className="text-sm text-gray-500">Uploaded by {report.nurse_name} on {new Date(report.upload_date).toLocaleString()}</p>
                    </div>
                    <a href={report.file_path} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No reports found for this patient.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}

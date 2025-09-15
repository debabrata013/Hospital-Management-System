
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ArrowLeft,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Thermometer,
  Stethoscope,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'

// Define types for our data for better type safety
interface Patient {
  id: string;
  name: string;
}

interface VitalRecord {
    id: string;
    patientId: string;
    patientName: string;
    recordedAt: string;
    recordedBy: string;
    vitals: {
        bloodPressure: string;
        pulse: string;
        temperature: string;
        oxygenSaturation: string;
        respiratoryRate: string;
        weight: string;
        height: string;
    };
    status: string;
    notes: string;
}

const initialFormState = {
    patientId: '',
    time: new Date().toTimeString().slice(0, 5),
    bloodPressure: '',
    pulse: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    weight: '',
    status: '',
    notes: ''
};

const statusOptions = ["All", "Normal", "Good", "Abnormal", "Critical"];

export default function StaffVitalsPage() {
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([]);
  const [pendingVitals, setPendingVitals] = useState<any[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState("history");
  const [newVitalsDialog, setNewVitalsDialog] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [selectedVital, setSelectedVital] = useState<VitalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState('All');
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/staff/patients');
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || `API Error: ${response.status} ${response.statusText}`);
            }
            setPatients(data.patients || []);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message || 'An unexpected error occurred while fetching data.');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    fetchPatients();
    setPendingVitals([]); // Initialize pending vitals as empty
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveVitals = () => {
    if (!formState.patientId) {
      alert("Please select a patient.");
      return;
    }

    const patientDetails = patients.find(p => p.id === formState.patientId);
    const newVital: VitalRecord = {
      id: `V${Date.now()}`,
      patientId: formState.patientId,
      patientName: patientDetails?.name || "Unknown Patient",
      recordedAt: new Date().toISOString(),
      recordedBy: "Staff Nurse",
      vitals: {
        bloodPressure: formState.bloodPressure,
        pulse: formState.pulse,
        temperature: formState.temperature,
        oxygenSaturation: formState.oxygenSaturation,
        respiratoryRate: formState.respiratoryRate,
        weight: formState.weight,
        height: "170"
      },
      status: formState.status || 'Normal',
      notes: formState.notes
    };

    setVitalsHistory(prev => [newVital, ...prev]);
    setNewVitalsDialog(false);
    setFormState(initialFormState);
  };

  const openNewVitalsDialog = (patient: any = null) => {
    setFormState({ ...initialFormState, patientId: patient ? patient.patientId : '' });
    setNewVitalsDialog(true);
  }

  const handleViewDetails = (record: VitalRecord) => {
      setSelectedVital(record);
      setViewDetailsDialog(true);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical': return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      case 'Normal': return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
      case 'Good': return <Badge className="bg-blue-100 text-blue-700">Good</Badge>;
      case 'Abnormal': return <Badge className="bg-yellow-100 text-yellow-700">Abnormal</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  }

  const getVitalTrend = (current: string, previous?: string) => {
      if (!previous) return <Minus className="h-4 w-4 text-gray-400" />;
      const currentNum = parseFloat(current);
      const previousNum = parseFloat(previous);
      if (isNaN(currentNum) || isNaN(previousNum)) return <Minus className="h-4 w-4 text-gray-400" />;
      if (currentNum > previousNum) return <TrendingUp className="h-4 w-4 text-red-500" />;
      if (currentNum < previousNum) return <TrendingDown className="h-4 w-4 text-green-500" />;
      return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const filteredHistory = vitalsHistory.filter(record => {
      const searchMatch = record.patientName.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = filterStatus === 'All' || record.status === filterStatus;
      return searchMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/staff" className="flex items-center space-x-2"><ArrowLeft className="h-4 w-4" /><span>Back</span></Link>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Vitals & Status Updates</h1>
                    <p className="text-sm text-gray-500">Record and monitor patient vital signs</p>
                </div>
            </div>
            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => openNewVitalsDialog()}>
                <Plus className="h-4 w-4 mr-2" />Record Vitals
            </Button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Pending Vitals</p><p className="text-3xl font-bold">{loading ? '...' : pendingVitals.length}</p></div><div className="bg-green-100 p-3 rounded-xl"><Clock className="h-8 w-8 text-green-600" /></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Recorded Today</p><p className="text-3xl font-bold">{vitalsHistory.length}</p></div><div className="bg-blue-100 p-3 rounded-xl"><Activity className="h-8 w-8 text-blue-600" /></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Critical Alerts</p><p className="text-3xl font-bold">{vitalsHistory.filter(v => v.status === 'Critical').length}</p></div><div className="bg-red-100 p-3 rounded-xl"><AlertTriangle className="h-8 w-8 text-red-600" /></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Normal Status</p><p className="text-3xl font-bold">{vitalsHistory.filter(v => v.status === 'Normal' || v.status === 'Good').length}</p></div><div className="bg-yellow-100 p-3 rounded-xl"><CheckCircle className="h-8 w-8 text-yellow-600" /></div></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList><TabsTrigger value="history">Vitals History</TabsTrigger><TabsTrigger value="pending">Pending Vitals</TabsTrigger></TabsList>
            <div className="flex items-center gap-2">
              <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/></div>
              <Popover>
                  <PopoverTrigger asChild>
                      <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filter</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                      <div className="flex flex-col space-y-1">
                          {statusOptions.map(status => (
                              <Button key={status} variant={filterStatus === status ? "secondary" : "ghost"} size="sm" onClick={() => setFilterStatus(status)}>{status}</Button>
                          ))}
                      </div>
                  </PopoverContent>
              </Popover>
            </div>
          </div>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Vitals History</CardTitle><CardDescription>Showing {filteredHistory.length} of {vitalsHistory.length} records</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {error ? <p className="text-center text-red-500 py-8">{error}</p> : 
                  loading ? <p className="text-center text-gray-500 py-8">Loading patients...</p> : 
                  filteredHistory.length === 0 ? <p className="text-center text-gray-500 py-8">No matching vitals found.</p> : 
                  filteredHistory.map((record, index) => {
                    const previousRecord = vitalsHistory.find(v => v.patientId === record.patientId && v.id !== record.id);
                    return (
                    <Card key={record.id}><CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4"><div><h3 className="text-lg font-semibold">{record.patientName}</h3><p className="text-sm text-gray-600">Recorded by {record.recordedBy} • {new Date(record.recordedAt).toLocaleString()}</p></div><div className="flex items-center space-x-2">{getStatusBadge(record.status)}<Button variant="outline" size="sm" onClick={() => handleViewDetails(record)}><Eye className="h-4 w-4 mr-2" />View Details</Button></div></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-red-50 p-3 rounded-lg"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Heart className="h-4 w-4 text-red-500" /><span className="text-sm font-medium">Blood Pressure</span></div>{getVitalTrend(record.vitals.bloodPressure, previousRecord?.vitals.bloodPressure)}</div><p className="text-lg font-semibold">{record.vitals.bloodPressure} mmHg</p></div>
                          <div className="bg-blue-50 p-3 rounded-lg"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Activity className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium">Pulse</span></div>{getVitalTrend(record.vitals.pulse, previousRecord?.vitals.pulse)}</div><p className="text-lg font-semibold">{record.vitals.pulse} bpm</p></div>
                          <div className="bg-orange-50 p-3 rounded-lg"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Thermometer className="h-4 w-4 text-orange-500" /><span className="text-sm font-medium">Temp</span></div>{getVitalTrend(record.vitals.temperature, previousRecord?.vitals.temperature)}</div><p className="text-lg font-semibold">{record.vitals.temperature}°F</p></div>
                          <div className="bg-green-50 p-3 rounded-lg"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Stethoscope className="h-4 w-4 text-green-500" /><span className="text-sm font-medium">O2 Sat.</span></div>{getVitalTrend(record.vitals.oxygenSaturation, previousRecord?.vitals.oxygenSaturation)}</div><p className="text-lg font-semibold">{record.vitals.oxygenSaturation}%</p></div>
                        </div>
                    </CardContent></Card>
                  )})}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
              <Card><CardHeader><CardTitle>Pending Vitals</CardTitle><CardDescription>This feature is not yet implemented.</CardDescription></CardHeader><CardContent><p className="text-center text-gray-500 py-8">No pending vitals to show.</p></CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={newVitalsDialog} onOpenChange={setNewVitalsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>Record Patient Vitals</DialogTitle><DialogDescription>Enter vital signs for the selected patient.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="patientId">Patient</Label><Select value={formState.patientId} onValueChange={(v) => handleSelectChange('patientId', v)}><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="time">Time</Label><Input id="time" type="time" value={formState.time} onChange={handleInputChange} /></div></div>
            <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="bloodPressure">Blood Pressure</Label><Input id="bloodPressure" placeholder="120/80" value={formState.bloodPressure} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="pulse">Pulse</Label><Input id="pulse" placeholder="72" value={formState.pulse} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="temperature">Temperature</Label><Input id="temperature" placeholder="98.6" value={formState.temperature} onChange={handleInputChange} /></div></div>
            <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="oxygenSaturation">Oxygen Sat.</Label><Input id="oxygenSaturation" placeholder="98" value={formState.oxygenSaturation} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="respiratoryRate">Resp. Rate</Label><Input id="respiratoryRate" placeholder="16" value={formState.respiratoryRate} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" placeholder="70" value={formState.weight} onChange={handleInputChange} /></div></div>
            <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formState.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{statusOptions.slice(1).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" placeholder="Additional observations..." value={formState.notes} onChange={handleInputChange} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setNewVitalsDialog(false)}>Cancel</Button><Button className="bg-green-500 hover:bg-green-600" onClick={handleSaveVitals}>Save Vitals</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Vitals Details</DialogTitle><DialogDescription>Full vital sign record for {selectedVital?.patientName}.</DialogDescription></DialogHeader>
              {selectedVital && (
                  <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between"><div><p className="font-semibold">{selectedVital.patientName}</p><p className="text-sm text-gray-500">Recorded by {selectedVital.recordedBy}</p><p className="text-sm text-gray-500">{new Date(selectedVital.recordedAt).toLocaleString()}</p></div>{getStatusBadge(selectedVital.status)}</div>
                      <div className="border-t pt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                          <p><span className="font-medium text-gray-600">Blood Pressure:</span> {selectedVital.vitals.bloodPressure} mmHg</p>
                          <p><span className="font-medium text-gray-600">Pulse Rate:</span> {selectedVital.vitals.pulse} bpm</p>
                          <p><span className="font-medium text-gray-600">Temperature:</span> {selectedVital.vitals.temperature}°F</p>
                          <p><span className="font-medium text-gray-600">Oxygen Saturation:</span> {selectedVital.vitals.oxygenSaturation}%</p>
                          <p><span className="font-medium text-gray-600">Respiratory Rate:</span> {selectedVital.vitals.respiratoryRate}/min</p>
                          <p><span className="font-medium text-gray-600">Weight:</span> {selectedVital.vitals.weight} kg</p>
                      </div>
                      {selectedVital.notes && <div className="bg-gray-50 p-3 rounded-lg text-sm"><p className="font-medium text-gray-600 mb-1">Notes:</p>{selectedVital.notes}</div>}
                  </div>
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={() => setViewDetailsDialog(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}

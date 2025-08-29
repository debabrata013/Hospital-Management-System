"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Plus, Save, Brain, FileText, Pill } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

export default function NewConsultationPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temp: '', weight: '', pulse: '', respiration: '', oxygen: '' });
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', frequency: '', duration: '' }]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error(error);
        toast.error('Could not load patient list.');
      }
    };
    fetchPatients();
  }, []);

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handlePrescriptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [name]: value };
    setPrescriptions(newPrescriptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/doctor/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          patientId, 
          vitals, 
          chiefComplaint, 
          clinicalNotes, 
          diagnosis, 
          prescriptions: prescriptions.filter(p => p.medicine) // Filter out empty prescriptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save consultation');
      }

      toast.success('Consultation saved successfully!');
      router.push('/doctor/consultations');
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to save: ${errorMessage}`);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Stethoscope className="h-8 w-8 mr-3 text-pink-500" />
          New Consultation
        </h1>
        <p className="text-gray-600 mt-2">Create a new consultation record for a patient.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-pink-500" />
              Consultation Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Select Patient</h4>
              <Select onValueChange={setPatientId} value={patientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{`${p.firstName} ${p.lastName}`} (ID: {p.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {patientId && (
              <>
                {/* Vitals Entry */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Enter Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input name="bp" value={vitals.bp} onChange={handleVitalChange} placeholder="Blood Pressure (e.g., 120/80)" />
                    <Input name="temp" value={vitals.temp} onChange={handleVitalChange} placeholder="Temperature (°F)" />
                    <Input name="weight" value={vitals.weight} onChange={handleVitalChange} placeholder="Weight (kg)" />
                    <Input name="pulse" value={vitals.pulse} onChange={handleVitalChange} placeholder="Pulse (bpm)" />
                    <Input name="respiration" value={vitals.respiration} onChange={handleVitalChange} placeholder="Respiration" />
                    <Input name="oxygen" value={vitals.oxygen} onChange={handleVitalChange} placeholder="Oxygen Saturation (%)" />
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="Chief Complaint" rows={3} />
                    <Textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} placeholder="Clinical Notes" rows={4} />
                    <Textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Diagnosis" rows={2} />
                  </div>

                  {/* Prescription Section */}
                  <div className="p-4 bg-green-50 rounded-lg space-y-4">
                    <h4 className="font-semibold text-green-900 flex items-center"><Pill className="h-4 w-4 mr-2" />Prescription</h4>
                    {prescriptions.map((p, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input name="medicine" value={p.medicine} onChange={e => handlePrescriptionChange(i, e)} placeholder="Medicine" />
                        <Input name="dosage" value={p.dosage} onChange={e => handlePrescriptionChange(i, e)} placeholder="Dosage" />
                        <Input name="frequency" value={p.frequency} onChange={e => handlePrescriptionChange(i, e)} placeholder="Frequency" />
                        <Input name="duration" value={p.duration} onChange={e => handlePrescriptionChange(i, e)} placeholder="Duration" />
                      </div>
                    ))}
                    <Button type="button" onClick={handleAddPrescription} variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-100">
                      <Plus className="h-4 w-4 mr-2" />Add Medicine
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Consultation
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

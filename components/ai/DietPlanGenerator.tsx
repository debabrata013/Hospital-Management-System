import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Utensils, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DietPlanGeneratorProps {
  onApproval?: () => void;
}

const DietPlanGenerator = ({ onApproval }: DietPlanGeneratorProps) => {
  const { authState } = useAuth();
  const [notes, setNotes] = useState('');
  const [dietPlan, setDietPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients...');
      const response = await fetch('/api/patients');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Patients data:', data);
        setPatients(data);
      } else {
        console.error('Failed to fetch patients:', response.status, response.statusText);
        // Set fallback data if API fails
        setPatients([
          { id: 'P001', name: 'राम शर्मा', age: 45 },
          { id: 'P002', name: 'सीता देवी', age: 32 },
          { id: 'P003', name: 'अमित कुमार', age: 28 },
          { id: 'P004', name: 'प्रिया गुप्ता', age: 35 },
          { id: 'P005', name: 'राज पटेल', age: 52 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Set fallback data if network error
      setPatients([
        { id: 'P001', name: 'राम शर्मा', age: 45 },
        { id: 'P002', name: 'सीता देवी', age: 32 },
        { id: 'P003', name: 'अमित कुमार', age: 28 },
        { id: 'P004', name: 'प्रिया गुप्ता', age: 35 },
        { id: 'P005', name: 'राज पटेल', age: 52 }
      ]);
    }
  };

  const handleGenerateDietPlan = async () => {
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/diet-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data.dietPlan);
      setIsApproved(false); // Reset approval status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!dietPlan || !selectedPatient) return;
    
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'diet_plan',
          patientId: patient.id,
          patientName: patient.name,
          content: dietPlan,
          doctorId: authState.user?.id || 'D001',
          doctorName: authState.user?.name || 'Dr. Current User',
          originalNotes: notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve diet plan');
      }

      const data = await response.json();
      setIsApproved(true);
      // Notify parent component to refresh stats
      if (onApproval) {
        onApproval();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (newPlan: string) => {
    setDietPlan(newPlan);
    setIsApproved(false); // Reset approval if edited
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">AI-Powered Diet Plan Generator</h2>
      <div className="flex flex-col gap-4">
        {/* Patient Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Select Patient ({patients.length} available)
          </label>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={patients.length === 0 ? "Loading patients..." : "Choose a patient..."} />
            </SelectTrigger>
            <SelectContent>
              {patients.length === 0 ? (
                <SelectItem value="loading" disabled>
                  Loading patients...
                </SelectItem>
              ) : (
                patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id}) - Age: {patient.age}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter doctor's notes about patient's dietary requirements, conditions, allergies, etc..."
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          onClick={handleGenerateDietPlan}
          disabled={isLoading || !notes.trim() || !selectedPatient}
        >
          {isLoading ? 'Generating Diet Plan...' : 'Generate Diet Plan'}
        </button>
        
        {error && <p className="text-red-500">{error}</p>}
        
        {dietPlan && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Generated Diet Plan:</h3>
            <textarea
              className="w-full p-2 border rounded bg-white"
              rows={8}
              value={dietPlan}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEdit(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button
                className={`px-4 py-2 rounded ${
                  isApproved 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={handleApprove}
                disabled={isApproved}
              >
                {isApproved ? 'Approved ✓' : 'Approve & Save to Record'}
              </button>
              {isApproved && (
                <span className="text-green-600 font-medium flex items-center">
                  Diet plan has been approved and saved to patient record
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanGenerator;

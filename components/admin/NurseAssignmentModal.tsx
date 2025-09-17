"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserCheck, Stethoscope, Building2, X, Check } from "lucide-react"

interface Doctor {
  id: number;
  name: string;
  email: string;
}

interface NurseAssignment {
  id?: number;
  nurse_id: number;
  doctor_id: number;
  department: 'opd' | 'ward';
  doctor_name?: string;
}

interface NurseAssignmentModalProps {
  nurse: {
    id: number;
    name: string;
    email: string;
  };
  assignment?: NurseAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NurseAssignmentModal({ 
  nurse, 
  assignment, 
  isOpen, 
  onClose, 
  onSuccess 
}: NurseAssignmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      
      // Pre-fill form if editing existing assignment
      if (assignment) {
        setSelectedDoctorId(assignment.doctor_id.toString());
        setSelectedDepartment(assignment.department);
      } else {
        setSelectedDoctorId("");
        setSelectedDepartment("");
      }
    }
  }, [isOpen, assignment]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors');
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (err) {
      setError('Error fetching doctors');
    }
  };

  const handleSubmit = async () => {
    if (!selectedDoctorId || !selectedDepartment) {
      setError('Please select both doctor and department');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = assignment 
        ? '/api/admin/nurse-assignments'
        : '/api/admin/nurse-assignments';
      
      const method = assignment ? 'PUT' : 'POST';
      
      const body = assignment 
        ? {
            assignment_id: assignment.id,
            doctor_id: parseInt(selectedDoctorId),
            department: selectedDepartment
          }
        : {
            nurse_id: nurse.id,
            doctor_id: parseInt(selectedDoctorId),
            department: selectedDepartment
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to save assignment');
      }
    } catch (err) {
      setError('Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id.toString() === selectedDoctorId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-pink-600" />
            {assignment ? 'Edit Assignment' : 'Assign Nurse'}
          </DialogTitle>
          <DialogDescription>
            {assignment ? 'Update assignment for' : 'Assign'} {nurse.name} to a doctor and department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nurse Info */}
          <Card className="border-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-2 rounded-full">
                  <UserCheck className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{nurse.name}</p>
                  <p className="text-sm text-gray-600">{nurse.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Select Doctor
            </label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger className="border-pink-200 focus:border-pink-400">
                <SelectValue placeholder="Choose a doctor..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{doctor.name}</span>
                      <span className="text-sm text-gray-500">{doctor.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Select Department
            </label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="border-pink-200 focus:border-pink-400">
                <SelectValue placeholder="Choose department..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opd">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mr-2">OPD</span>
                    Outpatient Department
                  </div>
                </SelectItem>
                <SelectItem value="ward">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mr-2">Ward</span>
                    Inpatient Ward
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Preview */}
          {selectedDoctor && selectedDepartment && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-green-800 mb-2">Assignment Preview:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nurse:</span> {nurse.name}</p>
                  <p><span className="font-medium">Doctor:</span> {selectedDoctor.name}</p>
                  <p><span className="font-medium">Department:</span> {selectedDepartment.toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="border-gray-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !selectedDoctorId || !selectedDepartment}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {assignment ? 'Update Assignment' : 'Assign Nurse'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

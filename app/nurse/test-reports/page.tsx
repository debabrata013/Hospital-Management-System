"use client"

import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, User, Search, FileText, Loader2, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface Patient {
  id: number;
  patient_id: string;
  name: string;
  contact_number: string;
  age: number;
  gender: string;
  blood_group: string;
}

interface Report {
  id: number;
  report_name: string;
  file_path: string;
  upload_date: string;
  nurse_name: string;
}

export default function TestReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/nurse/patients');
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []);
          setFilteredPatients(data.patients || []);
        } else {
          console.error('Failed to fetch patients');
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const results = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  const handleUploadClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsUploadDialogOpen(true);
    setUploadStatus(null);
    setUploadMessage('');
    setSelectedFile(null);
  };

  const handleViewReportsClick = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
    setReportsLoading(true);
    try {
      const response = await fetch(`/api/nurse/reports/${patient.id}`);
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedPatient) return;

    setUploading(true);
    setUploadStatus(null);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patientId', String(selectedPatient.id));

    try {
      const response = await fetch('/api/nurse/upload-report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus('success');
        setUploadMessage('Report uploaded successfully!');
      } else {
        setUploadStatus('error');
        setUploadMessage(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to connect to the server.');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setIsUploadDialogOpen(false);
      }, 2000);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-pink-500" />
          Patient Test Reports
        </h1>
      </div>

      <Card className="mb-6 border-pink-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/3"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading patients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-300 border-pink-100 flex flex-col">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-lg">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="text-sm text-gray-600 space-y-2 mb-4">
                    <p><strong>Age:</strong> {patient.age}</p>
                    <p><strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Blood Group:</strong> {patient.blood_group}</p>
                    <p><strong>Contact:</strong> {patient.contact_number}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={() => handleUploadClick(patient)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleViewReportsClick(patient)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Patients Found</h3>
              <p className="text-gray-500">No patients match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Report for {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              Select a PDF or image file to upload as a test report.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploadStatus === 'success' && (
              <div className="mt-4 text-green-600 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span>{uploadMessage}</span>
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="mt-4 text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                <span>{uploadMessage}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUploadSubmit} disabled={!selectedFile || uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reports for {selectedPatient?.name}</DialogTitle>
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
    </div>
  );
}

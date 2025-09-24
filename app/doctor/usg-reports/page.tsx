'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Search, FileImage, Loader2, Users, Eye, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function USGReportsPage() {
  const { authState } = useAuth();
  const { user, isLoading } = authState;

  // State management
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Report form state - NT/NB Ultrasonography format
  const [reportForm, setReportForm] = useState({
    patientName: '',
    age: '',
    gender: 'FEMALE',
    refBy: '',
    scansNo: '',
    date: new Date().toLocaleDateString(),
    reportType: 'NT AND NB ULTRASONOGRAPHY REPORT',
    lmp: '',
    gaByLmp: '',
    eddByLmp: '',
    generalObservation: 'Single live intrauterine gestation seen at the time of the scan.',
    fetalParameters: {
      crl: '',
      yolkSac: 'Seen',
      fhr: '',
      nuchalTranslucency: '',
      nasalBone: '',
      placenta: 'Posterior body grade 0 maturity.',
      cervicalLength: 'Internal OS is closed.'
    },
    impression: 'SINGLE LIVE INTRA UTERINE W D NORMAL GESTATION WITH REST OF PARAMETERS AS MENTIONED ABOVE.',
    eddByScan: '',
    suggestion: 'Anomaly scans at 20-22 wks.',
    doctorNote: 'I have not detected / nor disclosed the sex of foetus to the patient or anybody in any manner.'
  });

  // Check if user is from Gynecology department
  const isGynecologyDoctor = user?.department?.toLowerCase().includes('gynecology') || 
                            user?.department?.toLowerCase().includes('gynaecology') ||
                            user?.department?.toLowerCase().includes('obstetrics');

  useEffect(() => {
    if (user && isGynecologyDoctor) {
      fetchPatients();
      fetchGeneratedReports();
    }
  }, [user, isGynecologyDoctor]);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      const response = await fetch('/api/doctor/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setPatientsLoading(false);
    }
  };

  // Fetch generated reports
  const fetchGeneratedReports = async () => {
    try {
      setReportsLoading(true);
      const response = await fetch('/api/doctor/usg-reports');
      if (response.ok) {
        const data = await response.json();
        setGeneratedReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  // Handle report generation
  const handleGenerateReport = (patient: any) => {
    setSelectedPatient(patient);
    setReportForm({
      ...reportForm,
      patientName: patient.name || '',
      age: patient.age || '',
      gender: patient.gender?.toUpperCase() || 'FEMALE',
      refBy: `Dr. ${user?.name || 'Doctor'}`,
      date: new Date().toLocaleDateString(),
    });
    setReportDialog(true);
  };

  // Save report
  const saveReport = async () => {
    try {
      const response = await fetch('/api/doctor/usg-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient?.id,
          reportData: reportForm,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`USG Report generated successfully! Report ID: ${data.reportId}`);
        setReportDialog(false);
        fetchGeneratedReports();
      } else {
        alert('Failed to generate USG report. Please try again.');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error generating USG report. Please try again.');
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number?.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isGynecologyDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <CardTitle className="text-red-700">Access Restricted</CardTitle>
                  <CardDescription className="text-red-600">
                    USG Reports are only available for Gynecology department doctors
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your current department: <strong>{user?.department || 'Not specified'}</strong>
              </p>
              <p className="text-gray-600 mb-6">
                This feature is specifically designed for gynecology and obstetrics specialists 
                who need to generate NT/NB ultrasonography reports for their patients.
              </p>
              <Link href="/doctor">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/doctor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileImage className="h-6 w-6 mr-2 text-blue-600" />
                USG Reports
              </h1>
              <p className="text-gray-600">Generate and manage NT/NB ultrasonography reports</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Dr. {user?.name}</p>
            <p className="text-xs text-gray-500">{user?.department}</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Patient Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Patient for USG Report</CardTitle>
            <CardDescription>Search and select a patient to generate NT/NB ultrasonography report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, ID, or contact number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={fetchPatients}
                disabled={patientsLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {patientsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search Patients
              </Button>
            </div>

            {patientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading patients...</span>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient: any) => (
                  <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                          {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {patient.name || 'Unknown Patient'}
                        </h4>
                        <p className="text-sm text-gray-600">ID: {patient.patient_id || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Contact: {patient.contact_number || 'N/A'}</p>
                        {patient.age && (
                          <p className="text-sm text-gray-600">
                            Age: {patient.age} • Gender: {patient.gender || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(patient)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No patients found. Try adjusting your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>View and download previously generated USG reports</CardDescription>
              </div>
              <Button
                onClick={fetchGeneratedReports}
                variant="outline"
                size="sm"
                disabled={reportsLoading}
              >
                {reportsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
              </div>
            ) : generatedReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedReports.map((report: any) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{report.patient_name}</h4>
                        <p className="text-sm text-gray-600">Report Type: {report.report_type}</p>
                        <p className="text-sm text-gray-600">
                          Generated: {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Report ID: {report.report_id}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => window.open(`/api/doctor/usg-reports/${report.id}/pdf`, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => window.open(`/api/doctor/usg-reports/${report.id}/download`, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileImage className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No USG reports generated yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialog} onOpenChange={setReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-900">
              Generate NT/NB Ultrasonography Report - {selectedPatient?.name}
            </DialogTitle>
            <DialogDescription>
              Complete the NT and NB ultrasonography report form
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Patient Information Header */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-blue-800">Patient Name (MRS.)</Label>
                  <Input
                    value={reportForm.patientName}
                    onChange={(e) => setReportForm({...reportForm, patientName: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-medium text-blue-800">Age/Gender</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      value={reportForm.age}
                      onChange={(e) => setReportForm({...reportForm, age: e.target.value})}
                      placeholder="Age"
                      className="flex-1"
                    />
                    <Select value={reportForm.gender} onValueChange={(value) => setReportForm({...reportForm, gender: value})}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEMALE">FEMALE</SelectItem>
                        <SelectItem value="MALE">MALE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-blue-800">Scans No.</Label>
                  <Input
                    value={reportForm.scansNo}
                    onChange={(e) => setReportForm({...reportForm, scansNo: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-medium text-blue-800">Date</Label>
                  <Input
                    value={reportForm.date}
                    onChange={(e) => setReportForm({...reportForm, date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-medium text-blue-800">Ref. By Dr.</Label>
                  <Input
                    value={reportForm.refBy}
                    onChange={(e) => setReportForm({...reportForm, refBy: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 underline">
                  NT AND NB ULTRASONOGRAPHY REPORT
                </h3>
              </div>

              {/* LMP and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>LMP</Label>
                  <Input
                    value={reportForm.lmp}
                    onChange={(e) => setReportForm({...reportForm, lmp: e.target.value})}
                    placeholder="0/0/2018"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>GA by LMP: w days</Label>
                  <Input
                    value={reportForm.gaByLmp}
                    onChange={(e) => setReportForm({...reportForm, gaByLmp: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>EDD by LMP</Label>
                  <Input
                    value={reportForm.eddByLmp}
                    onChange={(e) => setReportForm({...reportForm, eddByLmp: e.target.value})}
                    placeholder="0/0/2020"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* General Observation */}
              <div>
                <Label className="text-base font-semibold">General Observation</Label>
                <Textarea
                  value={reportForm.generalObservation}
                  onChange={(e) => setReportForm({...reportForm, generalObservation: e.target.value})}
                  className="mt-2"
                  rows={2}
                />
              </div>

              {/* Fetal Parameters */}
              <div>
                <Label className="text-base font-semibold">Fetal parameters:</Label>
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>CRL (cm)</Label>
                      <Input
                        value={reportForm.fetalParameters.crl}
                        onChange={(e) => setReportForm({
                          ...reportForm,
                          fetalParameters: {...reportForm.fetalParameters, crl: e.target.value}
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>YOLK SAC</Label>
                      <Select 
                        value={reportForm.fetalParameters.yolkSac} 
                        onValueChange={(value) => setReportForm({
                          ...reportForm,
                          fetalParameters: {...reportForm.fetalParameters, yolkSac: value}
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Seen">Seen</SelectItem>
                          <SelectItem value="Not Seen">Not Seen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>FHR (bpm)</Label>
                      <Input
                        value={reportForm.fetalParameters.fhr}
                        onChange={(e) => setReportForm({
                          ...reportForm,
                          fetalParameters: {...reportForm.fetalParameters, fhr: e.target.value}
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Nuchal Translucency thickness (mm)</Label>
                    <Input
                      value={reportForm.fetalParameters.nuchalTranslucency}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        fetalParameters: {...reportForm.fetalParameters, nuchalTranslucency: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Nasal bone seen & measure (mm)</Label>
                    <Input
                      value={reportForm.fetalParameters.nasalBone}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        fetalParameters: {...reportForm.fetalParameters, nasalBone: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>PLACENTA</Label>
                    <Textarea
                      value={reportForm.fetalParameters.placenta}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        fetalParameters: {...reportForm.fetalParameters, placenta: e.target.value}
                      })}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Cervical length (cm)</Label>
                    <Textarea
                      value={reportForm.fetalParameters.cervicalLength}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        fetalParameters: {...reportForm.fetalParameters, cervicalLength: e.target.value}
                      })}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Impression */}
              <div>
                <Label className="text-base font-semibold">IMPRESSION:</Label>
                <Textarea
                  value={reportForm.impression}
                  onChange={(e) => setReportForm({...reportForm, impression: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* EDD By Scan */}
              <div>
                <Label className="text-base font-semibold">EDD By Scan:</Label>
                <Input
                  value={reportForm.eddByScan}
                  onChange={(e) => setReportForm({...reportForm, eddByScan: e.target.value})}
                  placeholder="0/0/2019"
                  className="mt-2"
                />
              </div>

              {/* Suggestion */}
              <div>
                <Label className="text-base font-semibold">Sugg:</Label>
                <Textarea
                  value={reportForm.suggestion}
                  onChange={(e) => setReportForm({...reportForm, suggestion: e.target.value})}
                  className="mt-2"
                  rows={2}
                />
              </div>

              {/* Doctor Note */}
              <div>
                <Label className="text-base font-semibold">NOTE:</Label>
                <Textarea
                  value={reportForm.doctorNote}
                  onChange={(e) => setReportForm({...reportForm, doctorNote: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setReportDialog(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={() => alert('Preview functionality will be implemented')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview Report
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={saveReport}
              >
                <FileImage className="h-4 w-4 mr-1" />
                Generate & Save Report
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

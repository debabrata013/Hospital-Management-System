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

  // Report form state with multiple templates
  const [reportForm, setReportForm] = useState<any>({
    patientName: '',
    age: '',
    gender: 'FEMALE',
    refBy: '',
    scansNo: '',
    date: new Date().toLocaleDateString(),
    trimester: 'Trimester 1',
    reportType: 'ANC / Fetal Well Being',
    // Common
    lmp: '',
    gaByLmp: '',
    eddByLmp: '',
    // NT/NB (kept for backward compatibility)
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
    impression: '',
    eddByScan: '',
    suggestion: '',
    doctorNote: 'I have not detected / nor disclosed the sex of foetus to the patient or anybody in any manner.',
    // ANC / Fetal Well Being
    anc: {
      presentation: 'Cephalic',
      fetalMovements: 'Present',
      liquor: 'AFI __ cm',
      placenta: 'Posterior, not low-lying. Grade __ maturity.',
      bpd: '', hc: '', ac: '', fl: '', composite: '',
      fetalWeight: '', hr: '', usedd: '',
      note: 'Double loop of cord is noted around the fetal neck.',
      impression: ''
    },
    // Gynecological Ultrasound
    gyne: {
      reason: '',
      uterus: 'Normal',
      endometrialStrip: 'Normal',
      rOvary1: '', rOvary2: '',
      lOvary1: '', lOvary2: '',
      otherFindings: '',
      impression: ''
    },
    // Follicular Study (TAS)
    follicular: {
      baseline: 'UTERUS: Measures about __ cm, anteverted, normal echotexture. No focal lesions/fibroids.\nEndometrial thickness: __ mm.\nBOTH OVARIES: Normal in size and echotexture. No adnexal mass lesion.\nRIGHT OVARY: __ cm.\nLEFT OVARY: __ cm.\nNo free fluid in POD / clear.',
      rows: [
        { date: '', day: '', rightOvary: '', leftOvary: '', endometrialThickness: '', freeFluid: '' }
      ],
      impression: ''
    },
    // Early Pregnancy Dating
    early: {
      ga: '', edd: '',
      observation: 'A single live intrauterine gestational sac is noted.\nFetal pole is visualized.\nCRL measures __ cm.\nFHR __ bpm.\nYolk sac __ mm.\nNo evidence of subchorionic collection.\nAdnexa appear normal.',
      impression: 'A single live intrauterine gestation corresponding to __ weeks growth.'
    }
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

  // Preview the report with template-specific formatting
  const handlePreview = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const header = `
      <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:12px">
        <h2 style="margin:0">Ultrasonography reports</h2>
        <div style="font-size:12px;color:#555">${reportForm.reportType}</div>
        <div style="font-size:12px;color:#1f2937;margin-top:3px"><strong>${reportForm.trimester || ''}</strong></div>
      </div>
      <div style="background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:12px;font-size:13px">
        <div><strong>Patient:</strong> ${reportForm.patientName || selectedPatient?.name || ''}</div>
        <div><strong>Age/Gender:</strong> ${reportForm.age || ''} / ${reportForm.gender || ''}</div>
        <div><strong>Ref. By:</strong> ${reportForm.refBy || ''}</div>
        <div><strong>Date:</strong> ${reportForm.date}</div>
      </div>
    `;

    let body = '';
    switch (reportForm.reportType) {
      case 'ANC / Fetal Well Being': {
        const a = reportForm.anc;
        body = `
          <div style="text-align:center;text-decoration:underline;font-weight:bold;margin-bottom:8px">USG (ANC) FETAL WELL BEING</div>
          <div style="font-size:13px">
            <div><strong>Single live intrauterine pregnancy</strong> with normal and regular cardiac activity is imaged.</div>
            <table style="width:100%;margin-top:8px;font-size:13px">
              <tr><td>Presentation</td><td>: ${a.presentation || ''}</td></tr>
              <tr><td>Fetal movements</td><td>: ${a.fetalMovements || ''}</td></tr>
              <tr><td>Liquor</td><td>: ${a.liquor || ''}</td></tr>
              <tr><td>Placenta</td><td>: ${a.placenta || ''}</td></tr>
              <tr><td>B.P.D.</td><td>: ${a.bpd || ''}</td></tr>
              <tr><td>H.C.</td><td>: ${a.hc || ''}</td></tr>
              <tr><td>A.C.</td><td>: ${a.ac || ''}</td></tr>
              <tr><td>F.L.</td><td>: ${a.fl || ''}</td></tr>
              <tr><td>Composite</td><td>: ${a.composite || ''}</td></tr>
              <tr><td>Foetal weight</td><td>: ${a.fetalWeight || ''}</td></tr>
              <tr><td>H.R.</td><td>: ${a.hr || ''}</td></tr>
              <tr><td>USEDD</td><td>: ${a.usedd || ''}</td></tr>
            </table>
            ${a.note ? `<p style="margin-top:10px">${a.note}</p>` : ''}
            ${a.impression ? `<div style="margin-top:10px"><strong>Impression:</strong> ${a.impression}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'Gynecological Ultrasound': {
        const g = reportForm.gyne;
        body = `
          <div style="text-align:center;text-decoration:underline;font-weight:bold;margin-bottom:8px">GYNECOLOGICAL ULTRASOUND REPORT</div>
          <div style="font-size:13px">
            <div><strong>Reason for scan:</strong> ${g.reason || ''}</div>
            <table style="width:100%;margin-top:8px;font-size:13px">
              <tr><td>Uterus</td><td>: ${g.uterus}</td></tr>
              <tr><td>Endometrial Strip</td><td>: ${g.endometrialStrip}</td></tr>
              <tr><td>Adnexa (R Ovary)</td><td>: ${g.rOvary1} mm x ${g.rOvary2} mm</td></tr>
              <tr><td>Adnexa (L Ovary)</td><td>: ${g.lOvary1} mm x ${g.lOvary2} mm</td></tr>
            </table>
            ${g.otherFindings ? `<div style="margin-top:10px"><strong>Other findings:</strong><br/>${g.otherFindings.replace(/\n/g,'<br/>')}</div>` : ''}
            ${g.impression ? `<div style="margin-top:10px"><strong>Impression:</strong> ${g.impression}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'Follicular Study (TAS)': {
        const f = reportForm.follicular;
        const rows = (f.rows || []).map((r:any) => `<tr>
            <td>${r.date}</td><td>${r.day}</td><td>${r.rightOvary}</td><td>${r.leftOvary}</td><td>${r.endometrialThickness}</td><td>${r.freeFluid}</td>
          </tr>`).join('');
        body = `
          <div style="text-align:center;text-decoration:underline;font-weight:bold;margin-bottom:8px">FOLLICULAR STUDY (TAS)</div>
          <div style="white-space:pre-wrap;font-size:13px">${f.baseline}</div>
          <table style="width:100%;margin-top:10px;border-collapse:collapse;font-size:13px" border="1" cellpadding="6">
            <thead><tr><th>DATE</th><th>DAY</th><th>RIGHT OVARY</th><th>LEFT OVARY</th><th>ENDOMETRIAL THICKNESS</th><th>Free fluid in POD</th></tr></thead>
            <tbody>${rows || ''}</tbody>
          </table>
          ${f.impression ? `<div style="margin-top:10px"><strong>Impression:</strong> ${f.impression}</div>` : ''}
        `;
        break;
      }
      case 'Early Pregnancy (Dating) Scan': {
        const e = reportForm.early;
        body = `
          <div style="text-align:center;text-decoration:underline;font-weight:bold;margin-bottom:8px">EARLY PREGNANCY (DATING) SCAN</div>
          <div style="font-size:13px">
            <div><strong>LMP:</strong> ${reportForm.lmp || ''} &nbsp; <strong>GA:</strong> ${e.ga || ''} &nbsp; <strong>EDD:</strong> ${e.edd || ''}</div>
            <div style="margin-top:8px"><strong>Observation:</strong><br/>${(e.observation || '').replace(/\n/g,'<br/>')}</div>
            ${e.impression ? `<div style="margin-top:10px"><strong>Impression:</strong> ${e.impression}</div>` : ''}
          </div>
        `;
        break;
      }
      default: {
        // Backward compatibility (NT/NB)
        body = `
          <div style="text-align:center;text-decoration:underline;font-weight:bold;margin-bottom:8px">NT AND NB ULTRASONOGRAPHY REPORT</div>
          <div><strong>General Observation:</strong> ${(reportForm.generalObservation || '')}</div>
        `;
      }
    }

    w.document.write(`<!DOCTYPE html><html><head><title>USG Preview</title><style>body{font-family:Arial, sans-serif;margin:18px}</style></head><body>${header}${body}<div style="margin-top:20px;text-align:right;font-size:12px"><div><strong>Doctor:</strong> ${user?.name || ''}</div></div></body></html>`);
    w.document.close();
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
    setReportForm((prev:any) => ({
      ...prev,
      patientName: patient.name || '',
      age: patient.age || '',
      gender: patient.gender?.toUpperCase() || 'FEMALE',
      refBy: `Dr. ${user?.name || 'Doctor'}`,
      date: new Date().toLocaleDateString(),
    }));
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
               Ultrasonography Reports
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
            <CardTitle>Select Patient for Ultrasonography reports</CardTitle>
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
              Generate USG Report - {selectedPatient?.name}
            </DialogTitle>
            <DialogDescription>
              Select a template and complete the report details
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

            {/* Trimester and Report Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Trimester</Label>
                <Select value={reportForm.trimester} onValueChange={(v)=> setReportForm({...reportForm, trimester: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trimester 1">Trimester 1</SelectItem>
                    <SelectItem value="Trimester 2">Trimester 2</SelectItem>
                    <SelectItem value="Trimester 3">Trimester 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label>Report Template</Label>
                <Select value={reportForm.reportType} onValueChange={(v)=> setReportForm({...reportForm, reportType: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANC / Fetal Well Being">ANC / Fetal Well Being</SelectItem>
                    <SelectItem value="Gynecological Ultrasound">Gynecological Ultrasound</SelectItem>
                    <SelectItem value="Follicular Study (TAS)">Follicular Study (TAS)</SelectItem>
                    <SelectItem value="Early Pregnancy (Dating) Scan">Early Pregnancy (Dating) Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label>LMP</Label>
                <Input value={reportForm.lmp} onChange={(e)=> setReportForm({...reportForm, lmp: e.target.value})} className="mt-1" />
              </div>
              <div className="md:col-span-1">
                <Label>EDD by LMP</Label>
                <Input value={reportForm.eddByLmp} onChange={(e)=> setReportForm({...reportForm, eddByLmp: e.target.value})} className="mt-1" />
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 underline">
                  {reportForm.reportType}
                </h3>
              </div>

              {/* ANC / Fetal Well Being */}
              {reportForm.reportType === 'ANC / Fetal Well Being' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Presentation</Label>
                      <Input value={reportForm.anc.presentation} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, presentation: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Fetal movements</Label>
                      <Input value={reportForm.anc.fetalMovements} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, fetalMovements: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Liquor</Label>
                      <Input value={reportForm.anc.liquor} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, liquor: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Placenta</Label>
                      <Input value={reportForm.anc.placenta} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, placenta: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>BPD</Label>
                      <Input value={reportForm.anc.bpd} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, bpd: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>HC</Label>
                      <Input value={reportForm.anc.hc} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, hc: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>AC</Label>
                      <Input value={reportForm.anc.ac} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, ac: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>FL</Label>
                      <Input value={reportForm.anc.fl} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, fl: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Composite</Label>
                      <Input value={reportForm.anc.composite} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, composite: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Fetal Weight</Label>
                      <Input value={reportForm.anc.fetalWeight} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, fetalWeight: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>HR (bpm)</Label>
                      <Input value={reportForm.anc.hr} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, hr: e.target.value}})} className="mt-1" />
                    </div>
                    <div>
                      <Label>USEDD</Label>
                      <Input value={reportForm.anc.usedd} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, usedd: e.target.value}})} className="mt-1" />
                    </div>
                  </div>
                  <Textarea value={reportForm.anc.note} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, note: e.target.value}})} placeholder="Notes" />
                  <Textarea value={reportForm.anc.impression} onChange={(e)=> setReportForm({...reportForm, anc: {...reportForm.anc, impression: e.target.value}})} placeholder="Impression" />
                </div>
              )}

              {/* Gynecological Ultrasound */}
              {reportForm.reportType === 'Gynecological Ultrasound' && (
                <div className="space-y-4">
                  <Input value={reportForm.gyne.reason} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, reason: e.target.value}})} placeholder="Reason for scan" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Uterus</Label>
                      <Select value={reportForm.gyne.uterus} onValueChange={(v)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, uterus: v}})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Enlarged">Enlarged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Endometrial Strip</Label>
                      <Select value={reportForm.gyne.endometrialStrip} onValueChange={(v)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, endometrialStrip: v}})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Thickened">Thickened</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={reportForm.gyne.rOvary1} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, rOvary1: e.target.value}})} placeholder="R Ovary mm" />
                    <Input value={reportForm.gyne.rOvary2} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, rOvary2: e.target.value}})} placeholder="R Ovary mm" />
                    <Input value={reportForm.gyne.lOvary1} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, lOvary1: e.target.value}})} placeholder="L Ovary mm" />
                    <Input value={reportForm.gyne.lOvary2} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, lOvary2: e.target.value}})} placeholder="L Ovary mm" />
                  </div>
                  <Textarea value={reportForm.gyne.otherFindings} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, otherFindings: e.target.value}})} placeholder="Other findings" />
                  <Textarea value={reportForm.gyne.impression} onChange={(e)=> setReportForm({...reportForm, gyne: {...reportForm.gyne, impression: e.target.value}})} placeholder="Impression" />
                </div>
              )}

              {/* Follicular Study */}
              {reportForm.reportType === 'Follicular Study (TAS)' && (
                <div className="space-y-4">
                  <Label className="font-semibold">Baseline</Label>
                  <Textarea value={reportForm.follicular.baseline} onChange={(e)=> setReportForm({...reportForm, follicular: {...reportForm.follicular, baseline: e.target.value}})} rows={5} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 border">DATE</th>
                          <th className="p-2 border">DAY</th>
                          <th className="p-2 border">RIGHT OVARY</th>
                          <th className="p-2 border">LEFT OVARY</th>
                          <th className="p-2 border">ENDOMETRIAL THICKNESS</th>
                          <th className="p-2 border">Free fluid in POD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportForm.follicular.rows.map((r:any, idx:number)=> (
                          <tr key={idx}>
                            <td className="p-1 border"><Input value={r.date} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].date=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                            <td className="p-1 border"><Input value={r.day} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].day=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                            <td className="p-1 border"><Input value={r.rightOvary} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].rightOvary=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                            <td className="p-1 border"><Input value={r.leftOvary} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].leftOvary=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                            <td className="p-1 border"><Input value={r.endometrialThickness} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].endometrialThickness=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                            <td className="p-1 border"><Input value={r.freeFluid} onChange={(e)=>{ const rows=[...reportForm.follicular.rows]; rows[idx].freeFluid=e.target.value; setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=> setReportForm({...reportForm, follicular: {...reportForm.follicular, rows:[...reportForm.follicular.rows, {date:'',day:'',rightOvary:'',leftOvary:'',endometrialThickness:'',freeFluid:''}]}})}>+ Row</Button>
                      {reportForm.follicular.rows.length>1 && (
                        <Button variant="outline" size="sm" onClick={()=> { const rows=[...reportForm.follicular.rows]; rows.pop(); setReportForm({...reportForm, follicular:{...reportForm.follicular, rows}}) }}>- Row</Button>
                      )}
                    </div>
                  </div>
                  <Textarea value={reportForm.follicular.impression} onChange={(e)=> setReportForm({...reportForm, follicular: {...reportForm.follicular, impression: e.target.value}})} placeholder="Impression" />
                </div>
              )}

              {/* Early Pregnancy (Dating) */}
              {reportForm.reportType === 'Early Pregnancy (Dating) Scan' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input value={reportForm.gaByLmp} onChange={(e)=> setReportForm({...reportForm, gaByLmp: e.target.value})} placeholder="GA by LMP (wks days)" />
                    <Input value={reportForm.early.ga} onChange={(e)=> setReportForm({...reportForm, early: {...reportForm.early, ga: e.target.value}})} placeholder="GA (by scan)" />
                    <Input value={reportForm.early.edd} onChange={(e)=> setReportForm({...reportForm, early: {...reportForm.early, edd: e.target.value}})} placeholder="EDD (by USG)" />
                  </div>
                  <Textarea value={reportForm.early.observation} onChange={(e)=> setReportForm({...reportForm, early: {...reportForm.early, observation: e.target.value}})} rows={6} />
                  <Textarea value={reportForm.early.impression} onChange={(e)=> setReportForm({...reportForm, early: {...reportForm.early, impression: e.target.value}})} placeholder="Impression" />
                </div>
              )}

              {/* Doctor Note (common) */}
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
                onClick={handlePreview}
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

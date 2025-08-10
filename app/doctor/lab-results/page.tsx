"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FlaskConical, 
  Search, 
  Filter,
  Eye,
  Download,
  Upload,
  User,
  Calendar,
  Clock,
  FileText,
  Image,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

// Mock lab results data
const mockLabResults = [
  {
    id: "LAB001",
    patientName: "राजेश कुमार",
    patientId: "P001",
    testType: "Lipid Profile",
    orderDate: "2024-01-08",
    resultDate: "2024-01-09",
    status: "completed",
    priority: "routine",
    results: {
      "Total Cholesterol": { value: "180", unit: "mg/dL", range: "<200", status: "normal" },
      "LDL Cholesterol": { value: "110", unit: "mg/dL", range: "<100", status: "elevated" },
      "HDL Cholesterol": { value: "45", unit: "mg/dL", range: ">40", status: "normal" },
      "Triglycerides": { value: "150", unit: "mg/dL", range: "<150", status: "normal" }
    },
    technician: "Lab Tech A",
    reviewedBy: null,
    files: ["lipid_profile_p001.pdf"]
  },
  {
    id: "LAB002",
    patientName: "सुनीता देवी",
    patientId: "P002",
    testType: "Cardiac Enzymes",
    orderDate: "2024-01-07",
    resultDate: "2024-01-07",
    status: "completed",
    priority: "urgent",
    results: {
      "Troponin I": { value: "0.02", unit: "ng/mL", range: "<0.04", status: "normal" },
      "CK-MB": { value: "3.2", unit: "ng/mL", range: "<6.3", status: "normal" },
      "Total CK": { value: "120", unit: "U/L", range: "30-200", status: "normal" }
    },
    technician: "Lab Tech B",
    reviewedBy: "Dr. Priya Sharma",
    files: ["cardiac_enzymes_p002.pdf"]
  },
  {
    id: "LAB003",
    patientName: "मोहम्मद अली",
    patientId: "P003",
    testType: "Complete Blood Count",
    orderDate: "2024-01-08",
    resultDate: "2024-01-09",
    status: "completed",
    priority: "routine",
    results: {
      "Hemoglobin": { value: "12.5", unit: "g/dL", range: "13.5-17.5", status: "low" },
      "WBC Count": { value: "7500", unit: "/μL", range: "4000-11000", status: "normal" },
      "Platelet Count": { value: "250000", unit: "/μL", range: "150000-450000", status: "normal" },
      "Hematocrit": { value: "38", unit: "%", range: "41-53", status: "low" }
    },
    technician: "Lab Tech C",
    reviewedBy: null,
    files: ["cbc_p003.pdf"]
  }
]

// Mock imaging results
const mockImagingResults = [
  {
    id: "IMG001",
    patientName: "राजेश कुमार",
    patientId: "P001",
    studyType: "Chest X-Ray",
    orderDate: "2024-01-08",
    studyDate: "2024-01-09",
    status: "completed",
    findings: "Heart size normal. Lung fields clear. No acute cardiopulmonary abnormality.",
    impression: "Normal chest radiograph",
    radiologist: "Dr. Radiology Specialist",
    files: ["chest_xray_p001.jpg", "chest_xray_report_p001.pdf"]
  },
  {
    id: "IMG002",
    patientName: "सुनीता देवी",
    patientId: "P002",
    studyType: "ECG",
    orderDate: "2024-01-07",
    studyDate: "2024-01-07",
    status: "completed",
    findings: "Sinus rhythm. Non-specific T-wave changes in leads V4-V6. No acute ST changes.",
    impression: "Non-specific T-wave abnormalities. Clinical correlation recommended.",
    radiologist: "Dr. Cardiology Specialist",
    files: ["ecg_p002.jpg", "ecg_report_p002.pdf"]
  }
]

export default function DoctorLabResultsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700">Urgent</Badge>
      case 'routine':
        return <Badge className="bg-blue-100 text-blue-700">Routine</Badge>
      case 'stat':
        return <Badge className="bg-purple-100 text-purple-700">STAT</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>
    }
  }

  const getResultStatus = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'elevated':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'low':
        return <XCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getResultStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>
      case 'elevated':
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-700">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FlaskConical className="h-8 w-8 mr-3 text-pink-500" />
              Lab Results & Imaging
            </h1>
            <p className="text-gray-600 mt-2">Access lab/X-ray uploads and test results for patients</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <FlaskConical className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abnormal Results</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Reports</p>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by patient name, test type, or result..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lab Results */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
            Laboratory Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockLabResults.map((result) => (
              <div key={result.id} className="p-4 border border-pink-100 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg h-12 w-12 flex items-center justify-center font-bold">
                      <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{result.testType}</h3>
                      <p className="text-sm text-gray-600">{result.patientName} • {result.patientId}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(result.status)}
                        {getPriorityBadge(result.priority)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Ordered: {new Date(result.orderDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Result: {new Date(result.resultDate).toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.entries(result.results).map(([testName, testResult]) => (
                    <div key={testName} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{testName}</span>
                        <div className="flex items-center space-x-2">
                          {getResultStatus(testResult.status)}
                          {getResultStatusBadge(testResult.status)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{testResult.value} {testResult.unit}</span>
                        <span className="ml-2">Range: {testResult.range}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <div>
                    <span className="font-medium">Technician:</span> {result.technician}
                    {result.reviewedBy && (
                      <span className="ml-4"><span className="font-medium">Reviewed by:</span> {result.reviewedBy}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{result.files.length} file(s)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Imaging Results */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2 text-green-500" />
            Imaging & X-Ray Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockImagingResults.map((result) => (
              <div key={result.id} className="p-4 border border-pink-100 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg h-12 w-12 flex items-center justify-center font-bold">
                      <Image className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{result.studyType}</h3>
                      <p className="text-sm text-gray-600">{result.patientName} • {result.patientId}</p>
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Ordered: {new Date(result.orderDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Study: {new Date(result.studyDate).toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Findings and Impression */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Findings</h4>
                    <p className="text-sm text-blue-800">{result.findings}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Impression</h4>
                    <p className="text-sm text-green-800">{result.impression}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <div>
                    <span className="font-medium">Radiologist:</span> {result.radiologist}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4" />
                    <span>{result.files.length} file(s)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Upload className="h-6 w-6" />
              <span>Upload Results</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Abnormal Results</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Clock className="h-6 w-6" />
              <span>Pending Review</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Download className="h-6 w-6" />
              <span>Export Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <FlaskConical className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Lab Integration Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

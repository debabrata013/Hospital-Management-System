"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Search,
  Filter,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Eye,
  Brain,
  Pill,
  TestTube,
  Stethoscope,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

export function MedicalRecords() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample vitals data for different time ranges
  const vitalsData = {
    "1month": [
      { date: "Dec 1", bloodPressure: 118, heartRate: 68, temperature: 98.4, weight: 165 },
      { date: "Dec 8", bloodPressure: 122, heartRate: 72, temperature: 98.6, weight: 164 },
      { date: "Dec 15", bloodPressure: 119, heartRate: 70, temperature: 98.5, weight: 165 },
      { date: "Dec 22", bloodPressure: 121, heartRate: 74, temperature: 98.7, weight: 163 },
    ],
    "3months": [
      { date: "Oct", bloodPressure: 120, heartRate: 70, temperature: 98.5, weight: 167 },
      { date: "Nov", bloodPressure: 119, heartRate: 72, temperature: 98.6, weight: 165 },
      { date: "Dec", bloodPressure: 121, heartRate: 71, temperature: 98.5, weight: 164 },
    ],
    "6months": [
      { date: "Jul", bloodPressure: 125, heartRate: 75, temperature: 98.4, weight: 170 },
      { date: "Aug", bloodPressure: 123, heartRate: 73, temperature: 98.5, weight: 169 },
      { date: "Sep", bloodPressure: 121, heartRate: 72, temperature: 98.6, weight: 167 },
      { date: "Oct", bloodPressure: 120, heartRate: 70, temperature: 98.5, weight: 167 },
      { date: "Nov", bloodPressure: 119, heartRate: 72, temperature: 98.6, weight: 165 },
      { date: "Dec", bloodPressure: 121, heartRate: 71, temperature: 98.5, weight: 164 },
    ],
  }

  const prescriptions = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      prescribedBy: "Dr. Smith",
      date: "2024-11-28",
      duration: "30 days",
      instructions: "Take once daily with food",
      status: "active",
      refillsLeft: 2,
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      prescribedBy: "Dr. Johnson",
      date: "2024-11-15",
      duration: "90 days",
      instructions: "Take twice daily with meals",
      status: "active",
      refillsLeft: 1,
    },
    {
      id: 3,
      medication: "Vitamin D3 1000IU",
      prescribedBy: "Dr. Williams",
      date: "2024-10-20",
      duration: "60 days",
      instructions: "Take once daily",
      status: "completed",
      refillsLeft: 0,
    },
  ]

  const testResults = [
    {
      id: 1,
      test: "Complete Blood Count (CBC)",
      date: "2024-11-28",
      status: "completed",
      results: "Normal",
      doctor: "Dr. Smith",
      category: "Blood Work",
    },
    {
      id: 2,
      test: "Lipid Panel",
      date: "2024-11-28",
      status: "completed",
      results: "Cholesterol: 180 mg/dL (Normal)",
      doctor: "Dr. Smith",
      category: "Blood Work",
    },
    {
      id: 3,
      test: "Chest X-Ray",
      date: "2024-11-20",
      status: "completed",
      results: "Clear lungs, no abnormalities",
      doctor: "Dr. Johnson",
      category: "Imaging",
    },
    {
      id: 4,
      test: "ECG",
      date: "2024-11-15",
      status: "pending",
      results: "Results pending",
      doctor: "Dr. Smith",
      category: "Cardiac",
    },
  ]

  const medicalHistory = [
    {
      date: "2024-11-28",
      type: "Visit",
      description: "Annual physical examination",
      doctor: "Dr. Smith",
      diagnosis: "Hypertension, well controlled",
      notes: "Patient reports feeling well. Blood pressure stable on current medication.",
    },
    {
      date: "2024-10-15",
      type: "Visit",
      description: "Follow-up consultation",
      doctor: "Dr. Johnson",
      diagnosis: "Type 2 Diabetes",
      notes: "HbA1c improved to 6.8%. Continue current treatment plan.",
    },
    {
      date: "2024-09-20",
      type: "Emergency",
      description: "Chest pain evaluation",
      doctor: "Dr. Emergency",
      diagnosis: "Non-cardiac chest pain",
      notes: "ECG normal. Discharged with follow-up instructions.",
    },
  ]

  const currentData = vitalsData[selectedTimeRange as keyof typeof vitalsData]

  const handleDownloadPrescription = (prescriptionId: number) => {
    // In a real app, this would generate and download a PDF
    console.log(`Downloading prescription ${prescriptionId}`)
    alert("Prescription PDF download started!")
  }

  const handleDownloadTestResult = (testId: number) => {
    // In a real app, this would download the actual test result
    console.log(`Downloading test result ${testId}`)
    alert("Test result download started!")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">Complete health history and medical documentation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* AI Health Insights */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Your recent medical data shows <strong>excellent progress</strong> in managing hypertension. Blood
              pressure readings have been consistently within target range over the past 6 months.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-800">Cardiovascular Health</h4>
                <p className="text-sm text-green-700">Stable and improving</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800">Medication Adherence</h4>
                <p className="text-sm text-blue-700">Excellent compliance</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-800">Risk Assessment</h4>
                <p className="text-sm text-purple-700">Low risk profile</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Vitals & Charts</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
        </TabsList>

        {/* Vitals & Charts Tab */}
        <TabsContent value="vitals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vitals Timeline</h2>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Pressure & Heart Rate Chart */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Blood Pressure & Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bloodPressure"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                        name="Blood Pressure (systolic)"
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                        name="Heart Rate (bpm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weight & Temperature Chart */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="w-5 h-5 text-green-600" />
                  Weight & Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        fill="url(#weightGradient)"
                        strokeWidth={2}
                        name="Weight (lbs)"
                      />
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Vitals Summary */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Latest Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-xl font-bold text-gray-900">121/80</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-xl font-bold text-gray-900">71 bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-lg">
                  <Thermometer className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-xl font-bold text-gray-900">98.5°F</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-lg">
                  <Weight className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-xl font-bold text-gray-900">164 lbs</p>
                    <p className="text-xs text-blue-600">-6 lbs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Current Prescriptions</h2>
            <Button>
              <Pill className="w-4 h-4 mr-2" />
              Request Refill
            </Button>
          </div>

          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{prescription.medication}</h3>
                        <p className="text-sm text-gray-600">Prescribed by {prescription.prescribedBy}</p>
                        <p className="text-sm text-gray-500">{prescription.instructions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Duration: {prescription.duration}</p>
                        <p className="text-sm text-gray-600">Refills left: {prescription.refillsLeft}</p>
                        <Badge variant={prescription.status === "active" ? "default" : "secondary"} className="mt-1">
                          {prescription.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPrescription(prescription.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Laboratory & Test Results</h2>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Results
            </Button>
          </div>

          <div className="grid gap-4">
            {testResults.map((test) => (
              <Card key={test.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TestTube className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{test.test}</h3>
                        <p className="text-sm text-gray-600">Ordered by {test.doctor}</p>
                        <p className="text-sm text-gray-500">{test.results}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{test.date}</p>
                        <Badge className="mt-1">{test.category}</Badge>
                        <Badge variant={test.status === "completed" ? "default" : "secondary"} className="mt-1 ml-2">
                          {test.status}
                        </Badge>
                      </div>
                      {test.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadTestResult(test.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Medical History</h2>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </Button>
          </div>

          <div className="space-y-4">
            {medicalHistory.map((entry, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{entry.description}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{entry.type}</Badge>
                          <span className="text-sm text-gray-500">{entry.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Provider: {entry.doctor}</p>
                      <p className="text-sm font-medium text-gray-800 mb-2">Diagnosis: {entry.diagnosis}</p>
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

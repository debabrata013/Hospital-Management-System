"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PatientSummaryGenerator from '@/components/ai/PatientSummaryGenerator'
import DietPlanGenerator from '@/components/ai/DietPlanGenerator'
import AIContentViewModal from '@/components/ai/AIContentViewModal'
import { useState, useEffect } from 'react'
import { 
  Brain, 
  Wand2, 
  FileText,
  Utensils,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  RefreshCw,
  Sparkles,
  User,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react'

// Mock AI-generated content
const mockPatientSummary = {
  patientName: "राजेश कुमार",
  patientId: "P001",
  generatedAt: "2024-01-09 10:30 AM",
  doctorNotes: `
• Patient complains of chest discomfort
• BP elevated at 140/90
• No acute distress
• Heart sounds normal
• Lungs clear
• Continue current medications
• Follow up in 1 week
  `,
  aiSummary: `
Patient राजेश कुमार (P001) presented with chest discomfort during today's consultation. Clinical examination revealed elevated blood pressure (140/90 mmHg) but no signs of acute distress. Cardiovascular examination showed normal heart sounds, and respiratory examination revealed clear lung fields.

Current management plan includes continuation of existing antihypertensive medications. The patient's symptoms appear to be related to his known hypertensive condition. No immediate intervention required, but close monitoring is recommended.

Recommended follow-up appointment scheduled for one week to assess response to current treatment and monitor blood pressure control.
  `,
  status: "pending_approval"
}

const mockDietPlan = {
  patientName: "सुनीता देवी",
  patientId: "P002",
  condition: "Hypertension & Pre-diabetes",
  generatedAt: "2024-01-09 11:15 AM",
  doctorInput: "35-year-old female with hypertension and pre-diabetes. Needs low sodium, diabetic-friendly diet plan.",
  aiDietPlan: {
    overview: "A heart-healthy, diabetic-friendly meal plan designed to manage blood pressure and blood sugar levels.",
    dailyCalories: "1800-2000 calories",
    macronutrients: {
      carbs: "45-50%",
      protein: "20-25%",
      fats: "25-30%"
    },
    breakfast: [
      "1 bowl oatmeal with berries and nuts",
      "1 cup low-fat milk or unsweetened almond milk",
      "1 small apple"
    ],
    lunch: [
      "Grilled chicken salad with mixed vegetables",
      "1 small bowl brown rice",
      "1 cup buttermilk (low sodium)"
    ],
    dinner: [
      "Baked fish with steamed vegetables",
      "1 small roti (whole wheat)",
      "1 cup dal (low salt)"
    ],
    snacks: [
      "Handful of unsalted nuts",
      "1 cup green tea",
      "1 small bowl fruit salad"
    ],
    restrictions: [
      "Limit sodium to 2000mg per day",
      "Avoid processed foods",
      "Limit refined sugars",
      "Reduce saturated fats"
    ],
    recommendations: [
      "Drink 8-10 glasses of water daily",
      "Include 30 minutes of walking",
      "Monitor portion sizes",
      "Eat meals at regular intervals"
    ]
  },
  status: "pending_approval"
}

const aiToolsHistory = [
  {
    id: "AI001",
    type: "Patient Summary",
    patient: "राजेश कुमार",
    generatedAt: "2024-01-09 09:30 AM",
    status: "approved",
    approvedBy: "Dr. Priya Sharma"
  },
  {
    id: "AI002",
    type: "Diet Plan",
    patient: "मोहम्मद अली",
    generatedAt: "2024-01-08 02:15 PM",
    status: "approved",
    approvedBy: "Dr. Priya Sharma"
  },
  {
    id: "AI003",
    type: "Patient Summary",
    patient: "अनिता सिंह",
    generatedAt: "2024-01-08 11:45 AM",
    status: "rejected",
    approvedBy: "Dr. Priya Sharma"
  }
]

export default function DoctorAIToolsPage() {
  const [stats, setStats] = useState({
    summariesGenerated: 0,
    dietPlansCreated: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai/stats?doctorId=D001'); // Replace with actual doctor ID from session
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApproval = async (approvalId: number) => {
    try {
      const response = await fetch(`/api/ai/approval/${approvalId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedApproval(data);
        setIsModalOpen(true);
      } else {
        console.error('Failed to fetch approval details');
      }
    } catch (error) {
      console.error('Error fetching approval details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApproval(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Approval</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Patient Summary':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'Diet Plan':
        return <Utensils className="h-4 w-4 text-green-500" />
      default:
        return <Brain className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/doctor"
          className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-pink-500" />
              AI Assistant Tools
            </h1>
            <p className="text-gray-600 mt-2">Use AI to generate patient summaries & diet plans (approval required before saving)</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Summaries Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.summariesGenerated}
                </p>
              </div>
              <FileText className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diet Plans Created</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : stats.dietPlansCreated}
                </p>
              </div>
              <Utensils className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoading ? '...' : stats.pendingApprovals}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : stats.approvedToday}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Summary Generator */}
        <PatientSummaryGenerator onApproval={fetchStats} />

        {/* Diet Plan Generator */}
        <DietPlanGenerator onApproval={fetchStats} />
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Summary Approval */}
        <Card className="border-yellow-100 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <FileText className="h-5 w-5 mr-2" />
              Patient Summary - Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{mockPatientSummary.patientName}</p>
                <p className="text-sm text-gray-600">{mockPatientSummary.patientId} • {mockPatientSummary.generatedAt}</p>
              </div>
              {getStatusBadge(mockPatientSummary.status)}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Original Doctor Notes:</h4>
              <div className="p-3 bg-gray-100 rounded-lg text-sm">
                <pre className="whitespace-pre-wrap">{mockPatientSummary.doctorNotes}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Generated Summary:</h4>
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <p>{mockPatientSummary.aiSummary}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Save
              </Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diet Plan Approval */}
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Utensils className="h-5 w-5 mr-2" />
              Diet Plan - Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{mockDietPlan.patientName}</p>
                <p className="text-sm text-gray-600">{mockDietPlan.patientId} • {mockDietPlan.condition}</p>
              </div>
              {getStatusBadge(mockDietPlan.status)}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Doctor Input:</h4>
              <div className="p-3 bg-gray-100 rounded-lg text-sm">
                <p>{mockDietPlan.doctorInput}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Generated Diet Plan:</h4>
              <div className="p-3 bg-green-100 rounded-lg text-sm space-y-2">
                <p><strong>Overview:</strong> {mockDietPlan.aiDietPlan.overview}</p>
                <p><strong>Daily Calories:</strong> {mockDietPlan.aiDietPlan.dailyCalories}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="font-medium">Breakfast:</p>
                    <ul className="text-xs list-disc list-inside">
                      {mockDietPlan.aiDietPlan.breakfast.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Lunch:</p>
                    <ul className="text-xs list-disc list-inside">
                      {mockDietPlan.aiDietPlan.lunch.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Save
              </Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools History */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>AI Tools History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading recent activity...</p>
              </div>
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(item.type === 'patient_summary' ? 'Patient Summary' : 'Diet Plan')}
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.type === 'patient_summary' ? 'Patient Summary' : 'Diet Plan'} - {item.patient_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Generated: {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Approved by: {item.doctor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(item.status)}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => handleViewApproval(item.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No AI tools used yet. Start by generating a patient summary or diet plan above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Guidelines */}
      <Card className="border-blue-100 bg-blue-50 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Brain className="h-5 w-5 mr-2" />
            AI Assistant Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 space-y-2">
            <p><strong>Important:</strong> All AI-generated content requires doctor approval before being saved to patient records.</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review all AI suggestions carefully for medical accuracy</li>
              <li>Edit content as needed to match your clinical judgment</li>
              <li>Ensure patient-specific details are correct</li>
              <li>AI recommendations are assistive tools, not replacements for clinical expertise</li>
              <li>Always verify medication dosages and dietary restrictions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Brain className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced AI Clinical Tools Coming Soon</span>
        </div>
      </div>

      {/* AI Content View Modal */}
      <AIContentViewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        approval={selectedApproval}
      />
    </div>
  )
}

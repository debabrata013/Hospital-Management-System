"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Heart,
  Activity,
  Thermometer,
  Brain,
  Download,
  Eye,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// ✅ ClientOnly wrapper for hydration-safe charts
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <>{children}</>
}

export function DashboardOverview() {
  const summaryCards = [
    {
      title: "Next Appointment",
      value: "Dec 15, 2024",
      subtitle: "Dr. Smith - Cardiology",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      change: "+2%",
      trend: "up",
    },
    {
      title: "Last Visit",
      value: "Nov 28, 2024",
      subtitle: "General Checkup",
      icon: Clock,
      color: "from-green-500 to-green-600",
      change: "On time",
      trend: "neutral",
    },
    {
      title: "Pending Bills",
      value: "$245.00",
      subtitle: "2 outstanding invoices",
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      change: "-15%",
      trend: "down",
    },
    {
      title: "Test Results",
      value: "3 New",
      subtitle: "Blood work completed",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      change: "+1 new",
      trend: "up",
    },
  ]

  const vitalSigns = [
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "normal", icon: Heart, trend: "stable" },
    { label: "Heart Rate", value: "72", unit: "bpm", status: "normal", icon: Activity, trend: "stable" },
    { label: "Temperature", value: "98.6", unit: "°F", status: "normal", icon: Thermometer, trend: "stable" },
  ]

  const vitalsTimelineData = [
    { date: "Nov 1", bloodPressure: 118, heartRate: 68, temperature: 98.4 },
    { date: "Nov 8", bloodPressure: 122, heartRate: 72, temperature: 98.6 },
    { date: "Nov 15", bloodPressure: 119, heartRate: 70, temperature: 98.5 },
    { date: "Nov 22", bloodPressure: 121, heartRate: 74, temperature: 98.7 },
    { date: "Nov 28", bloodPressure: 120, heartRate: 72, temperature: 98.6 },
  ]

  const healthScoreData = [
    { category: "Cardiovascular", score: 85, maxScore: 100 },
    { category: "Respiratory", score: 92, maxScore: 100 },
    { category: "Metabolic", score: 78, maxScore: 100 },
    { category: "Mental Health", score: 88, maxScore: 100 },
  ]

  const upcomingAppointments = [
    { date: "Dec 15", time: "10:00 AM", doctor: "Dr. Smith", specialty: "Cardiology", type: "Follow-up" },
    { date: "Dec 22", time: "2:30 PM", doctor: "Dr. Johnson", specialty: "Dermatology", type: "Consultation" },
    { date: "Jan 5", time: "9:15 AM", doctor: "Dr. Williams", specialty: "General", type: "Annual Checkup" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
        <p className="text-gray-600">Here's your health overview and upcoming appointments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{card.subtitle}</p>
                <Badge
                  variant={card.trend === "up" ? "default" : card.trend === "down" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Health Summary */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            Based on your recent vitals and medical history, your overall health status is <strong>excellent</strong>.
            Your cardiovascular metrics remain stable, and your recent blood work shows optimal levels.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stable Vitals</Badge>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good Sleep Pattern</Badge>
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Active Lifestyle</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Timeline */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Vitals Timeline
              </span>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Health Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoreData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="#666" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="score" fill="url(#healthGradient)" radius={[0, 4, 4, 0]} />
                    <defs>
                      <linearGradient id="healthGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Vital Signs */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Current Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitalSigns.map((vital, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <vital.icon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">{vital.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {vital.value} <span className="text-sm font-normal text-gray-500">{vital.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{vital.status}</Badge>
                    <span className="text-xs text-gray-500">{vital.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </span>
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.doctor}</p>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.date}</p>
                  <p className="text-sm text-gray-500">{appointment.time}</p>
                  <Badge variant="outline" className="text-xs mt-1">{appointment.type}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Records
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Test Results
            </Button>
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Pay Bills
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

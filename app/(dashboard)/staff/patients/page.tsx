"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  Activity,
  Clock,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  Phone,
} from "lucide-react"


export default function StaffPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/staff/patients');
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case "Stable":
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case "Good":
        return <Badge className="bg-blue-100 text-blue-700">Good</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{condition}</Badge>
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "critical") return matchesSearch && patient.condition === "Critical"
    if (activeTab === "stable") return matchesSearch && patient.condition === "Stable"
    if (activeTab === "good") return matchesSearch && patient.condition === "Good"

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16 px-4 sm:px-6 py-3 sm:py-0 gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">My Patients</h1>
              <p className="text-xs sm:text-sm text-gray-500">Patients under your care</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 self-start sm:self-auto">
            {patients.length} Patients
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <Card className="border-green-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{patients.length}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                  <Users className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">
                    {patients.filter((p) => p.condition === "Critical").length}
                  </p>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-xl">
                  <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Stable</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">
                    {patients.filter((p) => p.condition === "Stable").length}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                  <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Vitals Due</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">5</p>
                </div>
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Patient List</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="stable">Stable</TabsTrigger>
                <TabsTrigger value="good">Good</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <p>Loading patients...</p>
                ) : filteredPatients.length === 0 ? (
                  <p>No patients found.</p>
                ) : (
                  filteredPatients.map((patient) => (
                  <Card key={patient.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      {/* Top Section */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                            <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                              {patient.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold">{patient.name}</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                              {patient.age}Y • {patient.gender}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {patient.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Condition</p>
                            {getConditionBadge(patient.condition)}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4 mr-1" />
                              Vitals
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Vitals */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      </div>

                      {/* Bottom Info */}

                    </CardContent>
                  </Card>
                )))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

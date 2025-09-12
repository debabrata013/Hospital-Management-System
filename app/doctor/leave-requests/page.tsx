"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Clock } from "lucide-react"
import LeaveRequestForm from "@/components/doctor/LeaveRequestForm"
import LeaveRequestsList from "@/components/doctor/LeaveRequestsList"

export default function LeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingRequest, setEditingRequest] = useState(null)

  const handleFormSubmit = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab("list")
    setEditingRequest(null)
  }

  const handleEdit = (request: any) => {
    setEditingRequest(request)
    setActiveTab("new")
  }

  const handleCancel = () => {
    setEditingRequest(null)
    setActiveTab("list")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600 mt-1">
              Manage your leave applications and time off requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-2 shadow-sm border border-pink-100">
              <Calendar className="h-5 w-5 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">-</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved This Year</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Available</p>
                  <p className="text-2xl font-bold text-blue-600">-</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="list">My Requests</TabsTrigger>
              <TabsTrigger value="new">
                {editingRequest ? "Edit Request" : "New Request"}
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "list" && (
              <Button
                onClick={() => {
                  setEditingRequest(null)
                  setActiveTab("new")
                }}
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            )}
          </div>

          <TabsContent value="list" className="space-y-6">
            <LeaveRequestsList 
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            <LeaveRequestForm
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

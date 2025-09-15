"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Activity,
  Pill,
  Stethoscope,
  Eye,
} from "lucide-react"

// Define the Task interface for type safety
interface Task {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  task: string;
  description: string;
  priority: 'high' | 'normal' | 'low';
  dueTime: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'in-progress';
  assignedBy: string;
  assignedAt: string;
  category: 'vitals' | 'medication' | 'care' | 'therapy' | 'monitoring';
  estimatedDuration: string;
  completedAt?: string;
}

// Mock data for tasks
const initialTasks: Task[] = [
  {
    id: "T001",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    task: "Record vital signs",
    description:
      "Check blood pressure, pulse, temperature, and oxygen saturation",
    priority: "normal",
    dueTime: "14:00",
    dueDate: "2024-01-15",
    status: "pending",
    assignedBy: "Dr. Anil Kumar",
    assignedAt: "2024-01-15T10:00:00Z",
    category: "vitals",
    estimatedDuration: "15 minutes",
  },
  {
    id: "T002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    roomNumber: "ICU-1",
    task: "Administer medication",
    description: "Give prescribed pain medication - Morphine 10mg IV",
    priority: "high",
    dueTime: "14:30",
    dueDate: "2024-01-15",
    status: "pending",
    assignedBy: "Dr. Rajesh Gupta",
    assignedAt: "2024-01-15T09:30:00Z",
    category: "medication",
    estimatedDuration: "10 minutes",
  },
  {
    id: "T003",
    patientId: "P002",
    patientName: "Sunita Devi",
    roomNumber: "205",
    task: "Wound dressing change",
    description:
      "Change surgical wound dressing and check for signs of infection",
    priority: "normal",
    dueTime: "15:00",
    dueDate: "2024-01-15",
    status: "pending",
    assignedBy: "Dr. Priya Singh",
    assignedAt: "2024-01-15T11:00:00Z",
    category: "care",
    estimatedDuration: "20 minutes",
  },
  {
    id: "T004",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    task: "Patient mobility assistance",
    description:
      "Help patient with walking exercises as per physiotherapy plan",
    priority: "normal",
    dueTime: "16:00",
    dueDate: "2024-01-15",
    status: "completed",
    assignedBy: "Physiotherapist",
    assignedAt: "2024-01-15T12:00:00Z",
    category: "therapy",
    estimatedDuration: "30 minutes",
    completedAt: "2024-01-15T16:30:00Z",
  },
  {
    id: "T005",
    patientId: "P004",
    patientName: "Geeta Sharma",
    roomNumber: "102",
    task: "Blood glucose monitoring",
    description: "Check blood sugar levels and record in chart",
    priority: "high",
    dueTime: "13:30",
    dueDate: "2024-01-15",
    status: "completed",
    assignedBy: "Dr. Anil Kumar",
    assignedAt: "2024-01-15T08:00:00Z",
    completedAt: "2024-01-15T13:25:00Z",
    category: "monitoring",
    estimatedDuration: "10 minutes",
  },
]

const taskCategories = [
  {
    id: "vitals",
    name: "Vital Signs",
    icon: Activity,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "medication",
    name: "Medication",
    icon: Pill,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "care",
    name: "Patient Care",
    icon: Stethoscope,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "therapy",
    name: "Therapy",
    icon: User,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "monitoring",
    name: "Monitoring",
    icon: FileText,
    color: "bg-red-100 text-red-700",
  },
]

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState({ priority: "all", category: "all" })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    try {
      const savedTasksJSON = localStorage.getItem("staffTasks")
      if (savedTasksJSON) {
        const savedTasks = JSON.parse(savedTasksJSON) as Task[]
        setTasks(savedTasks)
      } else {
        setTasks(initialTasks)
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error)
      setTasks(initialTasks)
    }
  }, [])

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700">High Priority</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-700">Normal</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-700">Low Priority</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700">Completed</Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
        )
      case "overdue":
        return <Badge className="bg-red-100 text-red-700">Overdue</Badge>
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = taskCategories.find((cat) => cat.id === category)
    if (categoryData) {
      const IconComponent = categoryData.icon
      return <IconComponent className="h-5 w-5" />
    }
    return <ClipboardList className="h-5 w-5" />
  }

  const getCategoryColor = (category: string) => {
    const categoryData = taskCategories.find((cat) => cat.id === category)
    return categoryData ? categoryData.color : "bg-gray-100 text-gray-700"
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.roomNumber.includes(searchQuery)

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && task.status === "pending") ||
        (activeTab === "completed" && task.status === "completed") ||
        (activeTab === "overdue" && task.status === "overdue")

      const matchesFilter =
        (filter.priority === "all" || task.priority === filter.priority) &&
        (filter.category === "all" || task.category === filter.category)

      return matchesSearch && matchesTab && matchesFilter
    })
  }, [tasks, searchQuery, activeTab, filter])

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  const markTaskComplete = (taskId: string) => {
    const updatedTasks: Task[] = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, status: "completed", completedAt: new Date().toISOString() }
      }
      return task
    })
    setTasks(updatedTasks)
    localStorage.setItem("staffTasks", JSON.stringify(updatedTasks))
  }

  const handleFilterChange = (type: string, value: string) => {
    setFilter((prev) => ({ ...prev, [type]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 h-auto md:h-16 px-6 py-3 md:py-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            <div className="hidden md:block h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Task Management
              </h1>
              <p className="text-sm text-gray-500">
                Track and complete assigned tasks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700"
            >
              {pendingTasks.length} Pending Tasks
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total Tasks
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {tasks.length}
                  </p>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-xl">
                  <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {pendingTasks.length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 md:p-3 rounded-xl">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {completedTasks.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 md:p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    High Priority
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {tasks.filter((task) => task.priority === "high").length}
                  </p>
                </div>
                <div className="bg-red-100 p-2 md:p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Categories */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Categories</CardTitle>
            <CardDescription>Overview of tasks by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {taskCategories.map((category) => {
                const categoryTasks = tasks.filter(
                  (task) => task.category === category.id
                )
                const IconComponent = category.icon
                return (
                  <div
                    key={category.id}
                    className="text-center p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
                  >
                    <div
                      className={`inline-flex p-3 rounded-xl ${category.color} mb-2`}
                    >
                      <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="font-medium text-xs md:text-sm">
                      {category.name}
                    </h3>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">
                      {categoryTasks.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {
                        categoryTasks.filter((t) => t.status === "pending")
                          .length
                      }{" "}
                      pending
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Scrollable Tabs on mobile */}
            <div className="w-full overflow-x-auto">
              <TabsList className="flex md:grid md:grid-cols-4 w-max md:w-auto gap-2 md:gap-0">
                <TabsTrigger value="all" className="flex-1 whitespace-nowrap">
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex-1 whitespace-nowrap"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex-1 whitespace-nowrap"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="overdue"
                  className="flex-1 whitespace-nowrap"
                >
                  Overdue
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("priority", "all")}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("priority", "high")}
                  >
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("priority", "normal")}
                  >
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("priority", "low")}
                  >
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("category", "all")}
                  >
                    All
                  </DropdownMenuItem>
                  {taskCategories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => handleFilterChange("category", cat.id)}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all" && "All Tasks"}
                  {activeTab === "pending" && "Pending Tasks"}
                  {activeTab === "completed" && "Completed Tasks"}
                  {activeTab === "overdue" && "Overdue Tasks"}
                </CardTitle>
                <CardDescription>
                  {filteredTasks.length} tasks found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div className="flex items-start md:items-center space-x-4">
                            <div
                              className={`p-3 rounded-lg ${getCategoryColor(
                                task.category
                              )}`}
                            >
                              {getCategoryIcon(task.category)}
                            </div>
                            <div>
                              <h3 className="text-base md:text-lg font-semibold">
                                {task.task}
                              </h3>
                              <p className="text-gray-600 text-sm md:text-base">
                                {task.patientName} • Room {task.roomNumber}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                Due: {task.dueTime} • Assigned by{" "}
                                {task.assignedBy}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-gray-600">
                                Priority
                              </p>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-gray-600">
                                Status
                              </p>
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>

                              {task.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => markTaskComplete(task.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">
                            {task.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs md:text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Estimated Duration:{" "}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              {task.estimatedDuration}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Assigned:{" "}
                            </span>
                            <span>
                              {isClient ? new Date(task.assignedAt).toLocaleString() : ''}
                            </span>
                          </div>
                          {task.completedAt && (
                            <div>
                              <span className="font-medium text-gray-600">
                                Completed:{" "}
                              </span>
                              <span>
                                {isClient ? new Date(task.completedAt).toLocaleString() : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            { selectedTask && (
              <div className="space-y-4">
                <p><strong>Task:</strong> {selectedTask.task}</p>
                <p><strong>Patient:</strong> {selectedTask.patientName} (Room: {selectedTask.roomNumber})</p>
                <p><strong>Description:</strong> {selectedTask.description}</p>
                <p><strong>Priority:</strong> {selectedTask.priority}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
                <p><strong>Due:</strong> {selectedTask.dueDate} at {selectedTask.dueTime}</p>
                <p><strong>Assigned by:</strong> {selectedTask.assignedBy}</p>
                <p><strong>Assigned at:</strong> {isClient ? new Date(selectedTask.assignedAt).toLocaleString() : ''}</p>
                {selectedTask.completedAt && <p><strong>Completed at:</strong> {isClient ? new Date(selectedTask.completedAt).toLocaleString() : ''}</p>}
              </div>
            )}
          </DialogContent>
      </Dialog>
    </div>
  )
}

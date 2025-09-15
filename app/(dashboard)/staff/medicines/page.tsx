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
  DialogDescription,
  DialogFooter,
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
  Pill,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Eye,
} from "lucide-react"

// Define the MedicineDelivery interface for type safety
interface MedicineDelivery {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  medicine: string;
  dosage: string;
  route: 'Oral' | 'IV' | 'Injection';
  frequency: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'pending' | 'delivered' | 'missed' | 'delayed';
  prescribedBy: string;
  notes: string;
  priority: 'high' | 'normal' | 'low';
  deliveredAt?: string;
  deliveredBy?: string;
}

// Mock data for medicine deliveries
const initialMedicines: MedicineDelivery[] = [
  {
    id: "MED001",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    medicine: "Amlodipine 5mg",
    dosage: "1 tablet",
    route: "Oral",
    frequency: "Once daily",
    scheduledTime: "14:30",
    scheduledDate: "2024-01-15",
    status: "pending",
    prescribedBy: "Dr. Anil Kumar",
    notes: "Take with food",
    priority: "normal",
  },
  {
    id: "MED002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    roomNumber: "ICU-1",
    medicine: "Morphine 10mg",
    dosage: "1 injection",
    route: "IV",
    frequency: "Every 4 hours",
    scheduledTime: "15:00",
    scheduledDate: "2024-01-15",
    status: "pending",
    prescribedBy: "Dr. Rajesh Gupta",
    notes: "Monitor for respiratory depression",
    priority: "high",
  },
  {
    id: "MED003",
    patientId: "P002",
    patientName: "Sunita Devi",
    roomNumber: "205",
    medicine: "Iron tablets",
    dosage: "2 tablets",
    route: "Oral",
    frequency: "Twice daily",
    scheduledTime: "15:30",
    scheduledDate: "2024-01-15",
    status: "pending",
    prescribedBy: "Dr. Priya Singh",
    notes: "Take on empty stomach",
    priority: "normal",
  },
  {
    id: "MED004",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    medicine: "Metformin 500mg",
    dosage: "1 tablet",
    route: "Oral",
    frequency: "Twice daily",
    scheduledTime: "13:00",
    scheduledDate: "2024-01-15",
    status: "delivered",
    prescribedBy: "Dr. Anil Kumar",
    notes: "Monitor blood glucose",
    priority: "normal",
    deliveredAt: "2024-01-15T13:05:00Z",
    deliveredBy: "Staff Nurse",
  },
];

export default function StaffMedicinesPage() {
  const [medicines, setMedicines] = useState<MedicineDelivery[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({ priority: "all" });
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDelivery | null>(null);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedMedicinesJSON = localStorage.getItem("medicineDeliveries");
      if (savedMedicinesJSON) {
        const savedMedicines = JSON.parse(savedMedicinesJSON) as MedicineDelivery[];
        setMedicines(savedMedicines);
      } else {
        setMedicines(initialMedicines);
      }
    } catch (error) {
      console.error("Failed to parse medicines from localStorage", error);
      setMedicines(initialMedicines);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "missed":
        return <Badge className="bg-red-100 text-red-700">Missed</Badge>;
      case "delayed":
        return <Badge className="bg-orange-100 text-orange-700">Delayed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700">High Priority</Badge>;
      case "normal":
        return <Badge className="bg-blue-100 text-blue-700">Normal</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-700">Low Priority</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>;
    }
  };

  const getRouteIcon = (route: string) => {
    switch (route) {
      case "IV":
        return <div className="bg-red-100 p-2 rounded-lg"><Pill className="h-4 w-4 text-red-600" /></div>;
      case "Oral":
        return <div className="bg-blue-100 p-2 rounded-lg"><Pill className="h-4 w-4 text-blue-600" /></div>;
      case "Injection":
        return <div className="bg-purple-100 p-2 rounded-lg"><Pill className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-lg"><Pill className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch =
        med.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.roomNumber.includes(searchQuery);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && med.status === "pending") ||
        (activeTab === "delivered" && med.status === "delivered") ||
        (activeTab === "overdue" && med.status === "missed");

      const matchesFilter =
        filter.priority === "all" || med.priority === filter.priority;

      return matchesSearch && matchesTab && matchesFilter;
    });
  }, [medicines, searchQuery, activeTab, filter]);

  const pendingMedicines = medicines.filter((med) => med.status === "pending");
  const deliveredMedicines = medicines.filter((med) => med.status === "delivered");

  const markAsDelivered = (medicineId: string) => {
    const updatedMedicines: MedicineDelivery[] = medicines.map((med) => {
      if (med.id === medicineId) {
        return {
          ...med,
          status: "delivered",
          deliveredAt: new Date().toISOString(),
          deliveredBy: "Staff Nurse",
        };
      }
      return med;
    });
    setMedicines(updatedMedicines);
    localStorage.setItem("medicineDeliveries", JSON.stringify(updatedMedicines));
  };

  const handleFilterChange = (type: string, value: string) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between h-auto md:h-16 px-4 md:px-6 py-3 gap-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
            </Button>
            <div className="hidden sm:block h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Medicine Delivery</h1>
              <p className="text-xs md:text-sm text-gray-500">Track and deliver patient medications</p>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs md:text-sm">
              {pendingMedicines.length} Pending Deliveries
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <Card className="border-green-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{medicines.length}</p>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-xl"><Package className="h-6 w-6 md:h-8 md:w-8 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{pendingMedicines.length}</p>
                </div>
                <div className="bg-yellow-100 p-2 md:p-3 rounded-xl"><Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{deliveredMedicines.length}</p>
                </div>
                <div className="bg-blue-100 p-2 md:p-3 rounded-xl"><CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{medicines.filter((med) => med.priority === "high").length}</p>
                </div>
                <div className="bg-red-100 p-2 md:p-3 rounded-xl"><AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFilterChange("priority", "all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("priority", "high")}>High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("priority", "normal")}>Normal</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("priority", "low")}>Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Schedule</CardTitle>
                <CardDescription>{filteredMedicines.length} medicines found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMedicines.map((medicine) => (
                    <Card key={medicine.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                          <div className="flex items-start sm:items-center space-x-4">
                            {getRouteIcon(medicine.route)}
                            <div>
                              <h3 className="text-base md:text-lg font-semibold">{medicine.medicine}</h3>
                              <p className="text-gray-600 text-sm md:text-base">{medicine.patientName} • Room {medicine.roomNumber}</p>
                              <p className="text-xs md:text-sm text-gray-500">{medicine.dosage} • {medicine.route} • {medicine.frequency}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-gray-600">Due Time</p>
                              <p className="text-sm md:text-lg font-semibold">{medicine.scheduledTime}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-gray-600">Priority</p>
                              {getPriorityBadge(medicine.priority)}
                            </div>
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-gray-600">Status</p>
                              {getStatusBadge(medicine.status)}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />Details
                              </Button>
                              {medicine.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                                  onClick={() => {
                                    setSelectedMedicine(medicine);
                                    setDeliveryDialog(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />Deliver
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm mb-4">
                          <div><span className="font-medium text-gray-600">Prescribed by: </span><span>{medicine.prescribedBy}</span></div>
                          <div><span className="font-medium text-gray-600">Frequency: </span><span>{medicine.frequency}</span></div>
                          {medicine.deliveredAt && (
                            <div>
                              <span className="font-medium text-gray-600">Delivered: </span>
                              <span>{isClient ? new Date(medicine.deliveredAt).toLocaleString() : ""}</span>
                            </div>
                          )}
                        </div>
                        {medicine.notes && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs md:text-sm">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <span className="font-medium text-yellow-800">Important Notes: </span>
                                <span className="text-yellow-700">{medicine.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4 py-4">
              <p><strong>Medicine:</strong> {selectedMedicine.medicine}</p>
              <p><strong>Patient:</strong> {selectedMedicine.patientName} (Room {selectedMedicine.roomNumber})</p>
              <p><strong>Dosage:</strong> {selectedMedicine.dosage}</p>
              <p><strong>Route:</strong> {selectedMedicine.route}</p>
              <p><strong>Frequency:</strong> {selectedMedicine.frequency}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedMedicine.status)}</p>
              <p><strong>Prescribed By:</strong> {selectedMedicine.prescribedBy}</p>
              {selectedMedicine.notes && <p><strong>Notes:</strong> {selectedMedicine.notes}</p>}
              {selectedMedicine.deliveredAt && <p><strong>Delivered At:</strong> {isClient ? new Date(selectedMedicine.deliveredAt).toLocaleString() : ''}</p>}
              {selectedMedicine.deliveredBy && <p><strong>Delivered By:</strong> {selectedMedicine.deliveredBy}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={deliveryDialog} onOpenChange={setDeliveryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Medicine Delivery</DialogTitle>
            <DialogDescription>Confirm that you have delivered the medication to the patient</DialogDescription>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-base md:text-lg">{selectedMedicine.medicine}</h3>
                <p className="text-gray-600 text-sm">{selectedMedicine.patientName} • Room {selectedMedicine.roomNumber}</p>
                <p className="text-xs md:text-sm text-gray-500">{selectedMedicine.dosage} • {selectedMedicine.route}</p>
              </div>
              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Scheduled Time:</span>
                  <span>{selectedMedicine.scheduledTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Current Time:</span>
                  <span>{isClient ? new Date().toLocaleTimeString() : ""}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Prescribed by:</span>
                  <span>{selectedMedicine.prescribedBy}</span>
                </div>
              </div>
              {selectedMedicine.notes && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm">
                    <span className="font-medium text-yellow-800">Notes: </span>
                    <span className="text-yellow-700">{selectedMedicine.notes}</span>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryDialog(false)}>Cancel</Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                if (selectedMedicine) {
                  markAsDelivered(selectedMedicine.id);
                }
                setDeliveryDialog(false);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

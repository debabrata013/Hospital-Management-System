/**
 * Pharmacy Prescriptions Management Page
 * 
 * This is the main frontend component for managing prescriptions in the pharmacy module.
 * It provides a comprehensive interface for pharmacists to view, search, filter, and
 * process prescriptions with detailed medication information and dispensing capabilities.
 * 
 * Key Features:
 * - Real-time prescription list with search and filtering
 * - Detailed prescription view with patient and doctor information
 * - Medication dispensing workflow with stock validation
 * - Dispensing history and audit trail
 * - Status management and progress tracking
 * - Responsive design for desktop and mobile use
 * 
 * State Management:
 * - Uses React hooks for local state management
 * - Implements optimistic updates for better UX
 * - Handles loading states and error conditions
 * - Real-time data synchronization with backend APIs
 * 
 * Integration Points:
 * - /api/pharmacy/prescriptions - Main prescriptions list
 * - /api/pharmacy/prescriptions/[id] - Detailed prescription data
 * - /api/pharmacy/prescriptions/[id]/dispense - Medication dispensing
 * 
 * @author Hospital Management System
 * @version 1.0
 * @since 2024-08-26
 */

'use client';

import React, { useState, useEffect } from 'react';
// UI Components from shadcn/ui library for consistent design system
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
// Lucide React icons for consistent iconography
import { 
  Search, 
  Filter, 
  Eye, 
  Pill, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  FileText,
  Package,
  Activity,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
// Toast notifications for user feedback
import { toast } from 'sonner';

/**
 * Prescription Interface
 * 
 * Defines the structure for prescription data as received from the API.
 * Includes patient information, doctor details, and dispensing status.
 * Used for the main prescriptions list display and filtering.
 */
interface Prescription {
  id: number;                    // Database primary key
  prescription_id: string;       // Human-readable prescription identifier
  patient_name: string;          // Patient full name
  patient_code: string;          // Unique patient identifier
  patient_phone: string;         // Patient contact number
  age: number;                   // Calculated patient age
  gender: string;                // Patient gender
  doctor_name: string;           // Prescribing doctor name
  specialization: string;        // Doctor's medical specialization
  prescription_date: string;     // Date prescription was created
  total_amount: string;          // Total prescription value
  status: string;                // Prescription status (pending, in_progress, completed)
  total_medications: number;     // Count of prescribed medications
  dispensed_medications: string; // Count of dispensed medications
  dispensing_status: string;     // Overall dispensing progress
  created_at: string;           // Prescription creation timestamp
}

/**
 * Medication Interface
 * 
 * Represents individual medication items within a prescription.
 * Contains detailed information about dosage, stock availability,
 * and dispensing status for each prescribed medicine.
 */
interface Medication {
  id: number;                    // Medication record ID
  medicine_name: string;         // Brand/trade name of medicine
  generic_name: string;          // Generic/scientific name
  strength: string;              // Medicine strength (e.g., "500mg")
  dosage_form: string;           // Form (tablet, capsule, syrup, etc.)
  quantity: number;              // Prescribed quantity
  dosage: string;                // Dosage instructions (e.g., "1 tablet")
  frequency: string;             // Frequency (e.g., "twice daily")
  duration: string;              // Treatment duration (e.g., "7 days")
  instructions: string;          // Special instructions for patient
  unit_price: string;            // Price per unit
  total_price: string;           // Total cost for prescribed quantity
  is_dispensed: boolean;         // Whether fully dispensed
  dispensed_quantity: number;    // Quantity already dispensed
  stock_status: string;          // Stock availability (available, partial, out_of_stock)
  current_stock: number;         // Current inventory level
}

/**
 * PrescriptionDetails Interface
 * 
 * Extended prescription data structure used for detailed view.
 * Combines prescription info with medications, history, and summary statistics.
 * Used when displaying full prescription details in modal dialogs.
 */
interface PrescriptionDetails {
  // Enhanced prescription object with additional patient and doctor details
  prescription: Prescription & {
    patient_email: string;       // Patient email address
    patient_address: string;     // Patient residential address
    doctor_phone: string;        // Doctor contact number
    notes: string;               // Prescription notes and special instructions
    follow_up_date: string;      // Scheduled follow-up appointment
  };
  medications: Medication[];     // Array of prescribed medications
  history: any[];               // Dispensing history and audit trail
  summary: {                    // Summary statistics for quick reference
    total_medications: number;
    dispensed_medications: number;
    pending_medications: number;
    partially_dispensed: number;
    total_amount: string;
    dispensing_status: string;
  };
}

/**
 * PrescriptionsPage Component
 * 
 * Main functional component that renders the pharmacy prescriptions interface.
 * Manages state for prescriptions list, filtering, search, and detailed views.
 * Handles user interactions and API communications for prescription management.
 */
export default function PrescriptionsPage() {
  // State management for prescriptions data and UI controls
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);     // Main prescriptions list
  const [loading, setLoading] = useState(true);                              // Loading state for API calls
  const [searchTerm, setSearchTerm] = useState('');                          // Search input value
  const [statusFilter, setStatusFilter] = useState('all');                   // Status filter selection
  const [dispensingFilter, setDispensingFilter] = useState('all');           // Dispensing status filter
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetails | null>(null); // Selected prescription for details
  const [showDetails, setShowDetails] = useState(false);                     // Details modal visibility
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);       // Dispensing dialog visibility
  const [dispensingData, setDispensingData] = useState<any>({});             // Form data for medication dispensing
  const [statistics, setStatistics] = useState<any>({});                     // Dashboard statistics and metrics

  /**
   * useEffect Hook - Component Initialization and Data Fetching
   * 
   * Triggers data fetching when component mounts or when filter values change.
   * Dependencies include statusFilter and dispensingFilter to ensure data
   * refreshes when user changes filtering criteria.
   */
  useEffect(() => {
    fetchPrescriptions();  // Load prescriptions list with current filters
    fetchStatistics();     // Load dashboard statistics and metrics
  }, [statusFilter, dispensingFilter]);

  /**
   * fetchPrescriptions - Retrieve prescriptions list from API
   * 
   * Fetches paginated prescriptions list with applied filters.
   * Handles loading states and error conditions with user feedback.
   * Updates both prescriptions list and statistics in state.
   * 
   * Query Parameters:
   * - limit: Maximum number of prescriptions to fetch
   * - status: Filter by prescription status (if not 'all')
   * - pendingOnly: Show only pending prescriptions (if dispensingFilter is 'pending')
   */
  const fetchPrescriptions = async () => {
    try {
      // Set loading state to show spinner/skeleton UI
      setLoading(true);
      
      // Build query parameters based on current filter selections
      // Uses URLSearchParams for proper encoding and parameter handling
      const params = new URLSearchParams({
        limit: '50',  // Limit results for performance and pagination
        ...(statusFilter !== 'all' && { status: statusFilter }),           // Add status filter if not 'all'
        ...(dispensingFilter === 'pending' && { pendingOnly: 'true' })     // Add pending filter if selected
      });

      // Make API request to fetch prescriptions with filters
      const response = await fetch(`/api/pharmacy/prescriptions?${params}`);
      const data = await response.json();

      // Handle successful response
      if (data.success) {
        setPrescriptions(data.data.prescriptions);  // Update prescriptions list
        setStatistics(data.data.statistics);        // Update dashboard statistics
      } else {
        // Show error message if API returns failure
        toast.error('Failed to fetch prescriptions');
      }
    } catch (error) {
      // Handle network errors and unexpected failures
      console.error('Error fetching prescriptions:', error);
      toast.error('Error loading prescriptions');
    } finally {
      // Always clear loading state regardless of success/failure
      setLoading(false);
    }
  };

  /**
   * fetchStatistics - Retrieve dashboard statistics and metrics
   * 
   * Fetches aggregated data for dashboard display including:
   * - Total prescriptions count
   * - Pending/completed counts
   * - Revenue metrics
   * - Stock alerts and notifications
   */
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/pharmacy/prescriptions?limit=1');
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPrescriptionDetails = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPrescription(data.data);
        setShowDetails(true);
      } else {
        toast.error('Failed to fetch prescription details');
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      toast.error('Error loading prescription details');
    }
  };

  const handleDispenseMedication = async () => {
    if (!selectedPrescription || !dispensingData.medications) {
      toast.error('Please select medications to dispense');
      return;
    }

    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${selectedPrescription.prescription.id}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medications: dispensingData.medications,
          pharmacist_id: 2, // This should come from auth context
          patient_signature: dispensingData.patient_signature,
          notes: dispensingData.notes
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Medications dispensed successfully');
        setShowDispenseDialog(false);
        setDispensingData({});
        fetchPrescriptions();
        if (selectedPrescription) {
          fetchPrescriptionDetails(selectedPrescription.prescription.prescription_id);
        }
      } else {
        toast.error(data.error || 'Failed to dispense medications');
      }
    } catch (error) {
      console.error('Error dispensing medications:', error);
      toast.error('Error dispensing medications');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.prescription_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patient_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDispensingStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      partially_dispensed: { color: 'bg-orange-100 text-orange-800', label: 'Partial', icon: AlertCircle },
      fully_dispensed: { color: 'bg-green-100 text-green-800', label: 'Complete', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600 mt-1">Manage and dispense patient prescriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPrescriptions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_prescriptions || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.active_prescriptions || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Dispensing</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending_dispensing || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{statistics.total_value || '0.00'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by prescription ID, patient name, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dispensingFilter} onValueChange={setDispensingFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by dispensing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="partial">Partially Dispensed</SelectItem>
                <SelectItem value="complete">Fully Dispensed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions ({filteredPrescriptions.length})</CardTitle>
          <CardDescription>
            Click on a prescription to view details and dispense medications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading prescriptions...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dispensing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {prescription.prescription_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prescription.patient_name}</p>
                        <p className="text-sm text-gray-500">
                          {prescription.patient_code} • {prescription.age}Y • {prescription.gender}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prescription.doctor_name}</p>
                        <p className="text-sm text-gray-500">{prescription.specialization}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(prescription.prescription_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Pill className="w-4 h-4 text-gray-400" />
                        <span>{prescription.dispensed_medications}/{prescription.total_medications}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(prescription.status)}
                    </TableCell>
                    <TableCell>
                      {getDispensingStatusBadge(prescription.dispensing_status)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{prescription.total_amount}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPrescriptionDetails(prescription.prescription_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredPrescriptions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No prescriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              {selectedPrescription?.prescription.prescription_id}
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient and Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p>{selectedPrescription.prescription.patient_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Patient ID</Label>
                      <p>{selectedPrescription.prescription.patient_code}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Age</Label>
                        <p>{selectedPrescription.prescription.age} years</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p>{selectedPrescription.prescription.gender}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p>{selectedPrescription.prescription.patient_phone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Doctor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p>{selectedPrescription.prescription.doctor_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Specialization</Label>
                      <p>{selectedPrescription.prescription.specialization}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prescription Date</Label>
                      <p>{new Date(selectedPrescription.prescription.prescription_date).toLocaleDateString()}</p>
                    </div>
                    {selectedPrescription.prescription.follow_up_date && (
                      <div>
                        <Label className="text-sm font-medium">Follow-up Date</Label>
                        <p>{new Date(selectedPrescription.prescription.follow_up_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Prescription Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prescription Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedPrescription.summary.total_medications}</p>
                      <p className="text-sm text-gray-600">Total Medications</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedPrescription.summary.dispensed_medications}</p>
                      <p className="text-sm text-gray-600">Dispensed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{selectedPrescription.summary.pending_medications}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">₹{selectedPrescription.summary.total_amount}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications List */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Medications</CardTitle>
                    <Button 
                      onClick={() => setShowDispenseDialog(true)}
                      disabled={selectedPrescription.summary.pending_medications === 0}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Dispense Medications
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Instructions</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.medications.map((medication) => (
                        <TableRow key={medication.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medication.medicine_name}</p>
                              <p className="text-sm text-gray-500">
                                {medication.generic_name} • {medication.strength} • {medication.dosage_form}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{medication.dosage}</p>
                              <p className="text-sm text-gray-500">{medication.frequency}</p>
                              <p className="text-sm text-gray-500">{medication.duration}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medication.dispensed_quantity}/{medication.quantity}</p>
                              <p className="text-sm text-gray-500">
                                {medication.quantity - medication.dispensed_quantity} remaining
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{medication.instructions}</p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                medication.stock_status === 'available' ? 'bg-green-100 text-green-800' :
                                medication.stock_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {medication.current_stock} available
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {medication.is_dispensed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Dispensed
                              </Badge>
                            ) : medication.dispensed_quantity > 0 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Partial
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{medication.total_price}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedPrescription.prescription.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedPrescription.prescription.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispense Medications Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispense Medications</DialogTitle>
            <DialogDescription>
              Select medications and quantities to dispense for {selectedPrescription?.prescription.patient_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4">
              {/* Medications to Dispense */}
              <div className="space-y-4">
                {selectedPrescription.medications
                  .filter(med => !med.is_dispensed && med.dispensed_quantity < med.quantity)
                  .map((medication) => (
                    <Card key={medication.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{medication.medicine_name}</h4>
                            <p className="text-sm text-gray-500">
                              {medication.generic_name} • {medication.strength} • {medication.dosage_form}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Prescribed: {medication.quantity} • Remaining: {medication.quantity - medication.dispensed_quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Available Stock: {medication.current_stock}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <Label htmlFor={`quantity-${medication.id}`} className="text-sm">
                                Quantity to Dispense
                              </Label>
                              <Input
                                id={`quantity-${medication.id}`}
                                type="number"
                                min="1"
                                max={Math.min(
                                  medication.quantity - medication.dispensed_quantity,
                                  medication.current_stock
                                )}
                                className="w-24"
                                onChange={(e) => {
                                  const quantity = parseInt(e.target.value) || 0;
                                  setDispensingData(prev => ({
                                    ...prev,
                                    medications: {
                                      ...prev.medications,
                                      [medication.id]: {
                                        medication_id: medication.id,
                                        quantity_to_dispense: quantity,
                                        unit_price: medication.unit_price,
                                        is_full_dispense: quantity === (medication.quantity - medication.dispensed_quantity)
                                      }
                                    }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient-signature">Patient Signature (Optional)</Label>
                  <Input
                    id="patient-signature"
                    placeholder="Patient signature or acknowledgment"
                    value={dispensingData.patient_signature || ''}
                    onChange={(e) => setDispensingData(prev => ({
                      ...prev,
                      patient_signature: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="pharmacist-notes">Pharmacist Notes (Optional)</Label>
                  <Textarea
                    id="pharmacist-notes"
                    placeholder="Any additional notes or instructions..."
                    value={dispensingData.notes || ''}
                    onChange={(e) => setDispensingData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDispenseDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDispenseMedication}
                  disabled={!dispensingData.medications || Object.keys(dispensingData.medications).length === 0}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Dispense Selected Medications
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

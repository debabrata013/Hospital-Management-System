"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { 
  Search,
  Plus, 
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Activity
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  isCurrentlyAdmitted: boolean;
  appointmentCount: number;
  admissionCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    admittedToday: 0,
    dischargedToday: 0,
    newRegistrations: 0,
    followUps: 0
  });

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalPatients: data.totalPatients || 0,
          admittedToday: data.admittedToday || 0,
          dischargedToday: data.dischargedToday || 0,
          newRegistrations: data.newRegistrations || 0,
          followUps: data.followUps || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch patients
  const fetchPatients = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/patients?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data.patients);
      setPagination(data.pagination);
      fetchStats(); // Refresh stats after fetching patients
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Search patients
  const handleSearch = async () => {
    setSearchLoading(true);
    await fetchPatients(1, search);
    setSearchLoading(false);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      fetchPatients(1, '');
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchPatients(page, search);
  };

  // Delete patient
  const handleDeletePatient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/patients?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });

      // Refresh the current page and stats
      fetchPatients(pagination.page, search);
      fetchStats(); // Refresh stats after deleting patient
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  // Get status badge
  const getStatusBadge = (isAdmitted: boolean) => {
    return isAdmitted ? (
      <Badge variant="destructive" className="text-xs">
        <Activity className="w-3 h-3 mr-1" />
        Admitted
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        <User className="w-3 h-3 mr-1" />
        Outpatient
      </Badge>
    );
  };

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'register':
        router.push('/admin/patients/add');
        break;
      case 'admit':
        router.push('/admin/patients/add?admit=true');
        break;
      case 'discharge':
        // For now, just show a message - you can implement discharge logic later
        toast({
          title: "Info",
          description: "Discharge functionality will be implemented soon",
        });
        break;
      case 'records':
        // For now, just show a message - you can implement medical records view later
        toast({
          title: "Info",
          description: "Medical records view will be implemented soon",
        });
        break;
    }
  };

  useEffect(() => {
    fetchStats(); // Fetch stats on mount
    fetchPatients();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view all patient records
            </p>
          </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
          <Button
            onClick={() => router.push('/admin/patients/add')}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold tex
                t-gray-900">{stats.totalPatients.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admitted Today Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admitted Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.admittedToday}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discharged Today Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharged Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.dischargedToday}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Registrations Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Registrations</p>
                <p className="text-2xl font-bold text-purple-600">{stats.newRegistrations}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                placeholder="Search patients by name, ID, or contact..."
                value={search}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10"
                />
              </div>
            <Button 
              onClick={handleSearch}
              disabled={searchLoading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Records</span>
            <span className="text-sm text-muted-foreground">
              {pagination.total} total patients
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
              </p>
              {!search && (
                <Button onClick={() => router.push('/admin/patients/add')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden space-y-4">
                {patients.map((patient) => (
                  <Card key={patient.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.patientId}</p>
                  </div>
                      {getStatusBadge(patient.isCurrentlyAdmitted)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{patient.age} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{patient.gender}</span>
                      </div>
                        </div>

                    <div className="space-y-2 text-sm mb-4">
                      {patient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{patient.address}</span>
                        </div>
                      )}
                      </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span>Appointments: {patient.appointmentCount}</span>
                        </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        </div>
                      </div>
                  </Card>
                ))}
                    </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">{patient.patientId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {patient.phone}
                              </div>
                            )}
                            {patient.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {patient.email}
                              </div>
                            )}
                      </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {patient.age} years • {patient.gender}
                      </div>
                            {patient.address && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {patient.address}
                    </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Appointments: {patient.appointmentCount}
                  </div>
                </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(patient.isCurrentlyAdmitted)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                  </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                  </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent className="flex justify-center">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === pagination.page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Page {pagination.page} of {pagination.totalPages} • 
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Admitted Patients Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admitted Patients</p>
                <p className="text-2xl font-bold text-blue-600">{stats.admittedToday}</p>
                <p className="text-xs text-gray-500">Currently in hospital</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Outpatients Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outpatients</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPatients - stats.admittedToday}</p>
                <p className="text-xs text-gray-500">Regular consultations</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Follow-ups</p>
                <p className="text-2xl font-bold text-purple-600">{stats.followUps}</p>
                <p className="text-xs text-gray-500">Scheduled returns</p>
            </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

        {/* New Patients Card */}
        <Card className="bg-white shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Patients</p>
                <p className="text-2xl font-bold text-orange-600">{stats.newRegistrations}</p>
                <p className="text-xs text-gray-500">Today's registrations</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleQuickAction('register')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
            >
              <Plus className="w-6 h-6" />
              <span>Register Patient</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickAction('admit')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
            >
              <Activity className="w-6 h-6" />
              <span>Admit Patient</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickAction('discharge')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
            >
              <User className="w-6 h-6" />
              <span>Discharge Patient</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickAction('records')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
            >
              <Calendar className="w-6 h-6" />
              <span>Medical Records</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
  );
}

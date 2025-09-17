"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Search, UserCheck, Mail, Phone, Calendar, Award, Building2, Settings, Edit } from "lucide-react"
import NurseAssignmentModal from "@/components/admin/NurseAssignmentModal"

interface Nurse {
  id: number;
  name: string;
  email: string;
  mobile: string;
  created_at: string;
}

interface NurseAssignment {
  id: number;
  nurse_id: number;
  doctor_id: number;
  department: 'opd' | 'ward';
  doctor_name: string;
  assigned_date: string;
}

export default function NursesManagement() {
  const { user } = useAuth();
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [assignments, setAssignments] = useState<NurseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nursesRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/nurses'),
        fetch('/api/admin/nurse-assignments')
      ]);
      
      if (!nursesRes.ok) {
        throw new Error('Failed to fetch nurses');
      }
      
      const nursesData = await nursesRes.json();
      setNurses(nursesData.map((nurse: any) => ({
        ...nurse,
        id: parseInt(nurse.id)
      })));
      
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManageNurse = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNurse(null);
  };

  const handleAssignmentSuccess = () => {
    fetchData();
  };

  const getNurseAssignment = (nurseId: number) => {
    return assignments.find(a => a.nurse_id === nurseId);
  };

  const filteredNurses = nurses.filter(nurse =>
    nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (nurse.mobile && nurse.mobile.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-500">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Nurses</h1>
                <p className="text-gray-600">View and manage all registered nurses</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">{nurses.length}</p>
              <p className="text-sm text-gray-500">Total Nurses</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 border-pink-100">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search nurses by name, email, or contact number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-pink-200 focus:border-pink-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-700">
                <UserCheck className="h-5 w-5 mr-2" />
                <p className="font-medium">Error loading nurses: {error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Nurses List */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-pink-600" />
              All Nurses ({filteredNurses.length})
            </CardTitle>
            <CardDescription>
              {searchTerm ? `Showing ${filteredNurses.length} nurses matching "${searchTerm}"` : 'All registered nurses in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNurses.length > 0 ? (
              <div className="space-y-4">
                {filteredNurses.map((nurse) => (
                  <div key={nurse.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-pink-100 text-pink-700 text-lg font-semibold">
                          {nurse.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{nurse.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {nurse.email}
                          </div>
                          {nurse.mobile && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {nurse.mobile}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Joined {new Date(nurse.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getNurseAssignment(nurse.id) ? (
                        <div>
                          <Badge className="bg-green-100 text-green-700 mb-1">Assigned</Badge>
                          <p className="text-xs text-gray-600">
                            {getNurseAssignment(nurse.id)?.department.toUpperCase()} - Dr. {getNurseAssignment(nurse.id)?.doctor_name}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageNurse(nurse)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 mt-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Badge className="bg-gray-100 text-gray-700 mb-1">Unassigned</Badge>
                          <Button
                            size="sm"
                            onClick={() => handleManageNurse(nurse)}
                            className="bg-pink-600 hover:bg-pink-700 text-white mt-1"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Joined {new Date(nurse.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No nurses found' : 'No nurses registered'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No nurses match your search for "${searchTerm}"`
                    : 'No nurses have been registered in the system yet.'
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-pink-200 text-pink-600 hover:bg-pink-50"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Modal */}
        {selectedNurse && (
          <NurseAssignmentModal
            nurse={selectedNurse}
            assignment={getNurseAssignment(selectedNurse.id)}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleAssignmentSuccess}
          />
        )}
      </div>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, LayoutDashboard, Calendar, Users, FileText, Stethoscope, Bell, LogOut, User, CalendarDays, ArrowLeft, Save, Edit, X } from 'lucide-react'

// Navigation items
const navigationItems = [
  {
    title: "मुख्य (Main)",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/doctor" },
      { title: "Today's Schedule", icon: Calendar, url: "/doctor/schedule" },
      { title: "Leave Requests", icon: CalendarDays, url: "/doctor/leave-requests" },
    ]
  },
  {
    title: "रोगी प्रबंधन (Patient Care)",
    items: [
      { title: "Patient Records", icon: Users, url: "/doctor/patients" },
      { title: "Patient Information Center", icon: FileText, url: "/doctor/patient-info" },
      { title: "Consultations", icon: Stethoscope, url: "/doctor/consultations" },
      { title: "Medical History", icon: FileText, url: "/doctor/history" },
    ]
  }
]

interface DoctorProfile {
  id: number
  user_id: string
  name: string
  email: string
  contact_number: string
  role: string
  department: string
  specialization: string
  qualification: string
  joining_date: string
  is_active: boolean
  is_verified: boolean
  address: string
  employee_type: string
  salary: number
  emergency_contact: string
  emergency_contact_name: string
  created_at: string
  updated_at: string
}

export default function DoctorSettings() {
  const { authState, logout } = useAuth();
  const { user, isLoading } = authState;
  const [notifications] = useState(5);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    department: '',
    specialization: '',
    qualification: '',
    address: '',
    emergency_contact: '',
    emergency_contact_name: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch('/api/doctor/profile');
        console.log('Profile API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Profile API error:', errorData);
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        console.log('Profile API data:', data);
        
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          contact_number: data.profile.contact_number || '',
          department: data.profile.department || '',
          specialization: data.profile.specialization || '',
          qualification: data.profile.qualification || '',
          address: data.profile.address || '',
          emergency_contact: data.profile.emergency_contact || '',
          emergency_contact_name: data.profile.emergency_contact_name || ''
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Failed to load profile data");
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update the profile state with new data
      if (profile) {
        setProfile({
          ...profile,
          ...formData
        });
      }
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        contact_number: profile.contact_number || '',
        department: profile.department || '',
        specialization: profile.specialization || '',
        qualification: profile.qualification || '',
        address: profile.address || '',
        emergency_contact: profile.emergency_contact || '',
        emergency_contact_name: profile.emergency_contact_name || ''
      });
    }
    setIsEditing(false);
  };

  if (isLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to view your profile.</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-pink-100">
          <SidebarHeader className="border-b border-pink-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">आरोग्य अस्पताल</h2>
                <p className="text-sm text-gray-500">डॉक्टर पैनल</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            {navigationItems.map((section: any) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item: any) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="w-full justify-start hover:bg-pink-50"
                        >
                          <Link href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          
          <SidebarFooter className="border-t border-pink-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-pink-700">DR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user ? user.name : 'Doctor'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.department || 'Cardiologist'}</p>
              </div>
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-pink-500" />
                <Link href="/doctor" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-sm text-gray-500">Manage your profile information</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative hover:bg-pink-50">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </div>
                
                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-pink-50">
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-pink-700">DR</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Doctor Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/settings">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/schedule">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Schedule
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onSelect={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Profile Settings Content */}
          <main className="flex-1 p-6 space-y-8">
            <div className="max-w-4xl mx-auto">
              {/* Profile Information Card */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Doctor Profile</CardTitle>
                    <CardDescription>Your personal and professional information</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline" 
                      size="sm"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.name || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="p-3 bg-gray-50 rounded-md">{profile?.email || 'Not specified'}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      {isEditing ? (
                        <Input
                          value={formData.contact_number}
                          onChange={(e) => handleInputChange('contact_number', e.target.value)}
                          placeholder="Enter your contact number"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.contact_number || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Department</Label>
                      {isEditing ? (
                        <Input
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          placeholder="Enter your department"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.department || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      {isEditing ? (
                        <Input
                          value={formData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          placeholder="Enter your specialization"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.specialization || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Qualification</Label>
                      {isEditing ? (
                        <Input
                          value={formData.qualification}
                          onChange={(e) => handleInputChange('qualification', e.target.value)}
                          placeholder="Enter your qualifications"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.qualification || 'Not specified'}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Address</Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your address"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">{profile?.address || 'Not specified'}</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      {isEditing ? (
                        <Input
                          value={formData.emergency_contact}
                          onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                          placeholder="Emergency contact number"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.emergency_contact || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Emergency Contact Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.emergency_contact_name}
                          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                          placeholder="Emergency contact person name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profile?.emergency_contact_name || 'Not specified'}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Account Information</CardTitle>
                  <CardDescription>View your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">{profile?.user_id}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-3 bg-gray-50 rounded-md text-sm capitalize">{profile?.role}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Joining Date</Label>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profile?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

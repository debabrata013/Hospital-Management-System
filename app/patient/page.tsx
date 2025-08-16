"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Stethoscope, FileText, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PatientDashboardPage = () => {
  const { authState, logout } = useAuth();
  const user = authState.user;

  // Dummy data for demonstration
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Anjali Sharma', specialty: 'Cardiology', date: '2025-08-20', time: '10:30 AM' },
    { id: 2, doctor: 'Dr. Vikram Singh', specialty: 'Neurology', date: '2025-09-05', time: '02:00 PM' },
  ];

  const recentRecords = [
    { id: 1, type: 'Blood Test Report', date: '2025-08-15' },
    { id: 2, type: 'X-Ray Scan', date: '2025-08-10' },
  ];

  if (authState.isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-pink-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-pink-500" />
              <span className="ml-2 text-xl font-bold text-gray-800">आरोग्य अस्पताल</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>
              <Button onClick={logout} variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">Here's your health summary at a glance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Actions */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="border-pink-100 shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-pink-200">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{`${user.firstName} ${user.lastName}`}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white">
                  <User className="h-4 w-4 mr-2" />
                  View/Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a New Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Medical Records
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Appointments & Records */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>You have {upcomingAppointments.length} appointments scheduled.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {upcomingAppointments.map(appt => (
                    <li key={appt.id} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-full mr-4 border border-pink-100">
                          <Calendar className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{appt.doctor}</p>
                          <p className="text-sm text-gray-600">{appt.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{appt.date}</p>
                        <p className="text-sm text-gray-600">{appt.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest health documents.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentRecords.map(record => (
                    <li key={record.id} className="flex items-center justify-between p-3 border-b border-pink-100 last:border-b-0">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-pink-500" />
                        <p className="text-gray-700">{record.type}</p>
                      </div>
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700">{record.date}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboardPage;

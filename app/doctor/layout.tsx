"use client"

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { UserSession } from '@/components/auth/UserSession'
import Link from 'next/link'
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  Pill,
  Home,
  Activity,
  ClipboardList
} from 'lucide-react'

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={['doctor', 'super-admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Doctor Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/"
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* User Session Card */}
                <UserSession />
                
                {/* Navigation Menu */}
                <nav className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/doctor"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Activity className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/doctor/patients"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Users className="h-4 w-4 mr-3" />
                        My Patients
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/doctor/appointments"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Calendar className="h-4 w-4 mr-3" />
                        Appointments
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/doctor/prescriptions"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Pill className="h-4 w-4 mr-3" />
                        Prescriptions
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/doctor/medical-records"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        Medical Records
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/doctor/schedule"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <ClipboardList className="h-4 w-4 mr-3" />
                        My Schedule
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

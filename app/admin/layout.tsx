"use client"

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { UserSession } from '@/components/auth/UserSession'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Home,
  Shield,
  Activity
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        {/* <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Admin Dashboard
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
        </header> */}

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div >
{/*            
            <div className="lg:col-span-1">
              <div className="space-y-6">
                
                <UserSession />
                
               
                <nav className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/admin"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Activity className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin/users"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Users className="h-4 w-4 mr-3" />
                        User Management
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin/appointments"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Calendar className="h-4 w-4 mr-3" />
                        Appointments
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin/reports"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        Reports
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin/settings"
                        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div> */}

            
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

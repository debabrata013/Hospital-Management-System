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
       

        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            

            {/* Main Content */}
            <div className="lg:col-span-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

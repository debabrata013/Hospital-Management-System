"use client"

import UserManagement from '@/components/admin/UserManagement'

export default function AdminsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Admins</h1>
        <p className="text-gray-600 mt-1">Add admins, manage permissions, and send notifications</p>
      </div>
      <UserManagement />
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Calendar, CreditCard, User, Settings, Heart } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    id: "medical-records",
    label: "Medical Records",
    icon: FileText,
    category: "health",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
    category: "health",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    category: "health",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    category: "account",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    category: "account",
  },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">HealthCare Portal</h2>
            <p className="text-sm text-gray-500">Patient Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dashboard</h3>
          {navigationItems
            .filter((item) => item.category === "main")
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  activeSection === item.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Health Management</h3>
          {navigationItems
            .filter((item) => item.category === "health")
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  activeSection === item.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</h3>
          {navigationItems
            .filter((item) => item.category === "account")
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  activeSection === item.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </div>
      </nav>
    </div>
  )
}

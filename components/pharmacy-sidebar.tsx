"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Heart, LayoutDashboard, Package, FileText, BarChart3, 
  Plus, AlertTriangle, Pill, TrendingUp, Clock
} from 'lucide-react'

const navigationItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/pharmacy", exact: true },
    ]
  },
  {
    title: "Inventory",
    items: [
      { title: "Stock Management", icon: Package, url: "/pharmacy/inventory" },
      { title: "Add Medicine", icon: Plus, url: "/pharmacy/inventory/add" },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Prescriptions", icon: FileText, url: "/pharmacy/prescriptions" },
      { title: "Reports", icon: BarChart3, url: "/pharmacy/reports" },
    ]
  }
]

export function PharmacySidebar() {
  const pathname = usePathname()

  const isActive = (url: string, exact = false) => {
    if (exact) {
      return pathname === url
    }
    return pathname.startsWith(url)
  }

  return (
    <div className="w-64 bg-white border-r border-pink-100 h-full">
      {/* Header */}
      <div className="p-6 border-b border-pink-100">
        <Link href="/pharmacy" className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">आरोग्य अस्पताल</h2>
            <p className="text-sm text-gray-500">Pharmacy Module</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.url, item.exact)
                      ? "bg-pink-100 text-pink-700"
                      : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-pink-100 mt-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Alerts</span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              12
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Low Stock</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              5
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pending</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              8
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

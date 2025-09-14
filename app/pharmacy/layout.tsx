"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Heart, LayoutDashboard, Package, FileText, BarChart3, Plus, Bell, LogOut, User, Building2, Receipt } from 'lucide-react'
import { registerServiceWorker } from "@/lib/sw-register"
import { pharmacyOfflineManager } from "@/lib/pharmacy-offline"

const navigationItems = [
  {
    title: "मुख्य (Main)",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/pharmacy", isActive: true },
    ]
  },
  {
    title: "इन्वेंटरी (Inventory)",
    items: [
      { title: "Stock Management", icon: Package, url: "/pharmacy/inventory" },
      { title: "Add Medicine", icon: Plus, url: "/pharmacy/inventory/add" },
    ]
  },
  {
    title: "संचालन (Operations)",
    items: [
      { title: "Prescriptions", icon: FileText, url: "/pharmacy/prescriptions" },
      { title: "Billing", icon: Receipt, url: "/pharmacy/billing" },
      { title: "Vendors", icon: Building2, url: "/pharmacy/vendors" },
      { title: "Reports", icon: BarChart3, url: "/pharmacy/reports" },
    ]
  }
]

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout, authState } = useAuth()

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    // Initialize offline functionality
    registerServiceWorker()
    pharmacyOfflineManager.init()
    pharmacyOfflineManager.setupAutoSync()
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-gradient-to-br from-pink-50 to-white">
        {/* Sidebar */}
        <Sidebar className="border-pink-100 shrink-0">
          <SidebarHeader className="border-b border-pink-100 p-6">
  <div className="flex items-center space-x-3">
    <Image
      src="/logo.jpg"
      alt="NMSC Logo"
      width={40}
      height={40}
      className="rounded-md"
    />
    <div>
      <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
        NMSC
      </h2>
      <p className="text-sm text-gray-500">Pharmacy</p>
    </div>
  </div>
</SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            {navigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === item.url || (item.url !== "/pharmacy" && pathname.startsWith(item.url))}
                          className="w-full justify-start hover:bg-pink-50 data-[active=true]:bg-pink-100 data-[active=true]:text-pink-700"
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
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Alerts</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Low Stock</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">8</span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3 p-2 bg-pink-50 rounded-lg mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={"/placeholder.svg?height=40&width=40"} />
                <AvatarFallback className="bg-pink-100 text-pink-700">
                  {authState.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {authState.user?.name || 'Pharmacist'}
                </p>
                <p className="text-xs text-gray-500 truncate">Pharmacy Department</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>
        

        {/* Main Content */}
        <SidebarInset className="flex-1 w-full overflow-x-hidden">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 w-full">
            <div className="flex items-center justify-between h-16 px-6 w-full">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-pink-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pharmacy Management</h1>
                  <p className="text-sm text-gray-500">फार्मेसी प्रबंधन प्रणाली</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Back to Home Link */}
<div className="mb-6">
  <Link
    href="/"
    className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Home
  </Link>
</div>
   

                
                {/* Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={"/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback className="bg-pink-100 text-pink-700">P</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Pharmacy Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                 
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

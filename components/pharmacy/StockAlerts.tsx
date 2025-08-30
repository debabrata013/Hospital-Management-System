"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Package, Bell } from 'lucide-react'

interface StockAlert {
  id: string
  medicineName: string
  currentStock: number
  minimumStock: number
  expiryDate?: string
  batchNumber: string
  alertType: 'low_stock' | 'expiring' | 'expired'
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])

  useEffect(() => {
    // Mock stock alerts data
    setAlerts([
      {
        id: '1',
        medicineName: 'Paracetamol 500mg',
        currentStock: 15,
        minimumStock: 50,
        batchNumber: 'BATCH001',
        alertType: 'low_stock'
      },
      {
        id: '2',
        medicineName: 'Insulin Injection',
        currentStock: 8,
        minimumStock: 25,
        expiryDate: '2024-02-15',
        batchNumber: 'BATCH002',
        alertType: 'expiring'
      },
      {
        id: '3',
        medicineName: 'Amoxicillin 250mg',
        currentStock: 0,
        minimumStock: 30,
        batchNumber: 'BATCH003',
        alertType: 'expired'
      }
    ])
  }, [])

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'expiring': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'expired': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="h-4 w-4" />
      case 'expiring': return <Clock className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Stock Alerts
        </CardTitle>
        <CardDescription>Medicines requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.alertType)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.alertType)}
                  <div>
                    <p className="font-semibold">{alert.medicineName}</p>
                    <p className="text-sm opacity-75">Batch: {alert.batchNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{alert.currentStock}/{alert.minimumStock}</p>
                  <p className="text-xs opacity-75">Current/Min</p>
                </div>
              </div>
              {alert.expiryDate && (
                <p className="text-xs mt-2 opacity-75">Expires: {alert.expiryDate}</p>
              )}
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}

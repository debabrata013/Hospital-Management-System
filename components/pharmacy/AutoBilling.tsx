"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, FileText, Printer, CheckCircle } from 'lucide-react'

interface PrescriptionItem {
  id: string
  medicineName: string
  quantity: number
  unitPrice: number
  total: number
}

interface AutoBillProps {
  prescriptionId: string
  patientName: string
  items: PrescriptionItem[]
  onGenerateBill: (billData: any) => void
}

export default function AutoBilling({ prescriptionId, patientName, items, onGenerateBill }: AutoBillProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [billGenerated, setBillGenerated] = useState(false)

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)
  const tax = totalAmount * 0.18 // 18% GST
  const finalAmount = totalAmount + tax

  const handleGenerateBill = async () => {
    setIsGenerating(true)
    
    const billData = {
      prescriptionId,
      patientName,
      items,
      subtotal: totalAmount,
      tax,
      total: finalAmount,
      generatedAt: new Date().toISOString()
    }

    // Simulate API call
    setTimeout(() => {
      onGenerateBill(billData)
      setBillGenerated(true)
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Auto-Billing
        </CardTitle>
        <CardDescription>Automatic invoice generation for prescription</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Patient:</span>
            <span>{patientName}</span>
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.unitPrice}</TableCell>
                    <TableCell>₹{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateBill}
              disabled={isGenerating || billGenerated}
              className="flex-1"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : billGenerated ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bill Generated
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Bill
                </>
              )}
            </Button>
            
            {billGenerated && (
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </div>

          {billGenerated && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✓ Invoice generated successfully. Bill ID: INV-{prescriptionId}-{Date.now()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

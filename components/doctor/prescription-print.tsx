"use client"

import { Button } from "@/components/ui/button"
import { Printer, Download } from 'lucide-react'
import { printPrescription, downloadPrescriptionPDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface PrescriptionPrintProps {
  prescription: {
    prescription_id: string
    patient_name: string
    patient_id: string
    doctor_name: string
    prescription_date: string
    items: Array<{
      medicine_name: string
      dosage: string
      frequency: string
      duration: string
      quantity: number
    }>
    total_amount: number
    notes?: string
  }
}

export function PrescriptionPrint({ prescription }: PrescriptionPrintProps) {
  const handlePrint = () => {
    try {
      printPrescription(prescription)
      toast.success("Prescription sent to printer")
    } catch (error) {
      toast.error("Failed to print prescription")
    }
  }

  const handleDownloadPDF = () => {
    try {
      downloadPrescriptionPDF(prescription)
      toast.success("PDF downloaded successfully")
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  )
}

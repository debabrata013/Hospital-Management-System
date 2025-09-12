import jsPDF from 'jspdf'

interface PrescriptionData {
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

export function generatePrescriptionPDF(data: PrescriptionData): jsPDF {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('NMSC', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text('NMSC', 105, 28, { align: 'center' })
  doc.text('Medical Prescription', 105, 35, { align: 'center' })
  
  // Line separator
  doc.line(20, 40, 190, 40)
  
  // Prescription details
  doc.setFontSize(10)
  doc.text(`Prescription ID: ${data.prescription_id}`, 20, 50)
  doc.text(`Date: ${new Date(data.prescription_date).toLocaleDateString()}`, 140, 50)
  
  doc.text(`Patient: ${data.patient_name}`, 20, 60)
  doc.text(`Patient ID: ${data.patient_id}`, 140, 60)
  
  doc.text(`Doctor: Dr. ${data.doctor_name}`, 20, 70)
  
  // Medicines header
  doc.setFontSize(12)
  doc.text('Prescribed Medicines:', 20, 85)
  
  // Medicines table
  doc.setFontSize(9)
  let yPos = 95
  
  data.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.medicine_name}`, 25, yPos)
    doc.text(`Dosage: ${item.dosage}`, 30, yPos + 7)
    doc.text(`Frequency: ${item.frequency}`, 30, yPos + 14)
    doc.text(`Duration: ${item.duration}`, 30, yPos + 21)
    doc.text(`Quantity: ${item.quantity}`, 30, yPos + 28)
    yPos += 40
  })
  
  // Notes
  if (data.notes) {
    doc.text('Notes:', 20, yPos + 10)
    doc.text(data.notes, 20, yPos + 20)
  }
  
  // Footer
  doc.text('Doctor Signature: ________________', 20, 250)
  doc.text(`Total Amount: ₹${data.total_amount}`, 140, 250)
  
  return doc
}

export function printPrescription(data: PrescriptionData) {
  const doc = generatePrescriptionPDF(data)
  doc.autoPrint()
  window.open(doc.output('bloburl'), '_blank')
}

export function downloadPrescriptionPDF(data: PrescriptionData) {
  const doc = generatePrescriptionPDF(data)
  doc.save(`prescription_${data.prescription_id}.pdf`)
}


import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection'; // Assuming you have a database connection utility

// Define the MedicineDelivery interface for type safety
interface MedicineDelivery {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  medicine: string;
  dosage: string;
  route: 'Oral' | 'IV' | 'Injection';
  frequency: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'pending' | 'delivered' | 'missed' | 'delayed';
  prescribedBy: string;
  notes: string;
  priority: 'high' | 'normal' | 'low';
  deliveredAt?: string;
  deliveredBy?: string;
}

export async function GET() {
  try {
    const query = `
        SELECT 
            md.id,
            p.id as patientId,
            p.name as patientName,
            r.room_number as roomNumber,
            m.name as medicine,
            md.dosage,
            md.route,
            md.frequency,
            md.scheduled_time as scheduledTime,
            md.scheduled_date as scheduledDate,
            md.status,
            prescriber.name as prescribedBy,
            md.notes,
            md.priority,
            md.delivered_at as deliveredAt,
            deliverer.name as deliveredBy
        FROM medicine_deliveries md
        JOIN patients p ON md.patient_id = p.id
        JOIN room_assignments ra ON p.id = ra.patient_id
        JOIN rooms r ON ra.room_id = r.id
        JOIN medicines m ON md.medicine_id = m.id
        JOIN users prescriber ON md.prescribed_by = prescriber.id
        LEFT JOIN users deliverer ON md.delivered_by = deliverer.id
        WHERE ra.status = 'Active'
        ORDER BY md.scheduled_date DESC, md.scheduled_time DESC;
    `;

    const medicines: MedicineDelivery[] = await executeQuery(query);

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching medicine deliveries:', error);
    // @ts-ignore
    console.log("Query:\n", error.sql)
    // @ts-ignore
    console.log("Params:", error.sqlMessage)


    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

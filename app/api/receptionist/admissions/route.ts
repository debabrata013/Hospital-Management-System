import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+05:30',
  connectTimeout: 20000
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Generate unique admission ID
function generateAdmissionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `ADM${timestamp}${random}`.toUpperCase();
}

// GET - Fetch admissions with filters
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const roomType = searchParams.get('roomType');
    const doctorId = searchParams.get('doctorId');
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    
    connection = await getConnection();
    
    if (action === 'rooms') {
      // Get available rooms from admin rooms table
      const [rooms] = await connection.execute(`
        SELECT 
          id, room_number, room_name, room_type, floor, capacity, 
          current_occupancy, status, daily_rate, description
        FROM rooms
        WHERE status IN ('Available', 'Cleaning Required') 
          OR (status = 'Occupied' AND current_occupancy < capacity)
        ORDER BY floor, room_number
      `);
      
      return NextResponse.json({ rooms });
    }
    
    // Build dynamic query for admissions
    let query = `
      SELECT 
        a.id, a.admission_id, a.patient_id, a.room_id, a.manual_room_number, a.manual_bed_number, a.doctor_id,
        a.admission_date, a.discharge_date, a.admission_type, a.status,
        a.diagnosis, a.chief_complaint, a.admission_notes, a.estimated_stay_days, a.total_charges,
        a.emergency_contact_name, a.emergency_contact_phone, a.emergency_contact_relation, a.insurance_details,
        p.name as patient_name, p.age, p.gender, p.contact_number as patient_phone,
        COALESCE(r.room_number, a.manual_room_number) as room_number,
        COALESCE(r.room_type, a.room_type) as room_type,
        COALESCE(ba.bed_number, a.bed_number, a.manual_bed_number) as bed_number,
        d.name as doctor_name,
        ab.name as admitted_by_name,
        a.created_at
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users ab ON a.admitted_by = ab.id
      LEFT JOIN bed_assignments ba ON ba.admission_id = a.id AND ba.released_date IS NULL
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    
    if (doctorId && doctorId !== 'all') {
      query += ` AND a.doctor_id = ?`;
      params.push(doctorId);
    }
    
    if (roomType && roomType !== 'all') {
      query += ` AND COALESCE(r.room_type, a.room_type) = ?`;
      params.push(roomType);
    }
    
    if (search) {
      query += ` AND (p.name LIKE ? OR a.admission_id LIKE ? OR p.contact_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY a.admission_date DESC LIMIT 50`;
    
    const [admissions] = await connection.execute(query, params);
    
    return NextResponse.json({ admissions });

  } catch (error) {
    console.error('Get admissions error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admissions' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new admission
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const {
      patientId, roomId, roomNumber, bedNumber, doctorId, admissionType, diagnosis, chiefComplaint,
      admissionNotes, estimatedStayDays, emergencyContactName, emergencyContactPhone,
      emergencyContactRelation, insuranceDetails, admittedBy, roomType
    } = await request.json();

    // Require patientId, doctorId and either roomId or roomNumber
    if (!patientId || !doctorId || (!roomId && !roomNumber)) {
      return NextResponse.json(
        { message: 'Patient ID, Doctor ID, and Room (ID or Number) are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // Prevent duplicate active admissions for the same patient
    const [existingActive] = await connection.execute(
      `SELECT admission_id FROM admissions WHERE patient_id = ? AND status = 'active' LIMIT 1`,
      [patientId]
    ) as [any[], any];
    if ((existingActive as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { message: `Patient already admitted (Admission ID: ${(existingActive as any[])[0].admission_id}). Discharge before creating a new admission.` },
        { status: 409 }
      );
    }
    
    // Resolve effective room ID from provided roomId or roomNumber
    let effectiveRoomId: number | null = null;
    let manualRoomNumber: string | null = null;
    let manualBedNumber: string | null = null;
    if (roomId) {
      effectiveRoomId = parseInt(roomId, 10);
      if (Number.isNaN(effectiveRoomId)) effectiveRoomId = null;
    }
    if (!effectiveRoomId && roomNumber) {
      // Manual mode: accept alphanumeric roomNumber and bedNumber
      manualRoomNumber = String(roomNumber);
      manualBedNumber = bedNumber ? String(bedNumber) : null;
    }
    if (!effectiveRoomId && !manualRoomNumber) {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Room is required. Provide a valid roomId or a manual roomNumber.' },
        { status: 400 }
      );
    }

    // If General Ward, bedNumber is mandatory
    const isGeneralWard = String(roomType || '').toLowerCase() === 'general ward'.toLowerCase();
    if (isGeneralWard && !(manualBedNumber && manualBedNumber.trim())) {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Bed number is required for General Ward admissions' },
        { status: 400 }
      );
    }

    // Check if room is available
    if (effectiveRoomId) {
      const [roomCheck] = await connection.execute(
        `SELECT id, status, capacity, current_occupancy FROM rooms WHERE id = ?`,
        [effectiveRoomId]
      ) as [any[], any];
      if (!Array.isArray(roomCheck) || roomCheck.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'Room not found' },
          { status: 400 }
        );
      }
      const room = (roomCheck as any[])[0];
      if (room.status === 'Maintenance' || room.current_occupancy >= room.capacity) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'Room is not available' },
          { status: 400 }
        );
      }
    }
    
    // Prevent double booking of same bed in General Ward
    if (isGeneralWard) {
      if (effectiveRoomId) {
        const [occupied] = await connection.execute(
          `SELECT 1 FROM bed_assignments 
           WHERE room_id = ? AND bed_number = ? AND released_date IS NULL 
           LIMIT 1`,
          [effectiveRoomId, manualBedNumber]
        ) as [any[], any];
        if ((occupied as any[]).length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { message: 'Selected bed is already occupied in this ward' },
            { status: 409 }
          );
        }
      } else if (manualRoomNumber) {
        const [occupiedManual] = await connection.execute(
          `SELECT 1 FROM admissions 
           WHERE status = 'active' AND manual_room_number = ? AND manual_bed_number = ?
           LIMIT 1`,
          [manualRoomNumber, manualBedNumber]
        ) as [any[], any];
        if ((occupiedManual as any[]).length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { message: 'Selected bed is already occupied in this ward' },
            { status: 409 }
          );
        }
      }
    }

    const admissionId = generateAdmissionId();
    const admissionDate = new Date();
    
    // Insert admission
    const [admissionResult] = await connection.execute(
      `INSERT INTO admissions (
        admission_id, patient_id, room_id, room_type, manual_room_number, manual_bed_number, doctor_id, admission_date,
        admission_type, status, diagnosis, chief_complaint, admission_notes,
        estimated_stay_days, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relation, insurance_details, admitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admissionId, patientId, effectiveRoomId, roomType || null, manualRoomNumber, manualBedNumber, doctorId, admissionDate,
        admissionType || 'planned',
        diagnosis || null, chiefComplaint || null,
        admissionNotes || null, estimatedStayDays || null, emergencyContactName || null,
        emergencyContactPhone || null, emergencyContactRelation || null,
        insuranceDetails ? JSON.stringify(insuranceDetails) : null, admittedBy || 1
      ]
    );
    
    const admissionDbId = (admissionResult as any).insertId;
    
    // Update room status and occupancy
    if (effectiveRoomId) {
      const [roomCheck2] = await connection.execute(
        `SELECT current_occupancy, capacity FROM rooms WHERE id = ?`,
        [effectiveRoomId]
      ) as [any[], any];
      if ((roomCheck2 as any[]).length > 0) {
        const current = (roomCheck2 as any[])[0];
        const newOccupancy = current.current_occupancy + 1;
        const newStatus = newOccupancy >= current.capacity ? 'Occupied' : 'Available';
        await connection.execute(
          `UPDATE rooms SET status = ?, current_occupancy = ?, updated_at = NOW() WHERE id = ?`,
          [newStatus, newOccupancy, effectiveRoomId]
        );
      }
    }
    
    // Create bed assignment record (only when we have a room_id)
    if (effectiveRoomId) {
      await connection.execute(
        `INSERT INTO bed_assignments (
          admission_id, room_id, bed_number, assigned_date, assigned_by
        ) VALUES (?, ?, ?, ?, ?)`,
        [admissionDbId, effectiveRoomId, manualBedNumber, admissionDate, admittedBy || 1]
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({
      message: 'Patient admitted successfully',
      admissionId,
      admissionDbId
    }, { status: 201 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create admission error:', error);
    return NextResponse.json(
      { message: 'Failed to create admission' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update admission (discharge, transfer, etc.)
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const {
      admissionId, action, dischargeNotes, dischargeSummary, dischargeInstructions,
      newRoomId, transferReason, dischargedBy
    } = await request.json();

    if (!admissionId || !action) {
      return NextResponse.json(
        { message: 'Admission ID and action are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();
    
  if (action === 'discharge') {
      const dischargeDate = new Date();
      
      // Get admission details for billing
      const [admissionDetails] = await connection.execute(
        `SELECT a.*, r.room_type, r.daily_rate, p.name as patient_name
         FROM admissions a
         JOIN rooms r ON a.room_id = r.id
         JOIN patients p ON a.patient_id = p.id
         WHERE a.admission_id = ?`,
        [admissionId]
      ) as [any[], any];
      
      if ((admissionDetails as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'Admission not found' },
          { status: 404 }
        );
      }
      
      const admission = (admissionDetails as any[])[0];
      
      // Calculate stay duration and bill amount
      const admissionDate = new Date(admission.admission_date);
      const stayMs = dischargeDate.getTime() - admissionDate.getTime();
      const stayDays = Math.ceil(stayMs / (1000 * 60 * 60 * 24));
  const hasRoomRate = admission.daily_rate != null && !Number.isNaN(Number(admission.daily_rate));
  const roomCharges = hasRoomRate ? stayDays * Number(admission.daily_rate) : 0;
  const consultationFee = 500; // Base consultation fee
  const totalAmount = roomCharges + consultationFee;
      
      // Generate bill ID
      const billId = `BILL${Date.now()}`;
      
      // Create bill record
      await connection.execute(
        `INSERT INTO bills (
          bill_id, patient_id, total_amount, final_amount, payment_status, 
          bill_type, created_by, created_at
        ) VALUES (?, ?, ?, ?, 'pending', 'admission', ?, NOW())`,
        [billId, admission.patient_id, totalAmount, totalAmount, dischargedBy || 1]
      );
      
  const [billResult] = await connection.execute('SELECT LAST_INSERT_ID() as bill_db_id') as [any[], any];
  const billDbId = (billResult as any[])[0].bill_db_id;
      
      // Add bill items
      if (hasRoomRate) {
        await connection.execute(
          `INSERT INTO bill_items (
            bill_id, item_name, quantity, unit_price, total_price, item_type
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [billDbId, `${admission.room_type} Room (${stayDays} days)`, stayDays, admission.daily_rate, roomCharges, 'room']
        );
      }
      
      await connection.execute(
        `INSERT INTO bill_items (
          bill_id, item_name, quantity, unit_price, total_price, item_type
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [billDbId, 'Consultation Fee', 1, consultationFee, consultationFee, 'consultation']
      );
      
      // Update admission status and total charges
      await connection.execute(
        `UPDATE admissions 
         SET status = 'discharged', discharge_date = ?, discharge_notes = ?,
             discharge_summary = ?, discharge_instructions = ?, discharged_by = ?,
             total_charges = ?, updated_at = NOW()
         WHERE admission_id = ?`,
        [dischargeDate, dischargeNotes || null, dischargeSummary || null,
         dischargeInstructions || null, dischargedBy || 1, totalAmount, admissionId]
      );
      
      // Get room ID and update room status
      const [roomInfo] = await connection.execute(
        `SELECT current_occupancy, capacity FROM rooms WHERE id = ?`,
        [admission.room_id]
      ) as [any[], any];
      
      if ((roomInfo as any[]).length > 0) {
        const newOccupancy = Math.max(0, (roomInfo as any[])[0].current_occupancy - 1);
        const newStatus = newOccupancy === 0 ? 'Cleaning Required' : 'Available';
        
        await connection.execute(
          `UPDATE rooms SET status = ?, current_occupancy = ?, updated_at = NOW() WHERE id = ?`,
          [newStatus, newOccupancy, admission.room_id]
        );
      }
      
      // Update bed assignment
      await connection.execute(
        `UPDATE bed_assignments 
         SET released_date = ?, reason = 'discharge'
         WHERE admission_id = ? AND released_date IS NULL`,
        [dischargeDate, admission.id]
      );
      
      await connection.commit();
      
      return NextResponse.json({
        message: 'Patient discharged successfully',
        billId: billId,
        totalAmount: totalAmount,
        stayDays: stayDays
      });
      
  } else if (action === 'transfer') {
      // Resolve new room by ID or Number
      let effectiveNewRoomId: number | null = null;
      if (newRoomId) {
        effectiveNewRoomId = parseInt(newRoomId, 10);
        if (Number.isNaN(effectiveNewRoomId)) effectiveNewRoomId = null;
      }
      const body: any = await request.json().catch(() => ({}));
      const newRoomNumber = body?.newRoomNumber as string | undefined;
      if (!effectiveNewRoomId && newRoomNumber) {
        const [lookup] = await connection.execute(
          `SELECT id FROM rooms WHERE room_number = ? LIMIT 1`,
          [newRoomNumber]
        ) as [any[], any];
        if ((lookup as any[]).length > 0) {
          effectiveNewRoomId = (lookup as any[])[0].id;
        }
      }
      if (!effectiveNewRoomId) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'New room (ID or Number) is required' },
          { status: 400 }
        );
      }
      // Check if new room is available
      const [roomCheck] = await connection.execute(
        `SELECT id, status, capacity, current_occupancy, room_type FROM rooms WHERE id = ?`,
        [effectiveNewRoomId]
      ) as [any[], any];
      
      if ((roomCheck as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'New room not found' },
          { status: 400 }
        );
      }
      
      const newRoom = (roomCheck as any[])[0];
      if (newRoom.status === 'Maintenance' || newRoom.current_occupancy >= newRoom.capacity) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'New room is not available' },
          { status: 400 }
        );
      }

      // For General Ward, require a bed number and ensure it's free
      const bodyFull: any = await request.json().catch(() => ({}));
      const newBedNumber: string | null = bodyFull?.newBedNumber ? String(bodyFull.newBedNumber) : null;
      const isNewGW = String(newRoom.room_type || '').toLowerCase() === 'general ward';
      if (isNewGW) {
        if (!(newBedNumber && newBedNumber.trim())) {
          await connection.rollback();
          return NextResponse.json(
            { message: 'Bed number is required when transferring to General Ward' },
            { status: 400 }
          );
        }
        const [occupied] = await connection.execute(
          `SELECT 1 FROM bed_assignments WHERE room_id = ? AND bed_number = ? AND released_date IS NULL LIMIT 1`,
          [effectiveNewRoomId, newBedNumber]
        ) as [any[], any];
        if ((occupied as any[]).length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { message: 'Selected bed is already occupied in the target ward' },
            { status: 409 }
          );
        }
      }
      
      // Get current admission details
      const [currentAdmission] = await connection.execute(
        `SELECT id, room_id FROM admissions WHERE admission_id = ?`,
        [admissionId]
      ) as [any[], any];
      
      if ((currentAdmission as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'Admission not found' },
          { status: 404 }
        );
      }
      
      const oldRoomId = (currentAdmission as any[])[0].room_id;
      const admissionDbId = (currentAdmission as any[])[0].id;
      
      // Update admission with new room
      await connection.execute(
        `UPDATE admissions SET room_id = ?, updated_at = NOW() WHERE admission_id = ?`,
        [effectiveNewRoomId, admissionId]
      );
      
      // Get old room info and update occupancy
      const [oldRoomInfo] = await connection.execute(
        `SELECT current_occupancy FROM rooms WHERE id = ?`,
        [oldRoomId]
      ) as [any[], any];
      
      if ((oldRoomInfo as any[]).length > 0) {
        const oldNewOccupancy = Math.max(0, (oldRoomInfo as any[])[0].current_occupancy - 1);
        const oldNewStatus = oldNewOccupancy === 0 ? 'Cleaning Required' : 'Available';
        
        await connection.execute(
          `UPDATE rooms SET status = ?, current_occupancy = ?, updated_at = NOW() WHERE id = ?`,
          [oldNewStatus, oldNewOccupancy, oldRoomId]
        );
      }
      
      // Update new room occupancy
      const newRoomOccupancy = newRoom.current_occupancy + 1;
      const newRoomStatus = newRoomOccupancy >= newRoom.capacity ? 'Occupied' : 'Available';
      
      await connection.execute(
        `UPDATE rooms SET status = ?, current_occupancy = ?, updated_at = NOW() WHERE id = ?`,
        [newRoomStatus, newRoomOccupancy, effectiveNewRoomId]
      );
      
      // Close old bed assignment
      await connection.execute(
        `UPDATE bed_assignments 
         SET released_date = NOW(), reason = ?
         WHERE admission_id = ? AND released_date IS NULL`,
        [transferReason || 'transfer', admissionDbId]
      );
      
      // Create new bed assignment
      await connection.execute(
        `INSERT INTO bed_assignments (
          admission_id, room_id, bed_number, assigned_date, assigned_by, reason
        ) VALUES (?, ?, ?, NOW(), ?, ?)`,
        [admissionDbId, effectiveNewRoomId, newBedNumber, dischargedBy || 1, transferReason || 'transfer']
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({
      message: `Admission ${action} completed successfully`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update admission error:', error);
    return NextResponse.json(
      { message: 'Failed to update admission' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

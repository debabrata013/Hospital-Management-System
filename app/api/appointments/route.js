// Appointment Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, dbUtils } from '../../../lib/mysql-connection';
import { verifyToken } from '../../../lib/auth-middleware';

// GET - Fetch appointments with filters
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const appointmentType = searchParams.get('type');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (authResult.user.role === 'doctor') {
      whereConditions.push('a.doctor_id = ?');
      queryParams.push(authResult.user.userId);
    }

    if (date) {
      whereConditions.push('a.appointment_date = ?');
      queryParams.push(date);
    }

    if (doctorId && authResult.user.role !== 'doctor') {
      whereConditions.push('a.doctor_id = ?');
      queryParams.push(doctorId);
    }

    if (patientId) {
      whereConditions.push('a.patient_id = ?');
      queryParams.push(patientId);
    }

    if (status) {
      whereConditions.push('a.status = ?');
      queryParams.push(status);
    }

    if (appointmentType) {
      whereConditions.push('a.appointment_type = ?');
      queryParams.push(appointmentType);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM appointments a 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalAppointments = countResult[0].total;

    // Get appointments with patient and doctor details
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.duration,
        a.appointment_type,
        a.visit_type,
        a.priority,
        a.status,
        a.reason_for_visit,
        a.symptoms,
        a.chief_complaint,
        a.consultation_fee,
        a.room_number,
        a.notes,
        a.created_at,
        p.patient_id,
        p.name as patient_name,
        p.contact_number as patient_contact,
        p.gender as patient_gender,
        p.date_of_birth as patient_dob,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        d.department as doctor_department,
        creator.name as created_by_name,
        q.queue_number,
        q.estimated_time,
        q.status as queue_status
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users creator ON a.created_by = creator.id
      LEFT JOIN appointment_queue q ON a.id = q.appointment_id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT ? OFFSET ?
    `;

    const appointments = await executeQuery(appointmentsQuery, [...queryParams, limit, offset]);

    // Calculate patient age and format data
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      patient_age: appointment.patient_dob ? 
        Math.floor((new Date() - new Date(appointment.patient_dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null,
      appointment_datetime: `${appointment.appointment_date} ${appointment.appointment_time}`
    }));

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalAppointments / limit),
          totalAppointments,
          hasNextPage: page < Math.ceil(totalAppointments / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const appointmentData = await request.json();

    // Validate required fields
    const requiredFields = ['patientId', 'doctorId', 'appointmentDate', 'appointmentTime', 'appointmentType'];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate patient exists
    const patient = await executeQuery(
      'SELECT id FROM patients WHERE id = ? AND is_active = TRUE',
      [appointmentData.patientId]
    );

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Validate doctor exists
    const doctor = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND role = "doctor" AND is_active = TRUE',
      [appointmentData.doctorId]
    );

    if (doctor.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check for conflicting appointments
    const conflictQuery = `
      SELECT id FROM appointments 
      WHERE doctor_id = ? 
      AND appointment_date = ? 
      AND appointment_time = ? 
      AND status NOT IN ('cancelled', 'completed')
    `;

    const conflicts = await executeQuery(conflictQuery, [
      appointmentData.doctorId,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime
    ]);

    if (conflicts.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor is not available at this time slot' },
        { status: 409 }
      );
    }

    // Generate unique appointment ID
    const appointmentId = dbUtils.generateId('APT');

    // Prepare appointment data
    const insertData = {
      appointment_id: appointmentId,
      patient_id: appointmentData.patientId,
      doctor_id: appointmentData.doctorId,
      appointment_date: dbUtils.formatDate(appointmentData.appointmentDate),
      appointment_time: appointmentData.appointmentTime,
      duration: appointmentData.duration || 30,
      appointment_type: appointmentData.appointmentType,
      visit_type: appointmentData.visitType || 'first-visit',
      priority: appointmentData.priority || 'medium',
      reason_for_visit: appointmentData.reasonForVisit || null,
      symptoms: appointmentData.symptoms || null,
      chief_complaint: appointmentData.chiefComplaint || null,
      consultation_fee: appointmentData.consultationFee || 0.00,
      room_number: appointmentData.roomNumber || null,
      notes: appointmentData.notes || null,
      created_by: authResult.user.userId
    };

    // Insert appointment
    const { query, params } = dbUtils.buildInsertQuery('appointments', insertData);
    const result = await executeQuery(query, params);

    // Add to appointment queue if needed
    if (appointmentData.addToQueue) {
      // Get next queue number for the day
      const queueQuery = `
        SELECT COALESCE(MAX(queue_number), 0) + 1 as next_queue_number
        FROM appointment_queue aq
        INNER JOIN appointments a ON aq.appointment_id = a.id
        WHERE a.appointment_date = ? AND a.doctor_id = ?
      `;

      const queueResult = await executeQuery(queueQuery, [
        dbUtils.formatDate(appointmentData.appointmentDate),
        appointmentData.doctorId
      ]);

      const queueNumber = queueResult[0].next_queue_number;

      await executeQuery(
        'INSERT INTO appointment_queue (appointment_id, queue_number, status) VALUES (?, ?, "waiting")',
        [result.insertId, queueNumber]
      );
    }

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'appointments', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        result.insertId.toString(),
        JSON.stringify(insertData)
      ]
    );

    // Create notification for doctor
    await executeQuery(
      `INSERT INTO system_notifications (notification_id, user_id, notification_type, title, message, priority, created_at)
       VALUES (?, ?, 'appointment_reminder', ?, ?, 'medium', CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('NOT'),
        appointmentData.doctorId,
        'New Appointment Scheduled',
        `New appointment scheduled for ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime}`
      ]
    );

    // Fetch the created appointment with details
    const createdAppointment = await executeQuery(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.contact_number as patient_contact,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [result.insertId]);

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: createdAppointment[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');
    
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing appointment
    const existingAppointment = await executeQuery(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authResult.user.role === 'doctor' && 
        existingAppointment[0].doctor_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateFields = {};
    if (updateData.appointmentDate) updateFields.appointment_date = dbUtils.formatDate(updateData.appointmentDate);
    if (updateData.appointmentTime) updateFields.appointment_time = updateData.appointmentTime;
    if (updateData.duration) updateFields.duration = updateData.duration;
    if (updateData.appointmentType) updateFields.appointment_type = updateData.appointmentType;
    if (updateData.visitType) updateFields.visit_type = updateData.visitType;
    if (updateData.priority) updateFields.priority = updateData.priority;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.reasonForVisit !== undefined) updateFields.reason_for_visit = updateData.reasonForVisit;
    if (updateData.symptoms !== undefined) updateFields.symptoms = updateData.symptoms;
    if (updateData.chiefComplaint !== undefined) updateFields.chief_complaint = updateData.chiefComplaint;
    if (updateData.consultationFee !== undefined) updateFields.consultation_fee = updateData.consultationFee;
    if (updateData.roomNumber !== undefined) updateFields.room_number = updateData.roomNumber;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
    if (updateData.cancellationReason !== undefined) updateFields.cancellation_reason = updateData.cancellationReason;

    updateFields.updated_at = new Date();

    // Check for conflicts if date/time is being changed
    if (updateData.appointmentDate || updateData.appointmentTime) {
      const checkDate = updateData.appointmentDate || existingAppointment[0].appointment_date;
      const checkTime = updateData.appointmentTime || existingAppointment[0].appointment_time;
      
      const conflictQuery = `
        SELECT id FROM appointments 
        WHERE doctor_id = ? 
        AND appointment_date = ? 
        AND appointment_time = ? 
        AND id != ?
        AND status NOT IN ('cancelled', 'completed')
      `;

      const conflicts = await executeQuery(conflictQuery, [
        existingAppointment[0].doctor_id,
        checkDate,
        checkTime,
        appointmentId
      ]);

      if (conflicts.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Doctor is not available at this time slot' },
          { status: 409 }
        );
      }
    }

    // Update appointment
    const { query, params } = dbUtils.buildUpdateQuery('appointments', updateFields, { id: appointmentId });
    await executeQuery(query, params);

    // Log the update
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
       VALUES (?, ?, 'UPDATE', 'appointments', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        appointmentId,
        JSON.stringify(existingAppointment[0]),
        JSON.stringify(updateFields)
      ]
    );

    // Fetch updated appointment
    const updatedAppointment = await executeQuery(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.contact_number as patient_contact,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [appointmentId]);

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: updatedAppointment[0]
      }
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelled by user';
    
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get existing appointment
    const existingAppointment = await executeQuery(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authResult.user.role === 'doctor' && 
        existingAppointment[0].doctor_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to cancel this appointment' },
        { status: 403 }
      );
    }

    // Update appointment status to cancelled
    await executeQuery(
      'UPDATE appointments SET status = "cancelled", cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [reason, appointmentId]
    );

    // Update queue status if exists
    await executeQuery(
      'UPDATE appointment_queue SET status = "cancelled" WHERE appointment_id = ?',
      [appointmentId]
    );

    // Log the cancellation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, additional_info, created_at) 
       VALUES (?, ?, 'UPDATE', 'appointments', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        appointmentId,
        JSON.stringify(existingAppointment[0]),
        JSON.stringify({ action: 'cancelled', reason })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}

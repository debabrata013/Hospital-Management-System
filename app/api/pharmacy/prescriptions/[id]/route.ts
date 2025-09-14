import { isStaticBuild } from '@/lib/api-utils';

// Generate static parameters for build
export function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export const dynamic = 'force-dynamic';

/**
 * Pharmacy Prescription Management API Route
 * 
 * This API handles detailed prescription operations for the pharmacy module.
 * It provides comprehensive prescription data including patient info, medications,
 * dispensing history, and stock availability for pharmacist workflow.
 * 
 * Features:
 * - Detailed prescription retrieval with patient and doctor information
 * - Medication list with stock status and dispensing tracking
 * - Complete dispensing history and audit trail
 * - Real-time stock availability checking
 * - Prescription status management and updates
 * 
 * Database Tables Used:
 * - prescriptions: Main prescription records
 * - prescription_medications: Individual medication items
 * - prescription_dispensing_log: Dispensing audit trail
 * - patients: Patient demographic information
 * - users: Doctor and pharmacist information
 * - medicines: Medicine inventory and stock data
 * 
 * @author Hospital Management System
 * @version 1.0
 * @since 2024-08-26
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection';

/**
 * GET /api/pharmacy/prescriptions/[id] - Retrieve detailed prescription information
 * 
 * This endpoint fetches comprehensive prescription data for pharmacy operations.
 * It combines data from multiple tables to provide a complete view of:
 * - Prescription details and metadata
 * - Patient demographics and contact information
 * - Doctor information and specialization
 * - Individual medication items with dosage and instructions
 * - Current stock levels and availability status
 * - Dispensing history and audit trail
 * 
 * @param request - NextRequest object containing the HTTP request
 * @param params - Route parameters containing prescription ID
 * @returns JSON response with prescription data or error message
 */
type DispenseStatus = 'fully_dispensed' | 'partially_dispensed' | 'pending';

interface PrescriptionMedication {
  is_dispensed: boolean;
  dispensed_quantity: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle static builds
  if (isStaticBuild()) {
    const dispensingStatus = 'partially_dispensed';
    return NextResponse.json({
      success: true,
      data: {
        prescription: {
          id: 1,
          prescription_id: 'RX-001',
          patient_id: 1,
          doctor_id: 1,
          prescription_date: new Date().toISOString(),
          total_amount: 1500,
          status: 'active',
          notes: 'Sample prescription',
          follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          patient_name: 'Sample Patient',
          patient_code: 'PAT-001',
          patient_phone: '9876543210',
          patient_email: 'patient@example.com',
          age: 35,
          gender: 'Male',
          patient_address: '123 Sample Street',
          doctor_name: 'Dr. Sample',
          specialization: 'General Medicine',
          doctor_phone: '9876543211',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dispensing_status: dispensingStatus,
          total_medications: 3,
          dispensed_medications: 1,
          pending_medications: 1,
          partially_dispensed: 1
        },
        medications: [
          {
            id: 1,
            medicine_id: 1,
            medicine_name: 'Sample Medicine 1',
            generic_name: 'Generic 1',
            strength: '500mg',
            dosage_form: 'Tablet',
            quantity: 30,
            dosage: '1',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take after meals',
            unit_price: 10,
            total_price: 300,
            is_dispensed: true,
            dispensed_quantity: 30,
            stock_status: 'available'
          }
        ],
        history: [
          {
            id: 1,
            log_id: 'DISP-001',
            action: 'dispense',
            quantity: 30,
            batch_number: 'BATCH-001',
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            unit_price: 10,
            total_amount: 300,
            pharmacist_notes: 'First dispense',
            created_at: new Date().toISOString(),
            dispensed_by_name: 'Sample Pharmacist',
            medicine_name: 'Sample Medicine 1'
          }
        ],
        summary: {
          total_medications: 3,
          dispensed_medications: 1,
          pending_medications: 1,
          partially_dispensed: 1,
          total_amount: 1500,
          dispensing_status: dispensingStatus
        }
      }
    });
  }

  try {
    // Extract prescription ID from route parameters
    // This can be either the database ID or the human-readable prescription_id
    const prescriptionId = params.id;

    // Main query to fetch prescription details with related patient and doctor information
    // Uses JOINs to combine data from prescriptions, patients, and users tables
    // Calculates patient age dynamically from date_of_birth for accuracy
    const prescriptionQuery = `
      SELECT 
        p.id,
        p.prescription_id,
        p.patient_id,
        p.doctor_id,
        p.prescription_date,
        p.total_amount,
        p.status,
        p.notes,
        p.follow_up_date,
        pt.name as patient_name,
        pt.patient_id as patient_code,
        pt.contact_number as patient_phone,
        pt.email as patient_email,
        YEAR(CURDATE()) - YEAR(pt.date_of_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(pt.date_of_birth, '%m%d')) as age,
        pt.gender,
        pt.address as patient_address,
        d.name as doctor_name,
        d.specialization,
        d.contact_number as doctor_phone,
        p.created_at,
        p.updated_at
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
      WHERE p.id = ? OR p.prescription_id = ?
    `;

    // Execute prescription query with both ID formats for flexibility
    // Allows lookup by database ID (numeric) or prescription_id (alphanumeric)
    const prescriptionResult = await executeQuery(prescriptionQuery, [prescriptionId, prescriptionId]);

    // Validate prescription exists before proceeding
    if (prescriptionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Extract prescription data from query result
    const prescription = prescriptionResult[0];

    // Fetch all medications associated with this prescription
    // Includes stock availability, dispensing status, and pricing information
    // Uses CASE statement to determine stock status based on available quantity
    const medicationsQuery = `
      SELECT 
        pm.id,
        pm.medicine_id,
        pm.medicine_name,
        pm.generic_name,
        pm.strength,
        pm.dosage_form,
        pm.quantity,
        pm.dosage,
        pm.frequency,
        pm.duration,
        pm.instructions,
        pm.unit_price,
        pm.total_price,
        pm.is_dispensed,
        pm.dispensed_quantity,
        pm.dispensed_by,
        pm.dispensed_at,
        pm.batch_number,
        pm.expiry_date,
        pm.notes,
        m.current_stock,
        m.minimum_stock,
        CASE 
          WHEN m.current_stock >= pm.quantity THEN 'available'
          WHEN m.current_stock > 0 THEN 'partial'
          ELSE 'out_of_stock'
        END as stock_status,
        u.name as dispensed_by_name
      FROM prescription_medications pm
      JOIN medicines m ON pm.medicine_id = m.id
      LEFT JOIN users u ON pm.dispensed_by = u.id
      WHERE pm.prescription_id = ?
      ORDER BY pm.id
    `;

    // Execute medications query to get all prescription items
    const medications = await executeQuery(medicationsQuery, [prescription.id]);

    // Retrieve complete dispensing history for audit trail and tracking
    // Shows all dispensing actions, quantities, and pharmacist notes
    // Ordered by most recent first for better user experience
    const historyQuery = `
      SELECT 
        pdl.id,
        pdl.log_id,
        pdl.action,
        pdl.quantity,
        pdl.batch_number,
        pdl.expiry_date,
        pdl.unit_price,
        pdl.total_amount,
        pdl.pharmacist_notes,
        pdl.created_at,
        u.name as dispensed_by_name,
        pm.medicine_name
      FROM prescription_dispensing_log pdl
      JOIN users u ON pdl.dispensed_by = u.id
      JOIN prescription_medications pm ON pdl.prescription_medication_id = pm.id
      WHERE pdl.prescription_id = ?
      ORDER BY pdl.created_at DESC
    `;

    // Execute dispensing history query
    const history = await executeQuery(historyQuery, [prescription.id]);

    // Calculate prescription summary statistics for dashboard display
    // These metrics help pharmacists quickly understand prescription status
    const totalMedications = medications.length;
    const dispensedMedications = medications.filter((m: PrescriptionMedication) => m.is_dispensed).length;
    const partiallyDispensed = medications.filter((m: PrescriptionMedication) => m.dispensed_quantity > 0 && !m.is_dispensed).length;
    const pendingMedications = medications.filter((m: PrescriptionMedication) => m.dispensed_quantity === 0).length;

    // Determine overall dispensing status based on medication states
    // This provides a quick status indicator for the prescription
    const dispensingStatus = 
      dispensedMedications === totalMedications ? 'fully_dispensed' :
      dispensedMedications > 0 || partiallyDispensed > 0 ? 'partially_dispensed' : 'pending';

    // Return comprehensive prescription data structure
    // Organized into logical sections for frontend consumption
    return NextResponse.json({
      success: true,
      data: {
        // Enhanced prescription object with calculated status and metrics
        prescription: {
          ...prescription,
          dispensing_status: dispensingStatus,
          total_medications: totalMedications,
          dispensed_medications: dispensedMedications,
          pending_medications: pendingMedications,
          partially_dispensed: partiallyDispensed
        },
        // Complete medication list with stock and dispensing information
        medications,
        // Chronological dispensing history for audit purposes
        history,
        // Summary statistics for quick reference and dashboard display
        summary: {
          total_medications: totalMedications,
          dispensed_medications: dispensedMedications,
          pending_medications: pendingMedications,
          partially_dispensed: partiallyDispensed,
          total_amount: prescription.total_amount,
          dispensing_status: dispensingStatus
        }
      }
    });

  } catch (error) {
    // Log error for debugging while protecting sensitive information
    console.error('Error fetching prescription details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription details' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pharmacy/prescriptions/[id] - Update prescription status and notes
 * 
 * This endpoint allows pharmacists to update prescription status and add notes.
 * Common status updates include:
 * - 'pending' -> 'in_progress' when dispensing begins
 * - 'in_progress' -> 'completed' when fully dispensed
 * - 'completed' -> 'collected' when patient collects medication
 * 
 * @param request - NextRequest containing status and notes in JSON body
 * @param params - Route parameters containing prescription ID
 * @returns JSON response confirming update or error message
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract prescription ID from route parameters
    const prescriptionId = params.id;
    
    // Parse request body to get status and notes updates
    const { status, notes } = await request.json();

    // Update prescription with new status and notes
    // Uses timestamp for audit trail tracking
    // Supports both database ID and prescription_id for flexibility
    const updateQuery = `
      UPDATE prescriptions 
      SET status = ?, notes = ?, updated_at = NOW()
      WHERE id = ? OR prescription_id = ?
    `;

    // Execute update query with provided parameters
    await executeQuery(updateQuery, [status, notes, prescriptionId, prescriptionId]);

    // Return success confirmation
    return NextResponse.json({
      success: true,
      message: 'Prescription updated successfully'
    });

  } catch (error) {
    // Log error for debugging and return user-friendly error message
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

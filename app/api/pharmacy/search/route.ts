// Pharmacy API - Search Functionality
// GET /api/pharmacy/search - Search medicines, prescriptions, and patients

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // 'medicines', 'prescriptions', 'patients', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      }, { status: 400 });
    }
    
    const results: any = {};
    
    // Search medicines
    if (type === 'medicines' || type === 'all') {
      results.medicines = await searchMedicines(query, limit);
    }
    
    // Search prescriptions
    if (type === 'prescriptions' || type === 'all') {
      results.prescriptions = await searchPrescriptions(query, limit);
    }
    
    // Search patients
    if (type === 'patients' || type === 'all') {
      results.patients = await searchPatients(query, limit);
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      query: query,
      type: type
    });
    
  } catch (error) {
    console.error('Error in pharmacy search:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 });
  }
}

// Search medicines
async function searchMedicines(query: string, limit: number) {
  const searchQuery = `
    SELECT 
      id,
      medicine_id,
      name,
      generic_name,
      brand_name,
      category,
      manufacturer,
      strength,
      dosage_form,
      unit_price,
      mrp,
      current_stock,
      minimum_stock,
      expiry_date,
      prescription_required,
      CASE 
        WHEN current_stock <= minimum_stock THEN 'low'
        WHEN current_stock <= (minimum_stock * 1.5) THEN 'medium'
        ELSE 'good'
      END as stock_status,
      CASE 
        WHEN expiry_date <= CURDATE() THEN 'expired'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
        ELSE 'good'
      END as expiry_status,
      -- Relevance scoring
      CASE 
        WHEN name LIKE ? THEN 10
        WHEN generic_name LIKE ? THEN 9
        WHEN brand_name LIKE ? THEN 8
        WHEN name LIKE ? THEN 7
        WHEN generic_name LIKE ? THEN 6
        WHEN brand_name LIKE ? THEN 5
        WHEN composition LIKE ? THEN 4
        WHEN category LIKE ? THEN 3
        WHEN manufacturer LIKE ? THEN 2
        ELSE 1
      END as relevance_score
    FROM medicines
    WHERE is_active = 1
      AND (
        name LIKE ? OR
        generic_name LIKE ? OR
        brand_name LIKE ? OR
        composition LIKE ? OR
        category LIKE ? OR
        manufacturer LIKE ? OR
        medicine_id LIKE ?
      )
    ORDER BY relevance_score DESC, name ASC
    LIMIT ?
  `;
  
  const searchTerm = `%${query}%`;
  const exactTerm = query;
  
  const params = [
    exactTerm, exactTerm, exactTerm,  // Exact matches (highest priority)
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,  // Relevance scoring
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,  // WHERE clause
    limit
  ];
  
  return await executeQuery(searchQuery, params);
}

// Search prescriptions
async function searchPrescriptions(query: string, limit: number) {
  const searchQuery = `
    SELECT 
      p.id,
      p.prescription_id,
      p.prescription_date,
      p.total_amount,
      p.status,
      pt.name as patient_name,
      pt.patient_id as patient_code,
      pt.contact_number as patient_phone,
      d.name as doctor_name,
      d.specialization,
      COUNT(pm.id) as medication_count,
      SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) as dispensed_count,
      CASE 
        WHEN COUNT(pm.id) = SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) THEN 'fully_dispensed'
        WHEN SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) > 0 THEN 'partially_dispensed'
        ELSE 'pending'
      END as dispensing_status,
      -- Relevance scoring
      CASE 
        WHEN p.prescription_id LIKE ? THEN 10
        WHEN pt.patient_id LIKE ? THEN 9
        WHEN pt.name LIKE ? THEN 8
        WHEN pt.contact_number LIKE ? THEN 7
        WHEN d.name LIKE ? THEN 6
        ELSE 1
      END as relevance_score
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN users d ON p.doctor_id = d.id
    LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
    WHERE (
      p.prescription_id LIKE ? OR
      pt.patient_id LIKE ? OR
      pt.name LIKE ? OR
      pt.contact_number LIKE ? OR
      d.name LIKE ?
    )
    GROUP BY p.id
    ORDER BY relevance_score DESC, p.prescription_date DESC
    LIMIT ?
  `;
  
  const searchTerm = `%${query}%`;
  
  const params = [
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,  // Relevance scoring
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,  // WHERE clause
    limit
  ];
  
  return await executeQuery(searchQuery, params);
}

// Search patients
async function searchPatients(query: string, limit: number) {
  const searchQuery = `
    SELECT 
      id,
      patient_id,
      name,
      contact_number,
      email,
      date_of_birth,
      gender,
      blood_group,
      address,
      city,
      emergency_contact_name,
      emergency_contact_number,
      registration_date,
      -- Calculate age
      TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
      -- Recent prescription info
      (
        SELECT COUNT(*) 
        FROM prescriptions pr 
        WHERE pr.patient_id = patients.id 
          AND pr.prescription_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ) as recent_prescriptions,
      (
        SELECT MAX(prescription_date) 
        FROM prescriptions pr 
        WHERE pr.patient_id = patients.id
      ) as last_prescription_date,
      -- Relevance scoring
      CASE 
        WHEN patient_id LIKE ? THEN 10
        WHEN name LIKE ? THEN 9
        WHEN contact_number LIKE ? THEN 8
        WHEN email LIKE ? THEN 7
        WHEN name LIKE ? THEN 6
        WHEN address LIKE ? THEN 3
        ELSE 1
      END as relevance_score
    FROM patients
    WHERE is_active = 1
      AND (
        patient_id LIKE ? OR
        name LIKE ? OR
        contact_number LIKE ? OR
        email LIKE ? OR
        address LIKE ? OR
        emergency_contact_number LIKE ?
      )
    ORDER BY relevance_score DESC, name ASC
    LIMIT ?
  `;
  
  const searchTerm = `%${query}%`;
  const exactTerm = query;
  
  const params = [
    exactTerm, searchTerm, exactTerm, searchTerm, searchTerm, searchTerm,  // Relevance scoring
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,  // WHERE clause
    limit
  ];
  
  return await executeQuery(searchQuery, params);
}

// Additional search endpoints for specific use cases
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'medicine_suggestions':
        return await getMedicineSuggestions(params);
      case 'prescription_lookup':
        return await prescriptionLookup(params);
      case 'patient_history':
        return await getPatientHistory(params);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in pharmacy search POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Search operation failed'
    }, { status: 500 });
  }
}

// Get medicine suggestions for prescription
async function getMedicineSuggestions(params: any) {
  const { symptoms, category, doctor_id } = params;
  
  let query = `
    SELECT 
      m.id,
      m.medicine_id,
      m.name,
      m.generic_name,
      m.category,
      m.strength,
      m.dosage_form,
      m.unit_price,
      m.current_stock,
      m.prescription_required,
      -- Prescription frequency (popularity score)
      COUNT(pm.id) as prescription_frequency,
      -- Recent usage by this doctor
      SUM(CASE WHEN p.doctor_id = ? AND p.prescription_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) as doctor_usage
    FROM medicines m
    LEFT JOIN prescription_medications pm ON m.id = pm.medicine_id
    LEFT JOIN prescriptions p ON pm.prescription_id = p.id
    WHERE m.is_active = 1 AND m.current_stock > 0
  `;
  
  const queryParams = [doctor_id || 0];
  
  if (category) {
    query += ' AND m.category = ?';
    queryParams.push(category);
  }
  
  query += `
    GROUP BY m.id
    ORDER BY doctor_usage DESC, prescription_frequency DESC, m.name ASC
    LIMIT 20
  `;
  
  const suggestions = await executeQuery(query, queryParams);
  
  return NextResponse.json({
    success: true,
    data: suggestions
  });
}

// Prescription lookup with detailed information
async function prescriptionLookup(params: any) {
  const { prescription_id, patient_id } = params;
  
  if (!prescription_id && !patient_id) {
    return NextResponse.json({
      success: false,
      error: 'Either prescription_id or patient_id is required'
    }, { status: 400 });
  }
  
  let whereClause = '';
  let queryParams = [];
  
  if (prescription_id) {
    whereClause = 'WHERE (p.id = ? OR p.prescription_id = ?)';
    queryParams = [prescription_id, prescription_id];
  } else {
    whereClause = 'WHERE p.patient_id = ?';
    queryParams = [patient_id];
  }
  
  const query = `
    SELECT 
      p.*,
      pt.name as patient_name,
      pt.patient_id as patient_code,
      pt.contact_number,
      d.name as doctor_name,
      d.specialization,
      COUNT(pm.id) as total_medications,
      SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) as dispensed_medications
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN users d ON p.doctor_id = d.id
    LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.prescription_date DESC
    ${prescription_id ? 'LIMIT 1' : 'LIMIT 10'}
  `;
  
  const prescriptions = await executeQuery(query, queryParams);
  
  return NextResponse.json({
    success: true,
    data: prescriptions
  });
}

// Get patient prescription history
async function getPatientHistory(params: any) {
  const { patient_id, limit = 10 } = params;
  
  if (!patient_id) {
    return NextResponse.json({
      success: false,
      error: 'patient_id is required'
    }, { status: 400 });
  }
  
  // Patient basic info
  const patientQuery = `
    SELECT 
      id, patient_id, name, contact_number, date_of_birth, gender, 
      blood_group, allergies, current_medications,
      TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age
    FROM patients 
    WHERE (id = ? OR patient_id = ?) AND is_active = 1
  `;
  
  const patient = await executeQuery(patientQuery, [patient_id, patient_id]);
  
  if (patient.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'Patient not found'
    }, { status: 404 });
  }
  
  // Prescription history
  const historyQuery = `
    SELECT 
      p.id,
      p.prescription_id,
      p.prescription_date,
      p.total_amount,
      p.status,
      d.name as doctor_name,
      d.specialization,
      COUNT(pm.id) as medication_count,
      GROUP_CONCAT(DISTINCT m.name SEPARATOR ', ') as medicines
    FROM prescriptions p
    JOIN users d ON p.doctor_id = d.id
    LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
    LEFT JOIN medicines m ON pm.medicine_id = m.id
    WHERE p.patient_id = ?
    GROUP BY p.id
    ORDER BY p.prescription_date DESC
    LIMIT ?
  `;
  
  const history = await executeQuery(historyQuery, [patient[0].id, limit]);
  
  // Frequently prescribed medicines
  const frequentMedicinesQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      COUNT(pm.id) as prescription_count,
      MAX(p.prescription_date) as last_prescribed
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE p.patient_id = ?
    GROUP BY m.id
    ORDER BY prescription_count DESC, last_prescribed DESC
    LIMIT 10
  `;
  
  const frequentMedicines = await executeQuery(frequentMedicinesQuery, [patient[0].id]);
  
  return NextResponse.json({
    success: true,
    data: {
      patient: patient[0],
      prescription_history: history,
      frequent_medicines: frequentMedicines
    }
  });
}

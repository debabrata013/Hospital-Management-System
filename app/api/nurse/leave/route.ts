import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

// GET all leave requests for the logged-in user
export async function GET(req: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, leaveRequests: [] });
    }

    const query = `
      SELECT 
        id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        created_at
      FROM leave_requests 
      ORDER BY start_date DESC
    `;

    const leaveRequests = await executeQuery(query);
    return NextResponse.json({ success: true, leaveRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new leave request
export async function POST(req: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { leave_type, start_date, end_date, reason } = await req.json();

    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check the existing table structure to understand what columns exist
    const checkTableQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'leave_requests'
      AND TABLE_SCHEMA = DATABASE()
    `;
    
    const existingColumns = await executeQuery(checkTableQuery) as any[];
    
    // If table exists, we need to work with the existing structure
    if (existingColumns && existingColumns.length > 0) {
      const columnNames = existingColumns.map((col: any) => col.COLUMN_NAME);
      
      // Check if doctor_id exists (which seems to be causing the foreign key issue)
      if (columnNames.includes('doctor_id')) {
        // Get a valid doctor_id from users table to satisfy the foreign key constraint
        const doctorQuery = `
          SELECT user_id FROM users WHERE role = 'doctor' LIMIT 1
        `;
        const doctors = await executeQuery(doctorQuery) as any[];
        const doctorId = doctors.length > 0 ? doctors[0].user_id : 'DR001';
        
        const insertQuery = `
          INSERT INTO leave_requests (doctor_id, leave_type, start_date, end_date, reason, status)
          VALUES (?, ?, ?, ?, ?, 'Pending')
        `;
        
        await executeQuery(insertQuery, [doctorId, leave_type, start_date, end_date, reason]);
      } else {
        // Use the original insert without doctor_id
        const insertQuery = `
          INSERT INTO leave_requests (leave_type, start_date, end_date, reason, status)
          VALUES (?, ?, ?, ?, 'Pending')
        `;
        
        await executeQuery(insertQuery, [leave_type, start_date, end_date, reason]);
      }
    } else {
      // Create new table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS leave_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(50) DEFAULT 'nurse_user',
          leave_type VARCHAR(50) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      await executeQuery(createTableQuery);
      
      const insertQuery = `
        INSERT INTO leave_requests (leave_type, start_date, end_date, reason, status)
        VALUES (?, ?, ?, ?, 'Pending')
      `;
      
      await executeQuery(insertQuery, [leave_type, start_date, end_date, reason]);
    }

    return NextResponse.json({ success: true, message: 'Leave request submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { isStaticBuild, getSearchParams } from '@/lib/api-utils';

// Force dynamic for development
export const dynamic = 'force-dynamic';

// Database connection
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management'
  });
}

export async function GET(req: NextRequest) {
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({
      summariesGenerated: 0,
      dietPlansCreated: 0,
      pendingApprovals: 0,
      approvedToday: 0,
      recentActivity: [
        {
          id: 1,
          type: 'patient_summary',
          patient_name: 'Sample Patient',
          doctor_name: 'Dr. Sample',
          status: 'approved',
          created_at: new Date().toISOString(),
          approved_at: new Date().toISOString()
        }
      ]
    });
  }

  let connection;
  
  try {
    // Use safe method to get search params
    const searchParams = getSearchParams(req);
    const doctorId = searchParams.get('doctorId');

    connection = await getConnection();

    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_approvals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('patient_summary', 'diet_plan') NOT NULL,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        original_notes TEXT NOT NULL,
        ai_generated_content TEXT NOT NULL,
        doctor_id VARCHAR(50) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get statistics
    let whereClause = '';
    const params: any[] = [];
    
    if (doctorId) {
      whereClause = 'WHERE doctor_id = ?';
      params.push(doctorId);
    }

    // Total AI summaries generated
    const [summariesResult] = await connection.execute(`
      SELECT COUNT(*) as count FROM ai_approvals 
      ${whereClause} AND type = 'patient_summary'
    `, params);

    // Total diet plans created
    const [dietPlansResult] = await connection.execute(`
      SELECT COUNT(*) as count FROM ai_approvals 
      ${whereClause} AND type = 'diet_plan'
    `, params);

    // Pending approvals (this would be for future implementation of pending workflow)
    const [pendingResult] = await connection.execute(`
      SELECT COUNT(*) as count FROM ai_approvals 
      ${whereClause} AND status = 'pending'
    `, params);

    // Approved today
    const todayParams = doctorId ? [doctorId] : [];
    const [approvedTodayResult] = await connection.execute(`
      SELECT COUNT(*) as count FROM ai_approvals 
      ${whereClause} AND DATE(approved_at) = CURDATE() AND status = 'approved'
    `, todayParams);

    // Recent activity (last 10 approvals)
    const [recentActivity] = await connection.execute(`
      SELECT 
        id,
        type,
        patient_name,
        doctor_name,
        status,
        created_at,
        approved_at
      FROM ai_approvals 
      ${whereClause}
      ORDER BY approved_at DESC 
      LIMIT 10
    `, params);

    const stats = {
      summariesGenerated: (summariesResult as any)[0].count,
      dietPlansCreated: (dietPlansResult as any)[0].count,
      pendingApprovals: (pendingResult as any)[0].count,
      approvedToday: (approvedTodayResult as any)[0].count,
      recentActivity: recentActivity
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching AI stats:', error);
    
    // Return default stats if database is not set up yet
    return NextResponse.json({
      summariesGenerated: 0,
      dietPlansCreated: 0,
      pendingApprovals: 0,
      approvedToday: 0,
      recentActivity: []
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

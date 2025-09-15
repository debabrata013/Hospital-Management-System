import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { isStaticBuild, getSearchParams } from '@/lib/api-utils';

// Force dynamic for development
export const dynamic = 'force-dynamic';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    // Use safe method to get search params
    const searchParams = getSearchParams(request);
    const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    connection = await mysql.createConnection(dbConfig);
    
    // Get selected date data
    const [dayCollections] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as cash,
        SUM(CASE WHEN payment_method = 'razorpay' THEN final_amount ELSE 0 END) as online,
        SUM(final_amount) as total
      FROM bills 
      WHERE DATE(created_at) = ? 
        AND payment_status = 'paid'
    `, [selectedDate]);
    
    const dayData = dayCollections as any[];
    
    const analytics = {
      cashCollection: parseFloat(dayData[0]?.cash) || 0,
      onlineCollection: parseFloat(dayData[0]?.online) || 0,
      totalCollection: parseFloat(dayData[0]?.total) || 0
    };
    
    return NextResponse.json(analytics);
    
  } catch (error) {
    console.error('Billing analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing analytics' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

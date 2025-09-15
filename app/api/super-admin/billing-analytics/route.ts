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
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({
      todayCashCollection: 1500,
      todayOnlineCollection: 2500,
      todayTotalCollection: 4000,
      todayTransactions: 8,
      paymentMethodBreakdown: [
        { method: 'Cash', amount: 1500, percentage: 37.5 },
        { method: 'Online Payment', amount: 2500, percentage: 62.5 }
      ]
    });
  }

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
        SUM(final_amount) as total,
        COUNT(*) as transactions
      FROM bills 
      WHERE DATE(created_at) = ? 
        AND payment_status = 'paid'
    `, [selectedDate]);
    
    // Get payment method breakdown for selected date
    const [paymentBreakdown] = await connection.execute(`
      SELECT 
        CASE 
          WHEN payment_method = 'cash' THEN 'Cash'
          WHEN payment_method = 'razorpay' THEN 'Online Payment'
          ELSE 'Other'
        END as method,
        SUM(final_amount) as amount
      FROM bills 
      WHERE DATE(created_at) = ? 
        AND payment_status = 'paid'
      GROUP BY 
        CASE 
          WHEN payment_method = 'cash' THEN 'Cash'
          WHEN payment_method = 'razorpay' THEN 'Online Payment'
          ELSE 'Other'
        END
      ORDER BY amount DESC
    `, [selectedDate]);
    
    const dayData = dayCollections as any[];
    const totalAmount = dayData[0]?.total || 0;
    
    // Calculate percentages for payment breakdown
    const paymentMethodBreakdown = (paymentBreakdown as any[]).map(item => ({
      method: item.method,
      amount: parseFloat(item.amount) || 0,
      percentage: totalAmount > 0 ? ((parseFloat(item.amount) / parseFloat(totalAmount)) * 100) : 0
    }));
    
    const analytics = {
      todayCashCollection: parseFloat(dayData[0]?.cash) || 0,
      todayOnlineCollection: parseFloat(dayData[0]?.online) || 0,
      todayTotalCollection: parseFloat(totalAmount) || 0,
      todayTransactions: parseInt(dayData[0]?.transactions) || 0,
      paymentMethodBreakdown
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

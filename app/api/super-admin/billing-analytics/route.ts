import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    connection = await mysql.createConnection(dbConfig);
    
    // Get total collections by payment method
    const [totalCollections] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as total_cash,
        SUM(CASE WHEN payment_method IN ('upi', 'card', 'online') THEN final_amount ELSE 0 END) as total_online,
        SUM(final_amount) as total_collection
      FROM bills 
      WHERE DATE(created_at) BETWEEN ? AND ? 
        AND payment_status = 'paid'
    `, [startDate, endDate]);
    
    // Get daily collections
    const [dailyCollections] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as cash,
        SUM(CASE WHEN payment_method IN ('upi', 'card', 'online') THEN final_amount ELSE 0 END) as online,
        SUM(final_amount) as total
      FROM bills 
      WHERE DATE(created_at) BETWEEN ? AND ? 
        AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `, [startDate, endDate]);
    
    // Get monthly trend (last 3 months)
    const [monthlyTrend] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as cash,
        SUM(CASE WHEN payment_method IN ('upi', 'card', 'online') THEN final_amount ELSE 0 END) as online
      FROM bills 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        AND payment_status = 'paid'
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);
    
    // Get payment method breakdown
    const [paymentBreakdown] = await connection.execute(`
      SELECT 
        CASE 
          WHEN payment_method = 'cash' THEN 'Cash'
          WHEN payment_method = 'upi' THEN 'UPI/Digital'
          WHEN payment_method = 'card' THEN 'Card'
          WHEN payment_method IS NULL THEN 'Pending'
          ELSE 'Other'
        END as method,
        SUM(final_amount) as amount
      FROM bills 
      WHERE DATE(created_at) BETWEEN ? AND ? 
        AND payment_status = 'paid'
      GROUP BY 
        CASE 
          WHEN payment_method = 'cash' THEN 'Cash'
          WHEN payment_method = 'upi' THEN 'UPI/Digital'
          WHEN payment_method = 'card' THEN 'Card'
          WHEN payment_method IS NULL THEN 'Pending'
          ELSE 'Other'
        END
      ORDER BY amount DESC
    `, [startDate, endDate]);
    
    const totalAmount = totalCollections[0]?.total_collection || 0;
    
    // Calculate percentages for payment breakdown
    const paymentMethodBreakdown = (paymentBreakdown as any[]).map(item => ({
      method: item.method,
      amount: parseFloat(item.amount) || 0,
      percentage: totalAmount > 0 ? ((parseFloat(item.amount) / parseFloat(totalAmount)) * 100) : 0
    }));
    
    const analytics = {
      totalCashCollection: parseFloat(totalCollections[0]?.total_cash) || 0,
      totalOnlineCollection: parseFloat(totalCollections[0]?.total_online) || 0,
      totalCollection: parseFloat(totalAmount) || 0,
      dailyCollections: (dailyCollections as any[]).map(day => ({
        date: day.date,
        cash: parseFloat(day.cash) || 0,
        online: parseFloat(day.online) || 0,
        total: parseFloat(day.total) || 0
      })),
      monthlyTrend: (monthlyTrend as any[]).map(month => ({
        month: month.month,
        cash: parseFloat(month.cash) || 0,
        online: parseFloat(month.online) || 0
      })),
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

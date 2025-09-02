import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(`
      SELECT 
        id,
        name,
        current_stock as quantity,
        minimum_stock as lowStockThreshold,
        category
      FROM medicines 
      WHERE current_stock <= minimum_stock OR current_stock <= 10
      ORDER BY current_stock ASC
      LIMIT 10
    `)

    await connection.end()

    // Transform the data to match the expected format
    const stockAlerts = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      lowStockThreshold: row.lowStockThreshold || 10,
      category: row.category || 'General'
    }))

    return NextResponse.json(stockAlerts)
  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock alerts' },
      { status: 500 }
    )
  }
}

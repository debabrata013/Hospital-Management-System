import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, testConnection } from '@/lib/mongodb'
import { DatabaseUtils } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to connect to MongoDB',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Get database info
    const { db } = await connectToDatabase()
    const collections = await db.listCollections().toArray()
    
    // Test a simple operation
    const testResult = await DatabaseUtils.find('test_collection', {})
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      data: {
        database: 'arogya_hospital',
        collections: collections.map(col => col.name),
        connectionTime: new Date().toISOString(),
        testOperation: testResult.success
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Test creating a sample document
    const testData = {
      testField: body.testData || 'Sample test data',
      timestamp: new Date(),
      source: 'API test'
    }
    
    const result = await DatabaseUtils.create('test_collection', testData)
    
    return NextResponse.json({
      success: true,
      message: 'Test document created successfully',
      data: result
    })

  } catch (error) {
    console.error('Database test POST error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create test document',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

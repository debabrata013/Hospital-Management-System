import { NextRequest, NextResponse } from 'next/server'
import connectToMongoose, { testMongooseConnection } from '@/lib/mongoose'
import { DatabaseUtils } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const isConnected = await testMongooseConnection()
    
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

    // Get database info using Mongoose connection
    const mongoose = await connectToMongoose()
    const collections = await mongoose.connection.db.listCollections().toArray()
    
    // Test a simple operation
    const testResult = await DatabaseUtils.find('test_collection', {})
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      data: {
        database: mongoose.connection.name,
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

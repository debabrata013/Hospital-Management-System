import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const MONGODB_URI = process.env.MONGODB_URI

// Mongoose connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // Note: bufferMaxEntries and bufferCommands are not supported in Mongoose 8.x
}

interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

declare const global: GlobalWithMongoose

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToMongoose(): Promise<typeof mongoose> {
  if (cached?.conn) {
    console.log('✅ Using existing Mongoose connection')
    return cached.conn
  }

  if (!cached?.promise) {
    console.log('🔄 Creating new Mongoose connection...')
    
    if (!cached) {
      cached = global.mongoose = { conn: null, promise: null }
    }
    
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ Connected to MongoDB via Mongoose successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ Mongoose connection error:', error)
      if (cached) {
        cached.promise = null
      }
      throw error
    })
  }

  try {
    if (cached?.promise) {
      cached.conn = await cached.promise
      return cached.conn
    }
    throw new Error('No connection promise available')
  } catch (e) {
    if (cached) {
      cached.promise = null
    }
    throw e
  }
}

// Test Mongoose connection
export async function testMongooseConnection(): Promise<boolean> {
  try {
    const mongoose = await connectToMongoose()
    const isConnected = mongoose.connection.readyState === 1
    
    if (isConnected) {
      console.log('✅ Mongoose connection test successful')
      console.log(`📊 Database: ${mongoose.connection.name}`)
      console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`)
    } else {
      console.log('❌ Mongoose connection test failed - not connected')
    }
    
    return isConnected
  } catch (error) {
    console.error('❌ Mongoose connection test failed:', error)
    return false
  }
}

// Close Mongoose connection
export async function closeMongooseConnection(): Promise<void> {
  try {
    if (cached?.conn) {
      await cached.conn.connection.close()
      cached.conn = null
      cached.promise = null
      console.log('✅ Mongoose connection closed')
    }
  } catch (error) {
    console.error('❌ Error closing Mongoose connection:', error)
  }
}

// Get connection status
export function getMongooseConnectionStatus(): string {
  if (!cached.conn) return 'disconnected'
  
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  
  return states[cached.conn.connection.readyState as keyof typeof states] || 'unknown'
}

export default connectToMongoose
export { connectToMongoose as connectDB }

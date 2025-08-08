import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // Note: bufferMaxEntries and bufferCommands are Mongoose options, not MongoDB driver options
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Database helper functions
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db('arogya_hospital') // Your database name
    
    console.log('✅ Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw new Error('Failed to connect to MongoDB')
  }
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.admin().ping()
    console.log('✅ MongoDB connection test successful')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error)
    return false
  }
}

// Close connection function
export async function closeConnection(): Promise<void> {
  try {
    const client = await clientPromise
    await client.close()
    console.log('✅ MongoDB connection closed')
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
  }
}

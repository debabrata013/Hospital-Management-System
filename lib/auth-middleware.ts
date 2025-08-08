import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from './mongodb'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    role: string
    name: string
    email: string
  }
}

export async function authenticateUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return { error: 'No authentication token provided', status: 401 }
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Get user from database
    await connectToDatabase()
    
    // Import User model dynamically to avoid circular imports
    const mongoose = require('mongoose')
    const User = mongoose.models.User || require('../models/User.js')
    
    const user = await User.findById(decoded.userId).select('-passwordHash')
    
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    return {
      user: {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: 'Invalid authentication token', status: 401 }
  }
}

export async function requireSuperAdmin(request: NextRequest) {
  const auth = await authenticateUser(request)
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (auth.user?.role !== 'super-admin') {
    return NextResponse.json(
      { error: 'Super admin access required' }, 
      { status: 403 }
    )
  }

  return { user: auth.user }
}

export async function requireAdmin(request: NextRequest) {
  const auth = await authenticateUser(request)
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!['super-admin', 'admin'].includes(auth.user?.role || '')) {
    return NextResponse.json(
      { error: 'Admin access required' }, 
      { status: 403 }
    )
  }

  return { user: auth.user }
}

// Audit logging helper
export async function logAuditAction(
  userId: string,
  action: string,
  actionType: string,
  resourceType?: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await connectToDatabase()
    
    // Import AuditLog model dynamically
    const mongoose = require('mongoose')
    const AuditLog = mongoose.models.AuditLog || require('../models/AuditLog.js')
    
    await AuditLog.create({
      userId,
      userRole: 'super-admin', // Default for now
      userName: 'System User', // Default for now
      action,
      actionType,
      resourceType,
      resourceId,
      ipAddress,
      deviceInfo: { userAgent },
      riskLevel: actionType.includes('DELETE') ? 'HIGH' : 'MEDIUM'
    })
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}

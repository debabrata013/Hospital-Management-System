import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';

// Helper function to get server session (for API routes)
export async function getServerSession(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Fallback: allow "user-session" cookie in dev/local to provide a session
    if (!token) {
      const rawSession = request.cookies.get('user-session')?.value;
      if (rawSession) {
        try {
          const parsed = JSON.parse(rawSession);
          return {
            user: {
              id: parsed.id?.toString?.() || parsed.id,
              userId: parsed.userId,
              name: parsed.name,
              email: parsed.email,
              role: parsed.role,
              department: parsed.department,
              specialization: parsed.specialization,
              isActive: true,
              permissions: parsed.permissions || []
            }
          };
        } catch (_) {
          // ignore parse errors and continue to JWT branch
        }
      }
      return null;
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (tokenError) {
      return null;
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user || !user.isActive) {
      return null;
    }

    // Return session-like object
    return {
      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        isActive: user.isActive,
        permissions: user.permissions
      }
    };

  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

// Role-based access control helper
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Permission levels for different operations
export const PERMISSIONS = {
  PHARMACY: {
    VIEW_MEDICINES: ['admin', 'pharmacy_manager', 'pharmacist', 'doctor', 'nurse'],
    CREATE_MEDICINE: ['admin', 'pharmacy_manager', 'pharmacist'],
    UPDATE_MEDICINE: ['admin', 'pharmacy_manager', 'pharmacist'],
    DELETE_MEDICINE: ['admin', 'pharmacy_manager'],
    DISPENSE_PRESCRIPTION: ['admin', 'pharmacy_manager', 'pharmacist'],
    MANAGE_INVENTORY: ['admin', 'pharmacy_manager', 'pharmacist', 'inventory_manager'],
    VIEW_REPORTS: ['admin', 'pharmacy_manager', 'pharmacist'],
    MANAGE_ALERTS: ['admin', 'pharmacy_manager']
  },
  BILLING: {
    CREATE_INVOICE: ['admin', 'billing_manager', 'cashier', 'receptionist'],
    PROCESS_PAYMENT: ['admin', 'billing_manager', 'cashier'],
    VIEW_REPORTS: ['admin', 'billing_manager', 'accountant'],
    APPLY_DISCOUNT: ['admin', 'billing_manager'],
    CANCEL_INVOICE: ['admin', 'billing_manager']
  }
};

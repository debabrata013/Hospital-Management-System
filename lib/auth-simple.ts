import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// Simple mock user for development
const mockUser = {
  id: 'mock-user-id',
  userId: 'mock-user-id',
  name: 'Admin User',
  email: 'admin@hospital.com',
  role: 'admin',
  department: 'administration',
  specialization: 'general',
  isActive: true,
  permissions: ['all']
};

// Helper function to get server session (for API routes) - Simplified version
export async function getServerSession(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('auth-backup')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('[AUTH] Token found:', !!token);

    if (!token) {
      console.log('[AUTH] No token found, returning null');
      return null;
    }

    // Verify JWT token using jose library (same as login)
    let decoded: any;
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
      console.log('[AUTH] Token decoded successfully for user:', decoded.userId, decoded.name);
    } catch (tokenError) {
      console.error('[AUTH] Token verification failed:', tokenError);
      return null;
    }

    // Return session-like object with decoded user
    return {
      user: {
        id: decoded.userId,
        userId: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department,
        specialization: decoded.specialization,
        isActive: true,
        permissions: decoded.permissions || []
      }
    };

  } catch (error) {
    console.error('[AUTH] Session verification error:', error);
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

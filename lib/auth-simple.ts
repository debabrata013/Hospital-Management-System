import jwt from 'jsonwebtoken';
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
      
      // For development, return mock user if no session found
      return {
        user: mockUser
      };
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (tokenError) {
      // For development, return mock user if token is invalid
      return {
        user: mockUser
      };
    }

    // Return session-like object with decoded user or mock user
    return {
      user: {
        id: decoded.userId || mockUser.id,
        userId: decoded.userId || mockUser.userId,
        name: decoded.name || mockUser.name,
        email: decoded.email || mockUser.email,
        role: decoded.role || mockUser.role,
        department: decoded.department || mockUser.department,
        specialization: decoded.specialization || mockUser.specialization,
        isActive: true,
        permissions: decoded.permissions || mockUser.permissions
      }
    };

  } catch (error) {
    console.error('Session verification error:', error);
    // For development, return mock user on error
    return {
      user: mockUser
    };
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

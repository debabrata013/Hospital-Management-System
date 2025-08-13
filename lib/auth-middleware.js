// Authentication Middleware - MySQL Implementation
// Hospital Management System - Arogya Hospital

import jwt from 'jsonwebtoken';
import { executeQuery } from './mysql-connection.js';

// Verify JWT token and get user information
export async function verifyToken(request) {
  try {
    // Get token from Authorization header or cookies
    let token = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookies
      const cookies = request.headers.get('cookie');
      if (cookies) {
        const tokenCookie = cookies
          .split(';')
          .find(c => c.trim().startsWith('auth-token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
    }

    if (!token) {
      return {
        success: false,
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Get user from database
    const users = await executeQuery(
      `SELECT 
        u.id,
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.specialization,
        u.is_active,
        u.is_verified,
        sp.employee_type,
        sp.work_location
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.id = ? AND u.is_active = TRUE`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return {
        success: false,
        message: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      };
    }

    const user = users[0];

    if (!user.is_verified) {
      return {
        success: false,
        message: 'User account not verified',
        code: 'USER_NOT_VERIFIED'
      };
    }

    return {
      success: true,
      user: {
        userId: user.id,
        userIdString: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        employeeType: user.employee_type,
        workLocation: user.work_location
      },
      token: decoded
    };

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      };
    } else if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        message: 'Authentication token expired',
        code: 'TOKEN_EXPIRED'
      };
    } else {
      console.error('Auth middleware error:', error);
      return {
        success: false,
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      };
    }
  }
}

// Check if user has required role
export function hasRole(userRole, requiredRoles) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  
  // Super admin has access to everything
  if (userRole === 'super-admin') {
    return true;
  }
  
  return requiredRoles.includes(userRole);
}

// Check if user has permission for specific module and action
export async function hasPermission(userId, module, action) {
  try {
    const permissions = await executeQuery(
      `SELECT permissions FROM user_permissions 
       WHERE user_id = ? AND module = ?`,
      [userId, module]
    );

    if (permissions.length === 0) {
      return false;
    }

    const userPermissions = JSON.parse(permissions[0].permissions);
    return userPermissions.includes(action) || userPermissions.includes('*');

  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

// Middleware function for API routes
export function withAuth(handler, options = {}) {
  return async function(request, context) {
    const authResult = await verifyToken(request);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: authResult.message,
          code: authResult.code
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check role requirements
    if (options.roles && !hasRole(authResult.user.role, options.roles)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check module permission
    if (options.module && options.action) {
      const hasModulePermission = await hasPermission(
        authResult.user.userId,
        options.module,
        options.action
      );

      if (!hasModulePermission) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Module access denied',
            code: 'MODULE_ACCESS_DENIED'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Add user to request context
    request.user = authResult.user;
    
    return handler(request, context);
  };
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  'super-admin': 5,
  'admin': 4,
  'doctor': 3,
  'staff': 2,
  'receptionist': 1
};

// Check if user role has higher or equal level than required role
export function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

// Generate new JWT token
export function generateToken(user) {
  const payload = {
    userId: user.id,
    userIdString: user.user_id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
}

// Refresh token (extend expiry)
export async function refreshToken(request) {
  try {
    const authResult = await verifyToken(request);
    
    if (!authResult.success) {
      return authResult;
    }

    // Generate new token
    const newToken = generateToken(authResult.user);
    
    return {
      success: true,
      token: newToken,
      user: authResult.user
    };

  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      message: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    };
  }
}

// Logout (invalidate token - in a real app, you'd maintain a blacklist)
export async function logout(request) {
  try {
    const authResult = await verifyToken(request);
    
    if (authResult.success) {
      // Log the logout action
      await executeQuery(
        `INSERT INTO audit_logs (log_id, user_id, action, resource_type, ip_address, created_at) 
         VALUES (?, ?, 'LOGOUT', 'auth', ?, CURRENT_TIMESTAMP)`,
        [
          `LOG${Date.now()}`,
          authResult.user.userId,
          request.headers.get('x-forwarded-for') || 'unknown'
        ]
      );
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed'
    };
  }
}

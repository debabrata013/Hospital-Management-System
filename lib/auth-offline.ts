// Offline authentication and session management

import { 
  saveSessionOffline, 
  getActiveSession, 
  clearExpiredSessions 
} from './offline';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserSession {
  userId: string;
  token: string;
  role: string;
  expiresAt: number;
}

// Simulate JWT token generation for offline use
function generateOfflineToken(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    offline: true
  }));
  const signature = btoa(`offline-signature-${userId}-${Date.now()}`);
  
  return `${header}.${payload}.${signature}`;
}

// Validate offline credentials (in a real app, this would check against cached user data)
function validateOfflineCredentials(credentials: LoginCredentials): UserSession | null {
  // This is a simplified validation for demo purposes
  // In a real implementation, you would check against locally stored user data
  const mockUsers = [
    { email: 'doctor@hospital.com', password: 'doctor123', userId: 'DOC001', role: 'doctor' },
    { email: 'receptionist@hospital.com', password: 'reception123', userId: 'REC001', role: 'receptionist' },
    { email: 'admin@hospital.com', password: 'admin123', userId: 'ADM001', role: 'admin' }
  ];

  const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
  
  if (user) {
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    const token = generateOfflineToken(user.userId, user.role);
    
    return {
      userId: user.userId,
      token,
      role: user.role,
      expiresAt
    };
  }
  
  return null;
}

export async function loginOffline(credentials: LoginCredentials): Promise<UserSession | null> {
  try {
    // Clean up expired sessions first
    await clearExpiredSessions();
    
    // Validate credentials
    const session = validateOfflineCredentials(credentials);
    
    if (session) {
      // Save session offline
      await saveSessionOffline({
        userId: session.userId,
        token: session.token,
        role: session.role,
        expiresAt: session.expiresAt,
        isActive: true
      });
      
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('Offline login failed:', error);
    return null;
  }
}

export async function getCurrentOfflineSession(): Promise<UserSession | null> {
  try {
    // This would typically get the current user from context/state
    // For demo purposes, we'll check for any active session
    const mockUserId = 'REC001'; // Receptionist user
    const session = await getActiveSession(mockUserId);
    
    if (session && session.expiresAt > Date.now()) {
      return {
        userId: session.userId,
        token: session.token,
        role: session.role,
        expiresAt: session.expiresAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get current offline session:', error);
    return null;
  }
}

export async function logoutOffline(userId: string): Promise<void> {
  try {
    const session = await getActiveSession(userId);
    if (session) {
      // Deactivate the session by updating it
      await saveSessionOffline({
        userId: session.userId,
        token: session.token,
        role: session.role,
        expiresAt: session.expiresAt,
        isActive: false
      });
    }
  } catch (error) {
    console.error('Offline logout failed:', error);
  }
}

export function isValidOfflineToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now && payload.offline === true;
  } catch (error) {
    return false;
  }
}

export function getOfflineTokenPayload(token: string): any {
  try {
    const parts = token.split('.');
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    return null;
  }
}

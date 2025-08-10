import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Types
interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  specialization?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  role: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    contactNumber?: string;
  };
  acceptTerms: boolean;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Auth Context
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
} | null>(null);

// Auth Hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const router = useRouter();

  // Initialize auth state from cookies/localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check for user session cookie
      const userSession = getCookie('user-session');
      if (userSession) {
        try {
          const user = JSON.parse(userSession);
          
          // Verify token is still valid by making a request
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user,
              isLoading: false,
              isAuthenticated: true,
              error: null
            });
            return;
          }
        } catch (error) {
          console.error('Session verification failed:', error);
        }
      }

      // No valid session found
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to initialize authentication'
      });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        toast.success(data.message || 'Login successful');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(data.user.role);
        router.push(redirectPath);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        // If user is immediately active (patients), set auth state
        if (result.user.isActive) {
          setAuthState({
            user: result.user,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
          
          const redirectPath = getRedirectPath(result.user.role);
          router.push(redirectPath);
        } else {
          // User needs approval
          setAuthState(prev => ({ ...prev, isLoading: false }));
          router.push('/login?message=registration-pending');
        }

        toast.success(result.message);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
      router.push('/login');
    }
  }, [router]);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
      } else {
        throw new Error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push('/login?message=password-reset-success');
      } else {
        throw new Error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      toast.error(errorMessage);
      throw error;
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: data.user
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (!authState.user || !authState.user.permissions) {
      return false;
    }

    const modulePermission = authState.user.permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  }, [authState.user]);

  return {
    authState,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
    hasPermission
  };
};

// Helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function getRedirectPath(role: string): string {
  const roleRedirects: Record<string, string> = {
    'super-admin': '/super-admin',
    'admin': '/admin',
    'doctor': '/doctor',
    'staff': '/admin',
    'receptionist': '/admin',
    'patient': '/patient'
  };

  return roleRedirects[role] || '/';
}

// Token verification hook
export const useTokenVerification = (token?: string) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setIsValid(true);
          setUserData(data.data);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return { isValid, isLoading, userData };
};

// Role-based access hook
export const useRoleAccess = (allowedRoles: string[]) => {
  const { authState } = useAuth();
  
  const hasAccess = authState.user ? allowedRoles.includes(authState.user.role) : false;
  
  return {
    hasAccess,
    userRole: authState.user?.role,
    isLoading: authState.isLoading
  };
};

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, AuthState } from '@/lib/types';

// --- CONFIGURATION ---
const API_BASE_URL = '/api';

interface LoginData {
  login: string; // Can be email or phone number
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  address?: string;
}

interface AuthContextType {
  authState: AuthState;
  login: (loginData: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

// --- AUTH CONTEXT ---
const AuthContext = createContext<AuthContextType>(null!);

// --- AUTH PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// --- PUBLIC AUTH HOOK ---
export const useAuth = () => {
  return useContext(AuthContext);
};

// --- CORE AUTH LOGIC HOOK ---
const useProvideAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const router = useRouter();

  useEffect(() => {
    // Check for user data in a secure way (e.g., from a session endpoint)
    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`);
        if (response.ok) {
          const { user } = await response.json();
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
        }
      } catch (error) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    };
    verifySession();
  }, []);

  const login = useCallback(async (loginData: LoginData) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { user } = await response.json();

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      toast.success('Login successful!');
      
      // Force redirect using window.location for immediate navigation
      const redirectPath = getRedirectPath(user.role);
      console.log('Redirecting user with role:', user.role, 'to path:', redirectPath);
      window.location.href = redirectPath;

    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      toast.success(result.message || 'Registration successful!');
      router.push('/login');

    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      router.push('/login');
      toast.info('You have been logged out.');
    }
  }, [router]);

  return {
    authState,
    login,
    register,
    logout,
    setAuthState
  };
};

// --- HELPER FUNCTIONS ---
const getRedirectPath = (role: string): string => {
  const roleRedirects: Record<string, string> = {
    'super-admin': '/super-admin',
    'admin': '/admin',
    'doctor': '/doctor',
    'patient': '/patient',
    'staff': '/staff',
    'nurse': '/nurse',
    'receptionist': '/receptionist',
    'pharmacy': '/pharmacy',
  };
  return roleRedirects[role] || '/';
};

// --- TOKEN VERIFICATION HOOK ---
export const useTokenVerification = (token: string | null) => {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const data = await response.json();
          setIsValid(true);
          setUserData(data.user);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return { isValid, isLoading, userData };
};
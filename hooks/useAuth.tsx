"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5002/api';

// --- TYPES & INTERFACES ---
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface LoginData {
  email: string;
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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setAuthState({
          user: decodedUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error) {
        console.error('Invalid token found:', error);
        localStorage.removeItem('token');
        setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    } else {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    }
  }, []);

  const login = useCallback(async (loginData: LoginData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
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

      const { token } = await response.json();
      localStorage.setItem('token', token);
      const decodedUser: User = jwtDecode(token);

      setAuthState({
        user: decodedUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      toast.success('Login successful!');
      router.push(getRedirectPath(decodedUser.role));

    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
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
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    router.push('/login');
    toast.info('You have been logged out.');
  }, [router]);

  return {
    authState,
    login,
    register,
    logout,
  };
};

// --- HELPER FUNCTIONS ---
const getRedirectPath = (role: string): string => {
  const roleRedirects: Record<string, string> = {
    'super-admin': '/super-admin',
    'admin': '/admin',
    'doctor': '/doctor',
    'patient': '/patient',
  };
  return roleRedirects[role] || '/';
};

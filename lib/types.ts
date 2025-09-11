export interface User {
  id: string;
  user_id?: string;
  name: string;
  firstName?: string; // Keep for backward compatibility
  lastName?: string;  // Keep for backward compatibility
  email: string;
  role: string;
  department?: string;
  mobile?: string;
  permissions?: any[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

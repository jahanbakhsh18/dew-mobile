export interface User {
  username: string;
  loginTime: number
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  dropdownData: any;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
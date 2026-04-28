import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthState, User } from '../types';
import authService from '../services/auth.service';
import biometricService from '../services/biometric.service';

interface AuthContextType extends AuthState {
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  saveCredentialsForBiometric: (username: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        setState({
          isAuthenticated: true,
          user: session.user,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Session check failed',
      });
    }
  };

  const loginWithPassword = async (username: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, token } = await authService.loginWithPassword({ username, password });
      await authService.saveSession(token, user);
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const isAuthenticated = await biometricService.authenticateWithBiometric();
      if (!isAuthenticated) {
        throw new Error('Biometric authentication failed');
      }

      const credentials = await biometricService.getCredentials();
      if (!credentials) {
        throw new Error('No saved credentials found');
      }

      const { user, token } = await authService.loginWithPassword(credentials);
      await authService.saveSession(token, user);
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Biometric login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    await biometricService.removeCredentials();
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  const checkBiometricAvailability = async () => {
    return await biometricService.isBiometricAvailable();
  };

  const saveCredentialsForBiometric = async (username: string, password: string) => {
    return await biometricService.saveCredentials(username, password);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithPassword,
        loginWithBiometric,
        logout,
        checkBiometricAvailability,
        saveCredentialsForBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
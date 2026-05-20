import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthState } from '../types';
import authService from '../services/auth.service';
import biometricService from '../services/biometric.service';

interface AuthContextType extends AuthState {
  refreshCsrfToken: () => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  saveCredentialsForBiometric: (username: string, password: string) => Promise<boolean>;
  getDropdownOptions: (key: string, url: string) => Promise<any[]>;
  setDropdownData: (key: string, data: any[]) => void;
  clearDropdownData: (key?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    dropdownData: {}
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      console.log("AuthContext", state, session);

      if (session) {
        console.log("We have session... TODO");
        setState({
          isAuthenticated: false, //true,
          user: null, //session.user,
          loading: false,
          error: null,
          dropdownData: {}
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
        dropdownData: {}
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
        dropdownData: {}
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
        dropdownData: {}
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
      dropdownData: {}
    });
  };

  const refreshCsrfToken = async () => {
    await authService.refreshCsrfToken();
  }

  const checkBiometricAvailability = async () => {
    return await biometricService.isBiometricAvailable();
  };

  const saveCredentialsForBiometric = async (username: string, password: string) => {
    return await biometricService.saveCredentials(username, password);
  };

  const fetchSerenityLookup = async <T,>(url: string) => {
    const lookupItems = await authService.fetchSerenityLookup(url);
    console.log("fetchSerenityLookup", url, lookupItems);
    return lookupItems;
  };

  const getDropdownOptions = async (key: string, url: string): Promise<any[]> => {

    if (state.dropdownData[key]) {
      return state.dropdownData[key];
    }

    try {
      const lookupItems = await fetchSerenityLookup(url);
      setDropdownData(key, lookupItems);
      return lookupItems;
    } catch (error) {
      console.error(`Failed to fetch dropdown data for ${key}:`, error);
      throw error;
    }
  };

  const setDropdownData = (key: string, data: any[]) => {
    setState(prev => ({
      ...prev,
      dropdownData: {
        ...prev.dropdownData,
        [key]: data,
      },
    }));
  };

  const clearDropdownData = (key?: string) => {
    if (key) {
      const { [key]: _, ...rest } = state.dropdownData;
      setState(prev => ({
        ...prev,
        dropdownData: rest,
      }));
    } else {
      setState(prev => ({
        ...prev,
        dropdownData: {},
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        refreshCsrfToken,
        loginWithPassword,
        loginWithBiometric,
        logout,
        checkBiometricAvailability,
        saveCredentialsForBiometric,
        getDropdownOptions,
        setDropdownData,
        clearDropdownData
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
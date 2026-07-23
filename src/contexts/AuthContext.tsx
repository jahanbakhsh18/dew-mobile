import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthState } from '../types';
import authService from '../services/auth.service';
import biometricService from '../services/biometric.service';
import authStore from '../services/authStore';

interface AuthContextType extends AuthState {
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  saveCredentialsForBiometric: (username: string, password: string) => Promise<boolean>;
  getUserInfo: () => Promise<any>;
  getDropdownOptions: (key: string, url: string) => Promise<any[]>;
  clearDropdownData: (key?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false, user: null, loading: true, 
    error: null, dropdownData: {}, userInfo: null
  });

  useEffect(() => {
    authStore.setResetLocalAuth(resetLocalAuth);
    checkSession();
    return () => authStore.setResetLocalAuth(null);
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      console.log("AuthContext", state, session);

      if (session) {
        setState({
          isAuthenticated: true, user: session.user, //null
          loading: false, error: null, dropdownData: {}, userInfo: null
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setState({
        isAuthenticated: false, user: null, loading: false,
        error: 'Session check failed', dropdownData: {}, userInfo: null
      });
    }
  };

  const loginWithPassword = async (username: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, token } = await authService.loginWithPassword({ username, password });
      await authService.saveSession(token, user);      
      setState({
        isAuthenticated: true, user,
        loading: false, error: null, dropdownData: {}, userInfo: null
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message || 'Login failed' }));
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
        isAuthenticated: true, user,
        loading: false, error: null, dropdownData: {}, userInfo: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev, loading: false, error: error.message || 'Biometric login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    await biometricService.removeCredentials();
    setState({
      isAuthenticated: false, user: null, loading: false,
      error: null, dropdownData: {}, userInfo: null
    });
  };

  const checkBiometricAvailability = async () => {
    return await biometricService.isBiometricAvailable();
  };

  const saveCredentialsForBiometric = async (username: string, password: string) => {
    return await biometricService.saveCredentials(username, password);
  };

  const getUserInfo = async (): Promise<any> => {
    if(state.userInfo) {
      return state.userInfo;
    }

    try {
      const userInfo = await authService.getUserInfo();
      console.log(userInfo);
      setState(prev => ({ ...prev, userInfo : userInfo }));
    } catch (error) {
      throw error;
    }
  }

  const getDropdownOptions = async (key: string, url: string): Promise<any[]> => {

    if (state.dropdownData[key]) {
      return state.dropdownData[key];
    }

    try {
      const lookupItems = await authService.fetchSerenityLookup(url);
      setDropdownData(key, lookupItems);
      return lookupItems;
    } catch (error) {
      console.error(`Failed to fetch dropdown data for ${key}:`, error);
      throw error;
    }
  };

  const setDropdownData = (key: string, data: any[]) => {
    setState(prev => ({
      ...prev, dropdownData: {
        ...prev.dropdownData, [key]: data
      }
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

  const resetLocalAuth = async () => {
    await authService.clearLocalSession();
    setState({ isAuthenticated: false, user: null, loading: false, error: null, dropdownData: {}, userInfo: null });
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
        getUserInfo,
        getDropdownOptions,
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
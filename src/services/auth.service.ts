import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials } from '../types';
import { apiClient, refreshCsrfToken } from './apiClient';
import * as Keychain from 'react-native-keychain';
import { SerenityLookupResponse } from '../types/dropdown.types';

class AuthService {
  private readonly TOKEN_KEY = '@auth_token';
  private readonly USER_KEY = '@user_data';

  async loginWithPassword(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {

      const response = await apiClient.post("/Account/Login", {
        Username: credentials.username,
        Password: credentials.password
      });

      if (response.status == 200) {
        const user: User = { username: credentials.username, loginTime: Date.now() };
        const token = response.data.token || 'jwt-token';

        await Keychain.setGenericPassword(credentials.username, credentials.password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        await refreshCsrfToken();

        return { user, token };
      } else {
        throw new Error(response?.statusText || 'Login failed');
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error?.message || 'Network Problem.');
    }
  }

  async loginWithBiometric(): Promise<{ user: User; token: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          username: 'biometric_user',
          loginTime: Date.now()
        };
        const token = 'biometric-token';
        resolve({ user, token });
      }, 500);
    });
  }

  private async storeBiometricCredentials(username: string, password: string) {
    await Keychain.setGenericPassword(username, password, {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
  }

  async saveSession(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem(this.TOKEN_KEY, token);
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  async getSession(): Promise<{ token: string; user: User } | null> {
    const token = await AsyncStorage.getItem(this.TOKEN_KEY);
    const userStr = await AsyncStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      //const user: User = JSON.parse(userStr);

      //if(user && (Date.now() - user.loginTime < 60 * 1000))
      return { token, user: JSON.parse(userStr) };
      //else
      //  return null;
    }
    return null;
  }

  async logout(): Promise<void> {
    try {
      const response = await apiClient.get("/Account/Signout");
      console.log("logout", response?.status);
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
    }
  }

  async clearLocalSession(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  async getUserInfo(): Promise<any> {
    const response = await apiClient.get("/Account/GetUserInfo");
    return response.data;
  }

  async fetchSerenityLookup<T,>(url: string): Promise<T[]> {
    try {
      const response = await apiClient.get<SerenityLookupResponse>(url);

      if (response.status === 200 && response.data) {
        return response.data.Items;
      }
      throw new Error('Failed to fetch tickets');
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  };
}

export default new AuthService();
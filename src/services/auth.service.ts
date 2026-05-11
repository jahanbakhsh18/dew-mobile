import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials } from '../types';
import { apiClient } from './apiClient';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '../config'
import CookieManager from '@preeternal/react-native-cookie-manager';

class AuthService {
  private readonly TOKEN_KEY = '@auth_token';
  private readonly USER_KEY = '@user_data';

  async loginWithPassword(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      let response = await apiClient.post("/Account/Login", {
        Username: credentials.username,
        Password: credentials.password
      });

      if (response.status == 200) {
        const user: User = {
          id: response.data.userId || '1',
          username: credentials.username,
          email: response.data.email || 'demo@example.com',
        };
        const token = response.data.token || 'fake-jwt-token';

        await Keychain.setGenericPassword(credentials.username, credentials.password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        // This ensures the token is bound to the authenticated user
        await this.refreshCsrfToken();

        const cookies = await CookieManager.get(API_URL);
        console.log('Stored cookies:', Object.keys(cookies));

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

    //const storedCreds = await this.g

    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          username: 'biometric_user'
        };
        const token = 'fake-biometric-token';
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
      return { token, user: JSON.parse(userStr) };
    }
    return null;
  }

  async logout(): Promise<void> {
    let response = await apiClient.get("/Account/Signout");
    console.log("logout", response?.status);
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  async me(): Promise<void> {
    apiClient.get("/Account/CurrentUser");
  }

  async refreshCsrfToken(): Promise<void> {
    apiClient.get("/"); //"Account/Login");
  }
}

export default new AuthService();


/*async loginWithPassword(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await apiClient.post("/Account/Login", {
          Username: credentials.username,
          Password: credentials.password
        });

        console.log("login", response);

        if (response.status == 200) {
          const user: User = {
            id: '1',
            username: credentials.username,
            password: credentials.password,
            email: 'demo@example.com',
          };
          const token = 'fake-jwt-token';
          resolve({ user, token });
        } else {
          reject(response?.statusText);
        }
      } catch (error) {
        console.error(error);
        reject(new Error('Invalid username or password'));
      }
    });
  }
  */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials } from '../types';

class AuthService {
  private readonly TOKEN_KEY = '@auth_token';
  private readonly USER_KEY = '@user_data';

  async loginWithPassword(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Simulate API call - Replace with actual API integration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'test' && credentials.password === 'test') {
          const user: User = {
            id: '1',
            username: credentials.username,
            email: 'demo@example.com',
          };
          const token = 'fake-jwt-token';
          resolve({ user, token });
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 1000);
    });
  }

  async loginWithBiometric(): Promise<{ user: User; token: string }> {
    // Simulate biometric login
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          username: 'biometric_user',
          email: 'bio@example.com',
        };
        const token = 'fake-biometric-token';
        resolve({ user, token });
      }, 500);
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
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }
}

export default new AuthService();
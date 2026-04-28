import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

class BiometricService {
  private biometrics: ReactNativeBiometrics;

  constructor() {
    this.biometrics = new ReactNativeBiometrics();
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const { available } = await this.biometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  async saveCredentials(username: string, password: string): Promise<boolean> {
    try {
      await Keychain.setInternetCredentials(
        'com.dew.auth',
        username,
        password
      );
      return true;
    } catch (error) {
      console.error('Save credentials failed:', error);
      return false;
    }
  }

  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('com.dew.auth');
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Get credentials failed:', error);
      return null;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const { available } = await this.biometrics.isSensorAvailable();

      if (!available) {
        return false;
      }

      const { success } = await this.biometrics.simplePrompt({
        promptMessage: 'Authenticate to login',
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async removeCredentials(): Promise<boolean> {
    try {
      await Keychain.resetInternetCredentials({ service: 'com.dew.auth' });
      return true;
    } catch (error) {
      console.error('Remove credentials failed:', error);
      return false;
    }
  }
}

export default new BiometricService();
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  Switch, ScrollView, KeyboardAvoidingView, Platform,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors, Spacing, Typography, Shadows } from '../globalStyles';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberBiometric, setRememberBiometric] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const {
    loginWithPassword, loginWithBiometric, loading, error, 
    checkBiometricAvailability, saveCredentialsForBiometric } = useAuth();

  useEffect(() => {
    checkBiometric();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
    }
  }, [error]);

  const checkBiometric = async () => {
    const available = await checkBiometricAvailability();
    setBiometricAvailable(available);
  };

  const handlePasswordLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      await loginWithPassword(username, password);

      if (rememberBiometric && biometricAvailable) {
        await saveCredentialsForBiometric(username, password);
      }
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometric();
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primary, Colors.primaryTint, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Ionicons name="water" color={Colors.primaryTint} size={60} />
            <Text style={styles.brandName}>dew</Text>
            <Text style={styles.brandTagline}>Ticket tracking, simplified</Text>
          </View>

          <View style={styles.card}>
            <Text style={Typography.headline}>Sign in</Text>
            <Text style={[Typography.subtitle, styles.subtitleSpacing]}>
              Use your workspace credentials to continue
            </Text>

            <View style={styles.form}>
              <FloatingLabelInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                leftIcon="person-outline"
                style={styles.inputSpacing}
              />

              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
                style={styles.inputSpacing}
              />

              {biometricAvailable && (
                <View style={styles.biometricRow}>
                  <Switch
                    value={rememberBiometric}
                    onValueChange={setRememberBiometric}
                    disabled={loading}
                    trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
                    thumbColor={rememberBiometric ? Colors.primary : Colors.white}
                  />
                  <Text style={styles.biometricLabel}>
                    Save credentials for fingerprint login
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handlePasswordLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign in</Text>
                )}
              </TouchableOpacity>

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBiometricLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>Use fingerprint instead</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.footerNote}>
            Having trouble signing in? Contact your workspace administrator.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.primaryTint,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.primaryTint,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.xl,
    padding: Spacing.xxl,
    ...Shadows.raised,
  },
  subtitleSpacing: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  form: {
    marginTop: Spacing.md,
  },
  inputSpacing: {
    marginHorizontal: 0,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  biometricLabel: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 13,
    color: Colors.secondary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    color: Colors.secondary,
    fontSize: 12,
    marginTop: Spacing.xxl,
  },
});

export default LoginScreen;

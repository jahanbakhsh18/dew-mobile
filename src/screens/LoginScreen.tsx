import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Layout, Typography, Card, Input, Buttons, Spacing } from '../globalStyles';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberBiometric, setRememberBiometric] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { 
    refreshCsrfToken, loginWithPassword, loginWithBiometric,
    loading, error, checkBiometricAvailability, saveCredentialsForBiometric } = useAuth();

  useEffect(() => {
    refreshCsrfToken();
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
    <View style={Layout.loginContainer}>
      <View style={Card.default}>
        <Text style={Typography.headlineLarge}>Welcome Back</Text>
        <Text style={[Typography.subtitle, { marginBottom: Spacing.xxxl }]}>
          Please sign in to continue
        </Text>

        <View style={{ gap: Spacing.md }}>
          <TextInput
            style={Input.default}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={Input.default}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          {biometricAvailable && (
            <View style={[Layout.row, { marginVertical: Spacing.sm }]}>
              <Switch
                value={rememberBiometric}
                onValueChange={setRememberBiometric}
                disabled={loading}
              />
              <Text style={[Typography.body, { marginLeft: Spacing.md }]}>
                Save credentials for fingerprint login
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={Buttons.primary}
            onPress={handlePasswordLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={Typography.buttonText}>Login with Password</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={Buttons.outline}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Text style={Typography.buttonOutlineText}>
                🖐️ Login with Fingerprint
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
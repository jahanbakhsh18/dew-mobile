import React, { useState, useRef } from 'react';
import { View, TextInput, TextInputProps, Animated, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  style?: StyleProp<ViewStyle>;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style = {},
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(animatedLabel, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1.02,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (!value) {
      Animated.parallel([
        Animated.timing(animatedLabel, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(borderAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderGradientColor = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#ff4444' : 'rgba(224, 224, 224, 1)'],
  });

  const shadowOpacity = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: scaleAnimation }],
        }
      ]}
    >
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? '#ff4444' : borderGradientColor,
            borderWidth: 2,
            shadowOpacity: shadowOpacity,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: borderAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            backgroundColor: '#fff',
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon name={leftIcon} size={20} color={isFocused ? '#007AFF' : '#999'} />
          </View>
        )}

        <Animated.Text
          style={[
            styles.label,
            {
              left: leftIcon ? 44 : 16,
              top: animatedLabel.interpolate({
                inputRange: [0, 1],
                outputRange: [14, -8],
              }),
              fontSize: animatedLabel.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 12],
              }),
              color: animatedLabel.interpolate({
                inputRange: [0, 1],
                outputRange: [error ? '#ff4444' : '#999', error ? '#ff4444' : '#007AFF'],
              }),
            },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          style={[
            styles.input,
            { paddingLeft: leftIcon ? 44 : 16 }
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="transparent"
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress || (() => { })}
          >
            <Icon name={rightIcon} size={20} color={isFocused ? '#007AFF' : '#999'} />
          </TouchableOpacity>
        )}

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={isFocused ? '#007AFF' : '#999'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <Animated.View style={styles.errorContainer}>
          <Icon name="alert-circle" size={12} color="#ff4444" />
          <Animated.Text style={styles.errorText}>
            {error}
          </Animated.Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 0,
    backgroundColor: '#fff',
  },
  input: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    color: '#333',
    minHeight: 56,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    color: '#999',
    zIndex: 1,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 2,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 12,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
  },
});

export default FloatingLabelInput;
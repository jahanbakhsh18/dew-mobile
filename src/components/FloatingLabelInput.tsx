import React, { useState, useRef } from 'react';
import { View, TextInput, TextInputProps, Animated, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Typography } from '../globalStyles';

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
    outputRange: [error ? Colors.danger : Colors.border],
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
            borderColor: error ? Colors.danger : borderGradientColor,
            borderWidth: 2,
            shadowOpacity: shadowOpacity,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: borderAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            backgroundColor: Colors.white,
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon name={leftIcon} size={20} color={isFocused ? Colors.primary : Colors.secondary} />
          </View>
        )}

        <Animated.Text
          style={[
            styles.label,
            {
              left: leftIcon ? 44 : Spacing.lg,
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
                outputRange: [error ? Colors.danger : Colors.secondary, error ? Colors.danger : Colors.primary],
              }),
            },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          style={[
            styles.input,
            { paddingLeft: leftIcon ? 44 : Spacing.lg }
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
            <Icon name={rightIcon} size={20} color={isFocused ? Colors.primary : Colors.secondary} />
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
              color={isFocused ? Colors.primary : Colors.secondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <Animated.View style={styles.errorContainer}>
          <Icon name="alert-circle" size={12} color={Colors.danger} />
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
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 0,
    backgroundColor: Colors.white,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 18,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: Spacing.lg,
    color: Colors.text,
    minHeight: 56,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xs,
    color: Colors.secondary,
    zIndex: 1,
  },
  leftIconContainer: {
    position: 'absolute',
    left: Spacing.lg,
    top: 18,
    zIndex: 2,
  },
  rightIconContainer: {
    position: 'absolute',
    right: Spacing.lg,
    top: 18,
    zIndex: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
  },
});

export default FloatingLabelInput;
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { color } from '../../assets/colors/globalColor';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function CustomButton({ title, onPress, disabled, variant = 'primary', style }: CustomButtonProps) {
  let btnStyle: ViewStyle = styles.buttonPrimary;
  let textStyle: TextStyle = styles.textPrimary;

  if (variant === 'secondary') {
    btnStyle = styles.buttonSecondary;
    textStyle = styles.textSecondary;
  } else if (variant === 'danger') {
    btnStyle = styles.buttonDanger;
    textStyle = styles.textPrimary;
  }

  return (
    <TouchableOpacity
      style={[styles.baseButton, btnStyle, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.baseText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPrimary: {
    backgroundColor: color.primaryGold,
  },
  buttonSecondary: {
    backgroundColor: color.primaryLightGold,
    borderWidth: 1.5,
    borderColor: color.primaryGold,
  },
  buttonDanger: {
    backgroundColor: color.accentRed,
  },
  disabledButton: {
    opacity: 0.5,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: color.primaryDarkGold,
  },
});

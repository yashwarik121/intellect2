import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { color } from '../../assets/colors/globalColor';

export type SwalType = 'success' | 'error' | 'warning' | 'info';

export interface SwalAlertOptions {
  visible: boolean;
  type?: SwalType;
  title: string;
  text?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function SwalAlert({
  visible,
  type = 'success',
  title,
  text,
  confirmText = 'OK',
  onConfirm,
}: SwalAlertOptions) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { symbol: '✓', color: '#10B981', bgColor: '#D1FAE5' };
      case 'error':
        return { symbol: '✕', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'warning':
        return { symbol: '!', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'info':
        return { symbol: 'i', color: '#3B82F6', bgColor: '#DBEAFE' };
      default:
        return { symbol: '✓', color: '#10B981', bgColor: '#D1FAE5' };
    }
  };

  const iconInfo = getIcon();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.swalCard}>
          {/* Animated Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: iconInfo.bgColor }]}>
            <Text style={[styles.iconSymbol, { color: iconInfo.color }]}>{iconInfo.symbol}</Text>
          </View>

          {/* Title & Body Text */}
          <Text style={styles.titleText}>{title}</Text>
          {text && <Text style={styles.bodyText}>{text}</Text>}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: type === 'error' ? color.accentRed : color.primaryGold },
            ]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  swalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSymbol: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

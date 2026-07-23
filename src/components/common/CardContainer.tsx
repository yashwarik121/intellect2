import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { color } from '../../assets/colors/globalColor';

interface CardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContainer({ children, style }: CardContainerProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

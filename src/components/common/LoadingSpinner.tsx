import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { color } from '../../assets/colors/globalColor';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { IntellectLogo } from '../../components/common/IntellectLogo';
import { color } from '../../assets/colors/globalColor';
import { storageService } from '../../services/storageService';

interface SplashPageProps {
  onFinish: (isLoggedIn: boolean, user?: any) => void;
}

export default function SplashPage({ onFinish }: SplashPageProps) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const activeUser = await storageService.getSessionUser();
      if (activeUser) {
        onFinish(true, activeUser);
      } else {
        onFinish(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <IntellectLogo scale={1.2} />
      </View>
      <View style={styles.bottomBox}>
        <ActivityIndicator size="large" color={color.primaryGold} />
        <Text style={styles.loadingText}>Loading Portal...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBox: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: '500',
  },
});

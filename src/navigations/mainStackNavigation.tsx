import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import SplashPage from '../pages/splash/splashPage';
import LoginPage from '../pages/auth/loginPage';
import DashboardPage from '../pages/dashboard/dashboardPage';
import { RegisteredUser } from '../services/storageService';

type NavigationState = 'SPLASH' | 'AUTH' | 'DASHBOARD';

export default function MainStackNavigation() {
  const [navState, setNavState] = useState<NavigationState>('SPLASH');
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  const handleSplashFinish = (isLoggedIn: boolean, user?: RegisteredUser) => {
    if (isLoggedIn && user) {
      setCurrentUser(user);
      setNavState('DASHBOARD');
    } else {
      setNavState('AUTH');
    }
  };

  const handleLoginSuccess = (user: RegisteredUser) => {
    setCurrentUser(user);
    setNavState('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNavState('AUTH');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {navState === 'SPLASH' && (
        <SplashPage onFinish={handleSplashFinish} />
      )}

      {navState === 'AUTH' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {navState === 'DASHBOARD' && (
        <DashboardPage user={currentUser} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

import React from 'react';
import { View, Text } from 'react-native';
import LoginPage from '../pages/auth/loginPage';

export default function AuthNavigation() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LoginPage />
    </View>
  );
}

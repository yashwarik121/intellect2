import React from 'react';
import { View, Text } from 'react-native';
import DashboardPage from '../pages/dashboard/dashboardPage';

export default function MainStackNavigation() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <DashboardPage />
    </View>
  );
}

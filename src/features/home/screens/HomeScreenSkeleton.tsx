import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export function HomeScreenSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F2', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00BB78" />
    </View>
  );
}

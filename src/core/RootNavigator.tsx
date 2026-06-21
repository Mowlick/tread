import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from '../navigation/BottomTabNavigator';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { AssessmentScreen } from '../features/assessment/screens/AssessmentScreen';
import { AuthScreen } from '../features/auth/screens/AuthScreen';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useAuthStore } from '../store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { hasCompletedOnboarding, hasCompletedAssessment } = useOnboardingStore();
  const { session, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <View className="flex-1 bg-[#F4F5F2] items-center justify-center">
        <ActivityIndicator size="large" color="#00BB78" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !hasCompletedAssessment ? (
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

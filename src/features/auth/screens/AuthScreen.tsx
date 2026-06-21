import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Premium Micro-animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) Alert.alert('Error', error.message);
    } catch (e: any) {
      Alert.alert('Connection Error', 'Could not connect to Supabase. Have you set up your .env file with the correct URL and API keys?');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) Alert.alert('Error', error.message);
      else Alert.alert('Success', 'Check your email for the confirmation link!');
    } catch (e: any) {
      Alert.alert('Connection Error', 'Could not connect to Supabase. Have you set up your .env file with the correct URL and API keys?');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4F5F2] px-6 pt-12">
      <View className="items-center mb-12">
        <View className="w-16 h-16 rounded-full bg-[#00BB78]/10 items-center justify-center mb-4">
          <Text className="text-[#00BB78] font-space text-2xl font-bold">T</Text>
        </View>
        <Text className="text-3xl font-space font-bold text-[#111412] mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text className="text-base text-[#111412]/60 font-inter text-center">
          {isSignUp ? 'Start your journey to a lighter footprint.' : 'Pick up where you left off.'}
        </Text>
      </View>

      <Animated.View 
        className="space-y-4"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View>
          <Text className="text-sm font-medium text-[#111412] mb-1.5 font-inter">Email</Text>
          <TextInput
            className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3.5 text-base font-inter text-[#111412]"
            placeholder="email@example.com"
            placeholderTextColor="#11141240"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-[#111412] mb-1.5 font-inter">Password</Text>
          <TextInput
            className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3.5 text-base font-inter text-[#111412]"
            placeholder="••••••••"
            placeholderTextColor="#11141240"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className={`w-full bg-[#111412] rounded-full py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
          onPress={isSignUp ? signUpWithEmail : signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[#F4F5F2] font-semibold text-lg font-space">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-[#111412]/60 font-inter">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text className="text-[#00BB78] font-semibold font-inter">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

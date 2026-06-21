import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Home, BarChart2, Target, User } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse } from 'react-native-svg';

// Screens
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { TrackScreen } from '../features/track/screens/TrackScreen';
import { GoalsScreen } from '../features/goals/screens/GoalsScreen';
import { SolChatScreen } from '../features/sol/screens/SolChatScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { SolOrb } from '../components/motion/SolOrb';

// Real sub-page screens
import { InsightsScreen } from '../features/track/screens/InsightsScreen';
import { ChallengesScreen } from '../features/goals/screens/ChallengesScreen';
import { RewardsScreen } from '../features/profile/screens/RewardsScreen';
import { CommunityScreen } from '../features/profile/screens/CommunityScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';

// Household sub-screen (simple – household mgmt belongs to Profile)
function HouseholdScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F2', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Manrope', fontSize: 22, fontWeight: '700', color: '#161816' }}>Household</Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#6B716D', marginTop: 8 }}>Manage your household members</Text>
    </View>
  );
}

// Stacks for screens with sub-pages
const TrackStack = createNativeStackNavigator();
function TrackStackScreen() {
  return (
    <TrackStack.Navigator screenOptions={{ headerShown: false }}>
      <TrackStack.Screen name="TrackMain" component={TrackScreen} />
      <TrackStack.Screen name="Insights" component={InsightsScreen} />
    </TrackStack.Navigator>
  );
}

const GoalsStack = createNativeStackNavigator();
function GoalsStackScreen() {
  return (
    <GoalsStack.Navigator screenOptions={{ headerShown: false }}>
      <GoalsStack.Screen name="GoalsMain" component={GoalsScreen} />
      <GoalsStack.Screen name="Challenges" component={ChallengesScreen} />
    </GoalsStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Rewards" component={RewardsScreen} />
      <ProfileStack.Screen name="Community" component={CommunityScreen} />
      <ProfileStack.Screen name="Household" component={HouseholdScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// Custom tab bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const focusedRoute = state.routes[state.index];
  if (focusedRoute.name === 'SolTab') {
    return null;
  }

  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.bar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = index === 2; // Sol center slot

          if (isCenter) {
            // Sol orb center button
            return (
              <TouchableOpacity
                key={route.key}
                style={tabStyles.centerWrapper}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.88}
              >
                {/* Elevated pill behind the orb */}
                <View style={[tabStyles.centerPill, isFocused && tabStyles.centerPillActive]}>
                  <SolOrb size={42} />
                </View>
                <Text style={[tabStyles.tabLabel, isFocused ? tabStyles.tabLabelActive : tabStyles.tabLabelInactive]}>
                  Sol
                </Text>
              </TouchableOpacity>
            );
          }

          const Icon = options.tabBarIcon;
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(route.name)}
            >
              <Icon
                size={22}
                color={isFocused ? '#00BB78' : 'rgba(243,246,243,0.45)'}
                strokeWidth={isFocused ? 2.2 : 1.5}
              />
              <Text
                style={[
                  tabStyles.tabLabel,
                  isFocused ? tabStyles.tabLabelActive : tabStyles.tabLabelInactive,
                ]}
              >
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 18,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#111412',
    borderRadius: 26,
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  // Center Sol slot
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  centerPill: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,187,120,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,187,120,0.2)',
  },
  centerPillActive: {
    backgroundColor: 'rgba(0,187,120,0.18)',
    borderColor: 'rgba(165,255,167,0.4)',
    shadowColor: '#00BB78',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelActive: { color: '#00BB78' },
  tabLabelInactive: { color: 'rgba(243,246,243,0.4)' },
});

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="TrackTab"
        component={TrackStackScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <BarChart2 color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="SolTab"
        component={SolChatScreen}
        options={{
          title: 'Sol',
          tabBarIcon: () => null, // handled by custom center slot
        }}
      />
      <Tab.Screen
        name="GoalsTab"
        component={GoalsStackScreen}
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Target color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

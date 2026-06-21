import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Flame, TrendingDown, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CarbonRing } from '../../../components/motion/CarbonRing';
import { SolOrb } from '../../../components/motion/SolOrb';

import { HomeScreenSkeleton } from './HomeScreenSkeleton'; // We'll create this or just use simple loaders
import { useHomeData } from '../../../hooks/useHomeData';
import { useAuthStore } from '../../../store/useAuthStore';
import { ActivityIndicator } from 'react-native';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  
  const { 
    monthlyFootprint, 
    streak, 
    todayMission, 
    activeGoal, 
    weeklyReview, 
    completeMission, 
    isLoading 
  } = useHomeData(user?.id);

  if (isLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00BB78" />
      </View>
    );
  }

  const footprint = monthlyFootprint ? Math.round(monthlyFootprint.currentTotal) : 0;
  const trendPct = monthlyFootprint ? Math.round(monthlyFootprint.trendPct) : 0;
  
  // Use goal baseline if active, else 600kg default
  const goalBaseline = activeGoal ? activeGoal.baseline_co2_kg : 600;
  const goalTarget = activeGoal ? goalBaseline * (1 - activeGoal.target_pct) : goalBaseline * 0.8;
  const progress = activeGoal ? Math.min(footprint / goalTarget, 1) : Math.min(footprint / goalTarget, 1);
  const ringProgress = 1 - Math.min(footprint / goalBaseline, 1); 

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {firstName}</Text>
          <View style={styles.streakPill}>
            <Flame size={14} color="#00BB78" fill="rgba(0,187,120,0.2)" />
            <Text style={styles.streakCount}>{streak || 0}</Text>
          </View>
        </View>

        {/* Hero Carbon Ring — carries the ONLY glow on this screen */}
        <View style={styles.ringArea}>
          <CarbonRing progress={ringProgress} size={220} strokeWidth={14} showGlow>
            <View style={styles.ringContent}>
              <Text style={styles.ringLabel}>Monthly footprint</Text>
              <Text style={styles.ringUnit}>kg CO₂e</Text>
              <Text style={styles.ringMetric}>{footprint}</Text>
              <View style={styles.ringTrend}>
                <TrendingDown size={12} color={trendPct > 0 ? "#00BB78" : "#E54D2E"} />
                <Text style={[styles.ringTrendText, trendPct <= 0 && { color: "#E54D2E" }]}>
                  {Math.abs(trendPct)}% vs last month
                </Text>
              </View>
            </View>
          </CarbonRing>
        </View>

        {/* Sol insight card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <SolOrb size={44} showGlow={false} />
            <View style={styles.solTextArea}>
              <Text style={styles.solTitle}>Sol</Text>
              <Text style={styles.solBody}>
                Great momentum, Alex. Keep stacking small wins—your impact is compounding.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SolTab')}>
                <Text style={styles.solLink}>Chat with Sol →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily mission card */}
        <View style={styles.missionCard}>
          <TouchableOpacity 
            style={[styles.missionCheckbox, todayMission?.completed && { backgroundColor: '#00BB78' }]} 
            onPress={() => {
              if (todayMission && !todayMission.completed) {
                completeMission(todayMission.date);
              }
            }}
          />
          <View style={styles.missionTextArea}>
            <Text style={styles.missionLabel}>Today's mission</Text>
            <Text style={styles.missionTitle}>
              {todayMission ? todayMission.action_text : "Loading mission..."}
            </Text>
          </View>
          <Text style={styles.missionXP}>+{todayMission?.xp_reward || 0} XP</Text>
        </View>

        {/* Monthly progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressCaption}>Monthly progress</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressValue}>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressOf}> of {Math.round(goalTarget)} kg CO₂e goal</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.trackLabel}>0</Text>
            <Text style={styles.trackLabel}>{Math.round(goalTarget / 2)}</Text>
            <Text style={styles.trackLabel}>{Math.round(goalTarget)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F2' },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Manrope',
    fontSize: 26,
    fontWeight: '700',
    color: '#161816',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.12)',
    backgroundColor: '#FFFFFF',
  },
  streakCount: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
    color: '#161816',
  },

  // Ring
  ringArea: { alignItems: 'center', marginBottom: 28 },
  ringContent: { alignItems: 'center' },
  ringLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#F3F6F3',
    opacity: 0.7,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  ringUnit: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#F3F6F3',
    opacity: 0.6,
  },
  ringMetric: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 54,
    fontWeight: '700',
    color: '#F3F6F3',
    lineHeight: 60,
    marginTop: 2,
  },
  ringTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ringTrendText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#00BB78',
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  solTextArea: { flex: 1 },
  solTitle: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    color: '#161816',
    marginBottom: 4,
  },
  solBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#161816',
    lineHeight: 20,
    marginBottom: 8,
  },
  solLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#00BB78',
    fontWeight: '500',
  },

  // Mission
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  missionCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#00BB78',
  },
  missionTextArea: { flex: 1 },
  missionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#6B716D',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  missionTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#161816',
    lineHeight: 20,
  },
  missionXP: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 13,
    fontWeight: '600',
    color: '#6B716D',
  },

  // Progress
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 16,
    marginBottom: 4,
  },
  progressCaption: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B716D',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  progressRow: { marginBottom: 10 },
  progressValue: { fontFamily: 'Inter', fontSize: 14 },
  progressPct: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 22,
    fontWeight: '700',
    color: '#161816',
  },
  progressOf: { fontSize: 13, color: '#6B716D' },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(29,31,30,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00BB78',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#6B716D',
  },
});

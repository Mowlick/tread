import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { ChevronRight, Leaf, FlaskConical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CarbonRing } from '../../../components/motion/CarbonRing';

const GOAL_DRIVERS = [
  'More plant-based meals',
  'Choosing low-carbon transport',
  'Lower home energy use',
];

const DURATIONS = [30, 60, 90];

export function GoalsScreen() {
  const navigation = useNavigation<any>();
  const [targetCO2, setTargetCO2] = useState(400);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const goalProgress = 0.68;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>Build habits. Lower carbon.</Text>
        </View>

        {/* Progress ring — carries the ONLY glow on this screen */}
        <View style={styles.ringArea}>
          <CarbonRing progress={goalProgress} size={200} strokeWidth={14} showGlow>
            <View style={styles.ringContent}>
              <Text style={styles.ringLabel}>Goal progress</Text>
              <Text style={styles.ringPct}>
                <Text style={styles.pctNum}>68</Text>
                <Text style={styles.pctSymbol}>%</Text>
              </Text>
              <Text style={styles.ringDay}>
                Day <Text style={styles.dayNum}>24</Text> of 60
              </Text>
            </View>
          </CarbonRing>
        </View>

        {/* Goal drivers card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's driving your progress</Text>
          {GOAL_DRIVERS.map((driver, i) => (
            <View key={i} style={styles.driverRow}>
              <Leaf size={14} color="#00BB78" fill="#00BB78" />
              <Text style={styles.driverText}>{driver}</Text>
            </View>
          ))}
        </View>

        {/* Challenges entry card */}
        <TouchableOpacity
          style={styles.challengesCard}
          onPress={() => navigation.navigate('Challenges')}
          activeOpacity={0.85}
        >
          <View style={styles.challengesIcon}>
            <FlaskConical size={20} color="#00BB78" strokeWidth={1.8} />
          </View>
          <View style={styles.challengesText}>
            <Text style={styles.challengesTitle}>Challenges</Text>
            <Text style={styles.challengesSub}>3 active near you</Text>
          </View>
          <ChevronRight size={18} color="#6B716D" />
        </TouchableOpacity>

        {/* Set a New Goal */}
        <Text style={styles.sectionTitle}>Set a New Goal</Text>

        <View style={styles.card}>
          <Text style={styles.sliderLabel}>Monthly carbon target</Text>
          <Text style={styles.targetValue}>
            <Text style={styles.targetNum}>{targetCO2}</Text>
            <Text style={styles.targetUnit}> kg CO₂e</Text>
          </Text>

          {/* Slider track */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((targetCO2 - 100) / 700) * 100}%` }]} />
            <View style={styles.sliderThumb} />
          </View>
          <View style={styles.sliderBounds}>
            <Text style={styles.boundLabel}>100</Text>
            <Text style={styles.boundLabel}>800</Text>
          </View>

          {/* Duration pills */}
          <Text style={styles.durationLabel}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationPill, selectedDuration === d && styles.durationPillActive]}
                onPress={() => setSelectedDuration(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedDuration === d && styles.durationTextActive,
                  ]}
                >
                  {d} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sol recommendation */}
        <View style={styles.solCard}>
          <View style={styles.solCardHeader}>
            <View style={styles.solDot} />
            <Text style={styles.solCardTitle}>Sol's recommendation</Text>
          </View>
          <Text style={styles.solCardBody}>
            To reach {targetCO2} kg CO₂e in {selectedDuration} days, focus here:
          </Text>
          {['Go car-free 2+ days each week', 'Keep meals mostly plant-based', 'Lower energy use by 10%'].map(
            (rec, i) => (
              <View key={i} style={styles.driverRow}>
                <Leaf size={13} color="#00BB78" fill="#00BB78" />
                <Text style={styles.solRecText}>{rec}</Text>
              </View>
            )
          )}
          <Text style={styles.solFooter}>Small shifts, big impact.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F2' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { paddingTop: 12, marginBottom: 8 },
  title: { fontFamily: 'Manrope', fontSize: 28, fontWeight: '700', color: '#161816' },
  subtitle: { fontFamily: 'Inter', fontSize: 14, color: '#6B716D', marginTop: 2 },

  ringArea: { alignItems: 'center', marginVertical: 20 },
  ringContent: { alignItems: 'center' },
  ringLabel: { fontFamily: 'Inter', fontSize: 11, color: '#F3F6F3', opacity: 0.7, marginBottom: 4 },
  ringPct: { flexDirection: 'row', alignItems: 'flex-start' },
  pctNum: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 52,
    fontWeight: '700',
    color: '#F3F6F3',
    lineHeight: 58,
  },
  pctSymbol: { fontFamily: 'SpaceGrotesk', fontSize: 24, fontWeight: '700', color: '#F3F6F3', marginTop: 12 },
  ringDay: { fontFamily: 'Inter', fontSize: 13, color: '#F3F6F3', opacity: 0.7, marginTop: 4 },
  dayNum: { color: '#00BB78', fontWeight: '700', opacity: 1 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#6B716D',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  driverText: { fontFamily: 'Inter', fontSize: 14, color: '#161816' },

  challengesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  challengesIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0,187,120,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengesText: { flex: 1 },
  challengesTitle: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: '#161816' },
  challengesSub: { fontFamily: 'Inter', fontSize: 13, color: '#6B716D', marginTop: 2 },

  sectionTitle: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '700',
    color: '#161816',
    marginBottom: 12,
  },

  sliderLabel: { fontFamily: 'Inter', fontSize: 12, color: '#6B716D', marginBottom: 4 },
  targetValue: { marginBottom: 16 },
  targetNum: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 38,
    fontWeight: '700',
    color: '#00BB78',
  },
  targetUnit: { fontFamily: 'Inter', fontSize: 14, color: '#6B716D' },

  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(29,31,30,0.10)',
    borderRadius: 3,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#00BB78',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    right: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#A5FFA7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderBounds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  boundLabel: { fontFamily: 'Inter', fontSize: 11, color: '#6B716D' },

  durationLabel: { fontFamily: 'Inter', fontSize: 12, color: '#6B716D', marginBottom: 8 },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.12)',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  durationPillActive: {
    borderColor: '#00BB78',
    borderWidth: 1.5,
  },
  durationText: { fontFamily: 'Inter', fontSize: 14, color: '#6B716D' },
  durationTextActive: { color: '#00BB78', fontWeight: '700' },

  solCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 18,
    marginBottom: 8,
  },
  solCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  solDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,187,120,0.2)',
    borderWidth: 1.5,
    borderColor: '#00BB78',
  },
  solCardTitle: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '700', color: '#161816' },
  solCardBody: { fontFamily: 'Inter', fontSize: 13, color: '#6B716D', marginBottom: 12, lineHeight: 19 },
  solRecText: { fontFamily: 'Inter', fontSize: 14, color: '#161816' },
  solFooter: { fontFamily: 'Inter', fontSize: 13, color: '#6B716D', marginTop: 12, fontStyle: 'italic' },
});

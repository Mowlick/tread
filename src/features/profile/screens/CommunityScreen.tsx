import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: W } = Dimensions.get('window');

const C = {
  canvas:   '#F4F5F2',
  white:    '#FFFFFF',
  stone:    '#ECEEEA',
  green:    '#00BB78',
  mint:     '#A5FFA7',
  granite:  '#6B716D',
  text:     '#161816',
  border:   'rgba(29,31,30,0.09)',
};

// ─── Data ─────────────────────────────────────────────────────────────────
const FRIENDS = [
  { id: 'f1', initial: 'A', name: 'Aisha M.',    pct: 28, isSelf: false },
  { id: 'f2', initial: 'Y', name: 'You',          pct: 22, isSelf: true  },
  { id: 'f3', initial: 'R', name: 'Rohan P.',     pct: 19, isSelf: false },
  { id: 'f4', initial: 'C', name: 'Clara B.',     pct: 15, isSelf: false },
  { id: 'f5', initial: 'D', name: 'David K.',     pct: 11, isSelf: false },
];

const HOUSEHOLD = [
  { id: 'h1', initial: 'Y', name: 'You',        pct: 0.68 },
  { id: 'h2', initial: 'M', name: 'Maya',       pct: 0.52 },
  { id: 'h3', initial: 'J', name: 'James',      pct: 0.38 },
  { id: 'h4', initial: 'L', name: 'Lily',       pct: 0.45 },
];

// ─── Ring helpers ─────────────────────────────────────────────────────────
function RingLarge({ pct }: { pct: number }) {
  const size = 130;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const breathe = useSharedValue(1);
  const glowAlpha = useSharedValue(0.6);

  React.useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.00, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
    glowAlpha.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const glowStyle    = useAnimatedStyle(() => ({ opacity: glowAlpha.value }));

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[styles.largeGlow, glowStyle]} pointerEvents="none" />
      <Animated.View style={breatheStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="lgRing" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={C.green} />
              <Stop offset="100%" stopColor={C.mint} />
            </LinearGradient>
          </Defs>
          <Circle cx={size/2} cy={size/2} r={r} stroke={C.stone} strokeWidth={10} fill="none" />
          <Circle
            cx={size/2} cy={size/2} r={r}
            stroke="url(#lgRing)"
            strokeWidth={10}
            fill="none"
            strokeDasharray={`${circ * pct} ${circ}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size/2},${size/2}`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
          <Text style={styles.ringLabel}>combined</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function RingSmall({ pct, initial, name }: { pct: number; initial: string; name: string }) {
  const size = 56;
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center', width: 64 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={C.stone} strokeWidth={5} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={C.green}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2},${size/2}`}
        />
        <Circle cx={size/2} cy={size/2} r={r - 8} fill={C.stone} />
      </Svg>
      {/* Overlay initial */}
      <View style={[styles.smallAvatarOverlay, { top: 11 }]}>
        <Text style={styles.smallInitial}>{initial}</Text>
      </View>
      <Text style={styles.smallName} numberOfLines={1}>{name}</Text>
    </View>
  );
}

// ─── CommunityScreen ──────────────────────────────────────────────────────
export function CommunityScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'friends' | 'household'>('friends');

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segWrapper}>
        <View style={styles.segControl}>
          {(['friends', 'household'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.segTab, tab === t && styles.segTabActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segLabel, tab === t && styles.segLabelActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {tab === 'friends' ? (
          /* ── Friends leaderboard ── */
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IMPROVEMENT THIS MONTH</Text>
            <View style={{ gap: 10 }}>
              {FRIENDS.map((f, idx) => (
                <View key={f.id} style={[styles.friendRow, f.isSelf && styles.friendRowSelf]}>
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{f.initial}</Text>
                  </View>
                  <Text style={[styles.friendName, f.isSelf && styles.friendNameSelf]}>{f.name}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.friendArrow}>↑</Text>
                  <Text style={styles.friendPct}>{f.pct}%</Text>
                </View>
              ))}
            </View>
            <Text style={styles.leaderboardNote}>
              Rankings show percentage improvement from each person's own baseline — not absolute footprint.
            </Text>
          </View>
        ) : (
          /* ── Household view ── */
          <View>
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={styles.sectionLabel}>HOUSEHOLD PROGRESS</Text>
              <RingLarge pct={0.57} />
              <Text style={styles.householdGoal}>Goal: 280 kg CO₂e · Month</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MEMBER CONTRIBUTIONS</Text>
              <View style={styles.memberGrid}>
                {HOUSEHOLD.map(m => (
                  <RingSmall key={m.id} pct={m.pct} initial={m.initial} name={m.name} />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Collective Impact Banner (always shown) ── */}
        <View style={styles.impactBanner}>
          <View>
            <Text style={styles.impactLabel}>COLLECTIVE COMMUNITY IMPACT</Text>
            <Text style={styles.impactMetric}>12,840 <Text style={styles.impactUnit}>kg CO₂e saved</Text></Text>
          </View>
          <Text style={styles.impactSub}>Across 847 Tread users this month</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '700', color: C.text },

  segWrapper: { paddingHorizontal: 20, paddingVertical: 14 },
  segControl: {
    flexDirection: 'row',
    backgroundColor: C.stone,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    padding: 3,
  },
  segTab: { flex: 1, paddingVertical: 8, borderRadius: 11, alignItems: 'center' },
  segTabActive: {
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  segLabel: { fontFamily: 'Inter', fontSize: 14, color: C.granite },
  segLabelActive: { color: C.green, fontWeight: '600' },

  scroll: { paddingTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 12,
  },

  // Friends
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  friendRowSelf: {
    backgroundColor: 'rgba(165,255,167,0.08)',
    borderColor: 'rgba(0,187,120,0.14)',
  },
  rankNum: { fontFamily: 'SpaceGrotesk', fontSize: 12, color: C.granite, width: 22 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,187,120,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '700', color: C.green },
  friendName: { fontFamily: 'Inter', fontSize: 14, color: C.text },
  friendNameSelf: { fontWeight: '600', color: C.text },
  friendArrow: { fontFamily: 'SpaceGrotesk', fontSize: 14, color: C.green },
  friendPct: { fontFamily: 'SpaceGrotesk', fontSize: 14, fontWeight: '600', color: C.green, minWidth: 38, textAlign: 'right' },
  leaderboardNote: { fontFamily: 'Inter', fontSize: 12, color: C.granite, lineHeight: 18, marginTop: 14, opacity: 0.75 },

  // Household ring
  largeGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(165,255,167,0.10)',
    alignSelf: 'center',
    top: -25,
  },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontFamily: 'SpaceGrotesk', fontSize: 26, fontWeight: '700', color: C.text },
  ringLabel: { fontFamily: 'Inter', fontSize: 11, color: C.granite },
  householdGoal: { fontFamily: 'Inter', fontSize: 13, color: C.granite, marginTop: 10 },

  // Small ring avatars
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  smallAvatarOverlay: { position: 'absolute', alignSelf: 'center' },
  smallInitial: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '700', color: C.text },
  smallName: { fontFamily: 'Inter', fontSize: 11, color: C.granite, marginTop: 4, textAlign: 'center' },

  // Impact banner
  impactBanner: {
    marginHorizontal: 20,
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 12,
  },
  impactLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  impactMetric: { fontFamily: 'SpaceGrotesk', fontSize: 22, fontWeight: '700', color: C.text },
  impactUnit: { fontFamily: 'Inter', fontSize: 14, fontWeight: '400', color: C.granite },
  impactSub: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginTop: 4 },
});

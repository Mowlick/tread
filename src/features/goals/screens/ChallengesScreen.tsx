import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowLeft, ChevronRight, Users, Zap } from 'lucide-react-native';
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
  charcoal: '#1D1F1E',
  green:    '#00BB78',
  mint:     '#A5FFA7',
  granite:  '#6B716D',
  text:     '#161816',
  amber:    '#E8833A',
  border:   'rgba(29,31,30,0.09)',
};

// ─── Featured challenge data ───────────────────────────────────────────────
const FEATURED = [
  {
    id: 'f1',
    title: 'No-Car November',
    desc: 'Avoid car trips for the entire month',
    countdown: '9 days left',
    participants: '2.4k',
    seasonal: true,   // gets the glow
    icon: '🚲',
  },
  {
    id: 'f2',
    title: 'Plant Week',
    desc: 'One plant-based meal every day',
    countdown: '22 days left',
    participants: '1.1k',
    seasonal: false,
    icon: '🥗',
  },
  {
    id: 'f3',
    title: 'Energy Audit',
    desc: 'Reduce home energy by 15%',
    countdown: '14 days left',
    participants: '876',
    seasonal: false,
    icon: '⚡',
  },
];

const YOUR_CHALLENGES = [
  { id: 'y1', title: 'Cycle to Work',      pct: 0.72, participants: '1.2k joined' },
  { id: 'y2', title: 'Meatless Mondays',   pct: 0.55, participants: '3.4k joined' },
  { id: 'y3', title: '5-Minute Showers',   pct: 0.38, participants: '945 joined'  },
];

// ─── Mini ring SVG ─────────────────────────────────────────────────────────
function MiniRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const stroke = circ * pct;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id={`rg_${pct}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={C.green} />
          <Stop offset="100%" stopColor={C.mint} />
        </LinearGradient>
      </Defs>
      <Circle cx={size/2} cy={size/2} r={r} stroke={C.stone} strokeWidth={3} fill="none" />
      <Circle
        cx={size/2} cy={size/2} r={r}
        stroke={`url(#rg_${pct})`}
        strokeWidth={3}
        fill="none"
        strokeDasharray={`${stroke} ${circ}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size/2},${size/2}`}
      />
    </Svg>
  );
}

// ─── Featured card ─────────────────────────────────────────────────────────
function FeaturedCard({ ch }: { ch: typeof FEATURED[0] }) {
  const breathe = useSharedValue(1);
  const glowOpacity = useSharedValue(0.7);

  React.useEffect(() => {
    if (!ch.seasonal) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.00, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.featCard, cardStyle]}>
      {ch.seasonal && (
        <Animated.View style={[styles.featGlow, glowStyle]} pointerEvents="none" />
      )}
      {/* Countdown chip */}
      <View style={styles.countdownChip}>
        <Text style={styles.countdownText}>{ch.countdown}</Text>
      </View>
      {/* Illustration area */}
      <Text style={styles.featIcon}>{ch.icon}</Text>
      <Text style={styles.featTitle}>{ch.title}</Text>
      <Text style={styles.featDesc}>{ch.desc}</Text>
      <View style={styles.featFooter}>
        <Users size={12} color={C.granite} strokeWidth={1.5} />
        <Text style={styles.featParticipants}>{ch.participants} joined</Text>
      </View>
    </Animated.View>
  );
}

// ─── ChallengesScreen ──────────────────────────────────────────────────────
export function ChallengesScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Featured ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FEATURED</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingRight: 20 }}
            decelerationRate="fast"
            snapToInterval={268 + 14}
          >
            {FEATURED.map(ch => <FeaturedCard key={ch.id} ch={ch} />)}
          </ScrollView>
        </View>

        {/* ── Your Challenges ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR CHALLENGES</Text>
          <View style={{ gap: 10 }}>
            {YOUR_CHALLENGES.map(ch => (
              <TouchableOpacity key={ch.id} style={styles.yourCard} activeOpacity={0.82}>
                <MiniRing pct={ch.pct} size={44} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.yourTitle}>{ch.title}</Text>
                  <Text style={styles.yourParticipants}>{ch.participants}</Text>
                </View>
                <View style={styles.pctTag}>
                  <Text style={styles.pctText}>{Math.round(ch.pct * 100)}%</Text>
                </View>
                <ChevronRight size={16} color={C.granite} strokeWidth={1.5} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Discover More ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISCOVER</Text>
          <TouchableOpacity style={[styles.yourCard, { justifyContent: 'space-between' }]} activeOpacity={0.82}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.discoverIcon}>
                <Zap size={18} color={C.green} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.yourTitle}>Browse all challenges</Text>
                <Text style={styles.yourParticipants}>12 new this week</Text>
              </View>
            </View>
            <ChevronRight size={16} color={C.granite} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const FEAT_W = 260;
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
  scroll: { paddingTop: 12 },
  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 12,
  },

  // Featured card
  featCard: {
    width: FEAT_W,
    backgroundColor: C.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    padding: 18,
    overflow: 'visible',
  },
  featGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 42,
    backgroundColor: 'rgba(165,255,167,0.12)',
  },
  countdownChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,187,120,0.10)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,187,120,0.18)',
    marginBottom: 14,
  },
  countdownText: { fontFamily: 'SpaceGrotesk', fontSize: 11, color: C.green, fontWeight: '600' },
  featIcon: { fontSize: 36, marginBottom: 10 },
  featTitle: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 4 },
  featDesc: { fontFamily: 'Inter', fontSize: 13, color: C.granite, lineHeight: 18, marginBottom: 16 },
  featFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featParticipants: { fontFamily: 'Inter', fontSize: 12, color: C.granite },

  // Your challenges
  yourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  yourTitle: { fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: C.text },
  yourParticipants: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginTop: 2 },
  pctTag: {
    backgroundColor: 'rgba(0,187,120,0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pctText: { fontFamily: 'SpaceGrotesk', fontSize: 12, color: C.green, fontWeight: '600' },
  discoverIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,187,120,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,187,120,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

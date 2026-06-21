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
import { ArrowLeft, ChevronRight, Leaf } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');

const C = {
  canvas:   '#F4F5F2',
  white:    '#FFFFFF',
  stone:    '#ECEEEA',
  green:    '#00BB78',
  mint:     '#A5FFA7',
  granite:  '#6B716D',
  text:     '#161816',
  amber:    '#E8833A',
  border:   'rgba(29,31,30,0.09)',
};

// ─── XP hero glow ─────────────────────────────────────────────────────────
function XPHero() {
  const glowScale = useSharedValue(1);
  const glowAlpha = useSharedValue(0.6);

  React.useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.00, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
    glowAlpha.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAlpha.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={styles.xpHeroWrap}>
      <Animated.View style={[styles.xpGlow, glowStyle]} pointerEvents="none" />
      <View style={styles.xpCard}>
        <Text style={styles.xpLabel}>YOUR BALANCE</Text>
        <Text style={styles.xpValue}>4,820</Text>
        <Text style={styles.xpUnit}>XP earned</Text>
      </View>
    </View>
  );
}

// ─── Partner reward cards ─────────────────────────────────────────────────
const REWARDS = [
  { id: 'r1', brand: '🌿 Patagonia',   title: '20% off repair kit',     xp: 1200 },
  { id: 'r2', brand: '🌱 Oatly',       title: 'Free oat latte',         xp: 800  },
  { id: 'r3', brand: '⚡ Bulb Energy',  title: '£5 credit on your bill', xp: 1500 },
  { id: 'r4', brand: '🚲 Brompton',    title: 'Free service check',     xp: 2000 },
  { id: 'r5', brand: '🌍 Ecosia',      title: 'Plant 10 extra trees',   xp: 600  },
];

const CARD_W = 200;

export function RewardsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── XP Balance Hero ── */}
        <View style={styles.section}>
          <XPHero />
        </View>

        {/* ── Partner Rewards ── */}
        <View style={{ marginBottom: 28 }}>
          <Text style={[styles.sectionLabel, { paddingHorizontal: 20 }]}>PARTNER REWARDS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            decelerationRate="fast"
            snapToInterval={CARD_W + 14}
          >
            {REWARDS.map(r => (
              <TouchableOpacity key={r.id} style={styles.rewardCard} activeOpacity={0.82}>
                <Text style={styles.rewardBrand}>{r.brand}</Text>
                <Text style={styles.rewardTitle}>{r.title}</Text>
                <View style={styles.rewardFooter}>
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>{r.xp.toLocaleString()} XP</Text>
                  </View>
                  <ChevronRight size={14} color={C.granite} strokeWidth={1.5} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Carbon Removal (subdued) ── */}
        <View style={[styles.section, { paddingTop: 4 }]}>
          <View style={styles.divider} />
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CLIMATE ACTION</Text>
          <TouchableOpacity style={styles.removalCard} activeOpacity={0.82}>
            <View style={styles.removalLeft}>
              <Leaf size={18} color={C.granite} strokeWidth={1.5} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.removalTitle}>Fund a Verified Removal Project</Text>
                <Text style={styles.removalDesc}>
                  Direct carbon removal via biochar or ocean capture. Available from 200 XP.
                </Text>
              </View>
            </View>
            <ChevronRight size={14} color={C.granite} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* ── How you earn XP ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW YOU EARN</Text>
          <View style={styles.earnCard}>
            {[
              { action: 'Log an activity',           xp: '+10 XP' },
              { action: 'Complete a daily mission',  xp: '+25 XP' },
              { action: 'Finish a challenge',        xp: '+150 XP' },
              { action: 'Hit a monthly goal',        xp: '+300 XP' },
            ].map((row, i, arr) => (
              <View key={row.action}>
                <View style={styles.earnRow}>
                  <Text style={styles.earnAction}>{row.action}</Text>
                  <Text style={styles.earnXp}>{row.xp}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>
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
  scroll: { paddingTop: 12 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 12,
  },

  // XP Hero
  xpHeroWrap: { alignItems: 'center', marginBottom: 4 },
  xpGlow: {
    position: 'absolute',
    width: W * 0.7,
    height: W * 0.7,
    borderRadius: W * 0.35,
    backgroundColor: 'rgba(165,255,167,0.09)',
    alignSelf: 'center',
  },
  xpCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    paddingHorizontal: 40,
    paddingVertical: 28,
    alignItems: 'center',
    width: W - 40,
  },
  xpLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  xpValue: { fontFamily: 'SpaceGrotesk', fontSize: 52, fontWeight: '700', color: C.text, lineHeight: 56 },
  xpUnit: { fontFamily: 'Inter', fontSize: 14, color: C.granite, marginTop: 4 },

  // Reward cards
  rewardCard: {
    width: CARD_W,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  rewardBrand: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginBottom: 8 },
  rewardTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '600', color: C.text, lineHeight: 20, flex: 1 },
  rewardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  xpPill: {
    backgroundColor: C.green,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpPillText: { fontFamily: 'SpaceGrotesk', fontSize: 11, fontWeight: '600', color: '#FFFFFF' },

  // Removal card (subdued)
  removalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.07)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  removalLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  removalTitle: { fontFamily: 'Inter', fontSize: 13, fontWeight: '500', color: C.granite },
  removalDesc: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginTop: 2, lineHeight: 17, opacity: 0.75 },

  divider: { height: 1, backgroundColor: 'rgba(29,31,30,0.07)' },

  // Earn rows
  earnCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.09)',
    overflow: 'hidden',
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  earnAction: { fontFamily: 'Inter', fontSize: 14, color: C.text },
  earnXp: { fontFamily: 'SpaceGrotesk', fontSize: 13, fontWeight: '600', color: C.green },
  rowDivider: { height: 1, backgroundColor: 'rgba(29,31,30,0.06)', marginHorizontal: 16 },
});

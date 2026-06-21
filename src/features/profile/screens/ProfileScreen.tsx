import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {
  Leaf,
  Users,
  UserPlus,
  Settings,
  ChevronRight,
  Plus,
  Flame,
} from 'lucide-react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
  Path,
  Rect,
  G,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// ─── Growth Tier SVG Illustrations ───────────────────────────────────────────

/** Sapling — two leaves on a stem, more refined than before */
function SaplingIllustration() {
  return (
    <Svg width={110} height={110} viewBox="0 0 110 110">
      <Defs>
        <RadialGradient id="sapGlow" cx="50%" cy="75%" r="45%">
          <Stop offset="0%" stopColor="#A5FFA7" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#A5FFA7" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="sapLeaf1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#A5FFA7" />
          <Stop offset="100%" stopColor="#00BB78" />
        </LinearGradient>
        <LinearGradient id="sapLeaf2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#6FFFB0" />
          <Stop offset="100%" stopColor="#009960" />
        </LinearGradient>
      </Defs>
      {/* Ground glow */}
      <Ellipse cx="55" cy="92" rx="38" ry="12" fill="url(#sapGlow)" />
      {/* Soil dot */}
      <Ellipse cx="55" cy="90" rx="14" ry="5" fill="#6B716D" fillOpacity="0.15" />
      {/* Main stem */}
      <Path
        d="M55 88 C54 75 54 60 55 40"
        stroke="#00BB78"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left leaf — larger */}
      <Path
        d="M55 62 C40 52 28 58 32 74 C36 84 53 84 55 85 Z"
        fill="url(#sapLeaf1)"
      />
      {/* Left leaf vein */}
      <Path d="M55 62 C46 70 38 76 34 82" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
      {/* Right leaf */}
      <Path
        d="M55 50 C68 40 80 48 76 62 C72 72 57 72 55 73 Z"
        fill="url(#sapLeaf2)"
      />
      {/* Right leaf vein */}
      <Path d="M55 50 C64 57 71 64 74 69" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
      {/* Small top bud */}
      <Ellipse cx="55" cy="36" rx="7" ry="5" fill="#A5FFA7" fillOpacity="0.9" />
      {/* Specular on bud */}
      <Ellipse cx="53" cy="34" rx="3" ry="2" fill="#FFFFFF" fillOpacity="0.5" />
    </Svg>
  );
}

const TIERS = ['Sprout', 'Sapling', 'Grove', 'Forest', 'Canopy'];

const BADGES = [
  { id: 'first_step',   label: 'First Step',     earned: true  },
  { id: 'low_carbon',   label: 'Low Carbon',      earned: true  },
  { id: 'energy_save',  label: 'Energy Saver',    earned: true  },
  { id: 'mindful',      label: 'Mindful',         earned: true  },
  { id: 'global',       label: 'Global Thinker',  earned: false },
  { id: 'consistent',   label: 'Consistency',     earned: false },
];

const MENU_ITEMS = [
  {
    id: 'rewards',
    icon: Leaf,
    label: 'Rewards',
    preview: '2,430 XP',
    isMetric: true,
    route: 'Rewards',
    addButton: false,
  },
  {
    id: 'community',
    icon: Users,
    label: 'Community',
    preview: 'Improving faster than 70% of friends',
    isMetric: false,
    route: 'Community',
    addButton: false,
  },
  {
    id: 'household',
    icon: UserPlus,
    label: 'Household',
    preview: '4 members',
    isMetric: false,
    route: 'Household',
    addButton: true,
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    preview: '',
    isMetric: false,
    route: 'Settings',
    addButton: false,
  },
];

// Badge icon — each has a distinct SVG mark
function BadgeIcon({ earned, index }: { earned: boolean; index: number }) {
  const icons = [
    // First Step — footprint
    <Path key="0" d="M12 18 Q8 14 10 9 Q14 6 16 10 Q18 14 14 18Z M18 12 Q16 8 19 6 Q22 5 22 9 Q22 13 19 13Z" fill={earned ? '#00BB78' : '#6B716D'} fillOpacity={earned ? 1 : 0.5} />,
    // Low Carbon — leaf
    <Path key="1" d="M16 22 C8 16 8 6 16 4 C24 6 24 16 16 22Z M16 8 L16 20" stroke={earned ? '#00BB78' : '#6B716D'} strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    // Energy Saver — lightning
    <Path key="2" d="M17 4 L11 14 H16 L13 24 L21 12 H16 L19 4Z" fill={earned ? '#00BB78' : '#6B716D'} fillOpacity={earned ? 1 : 0.5} />,
    // Mindful — circle ripple
    <><Circle key="3a" cx="16" cy="14" r="3" fill={earned ? '#00BB78' : '#6B716D'} fillOpacity={earned ? 1 : 0.5} /><Circle key="3b" cx="16" cy="14" r="6" stroke={earned ? '#00BB78' : '#6B716D'} strokeWidth="1.5" fill="none" strokeOpacity={earned ? 0.5 : 0.3} /></>,
    // Global — globe
    <><Circle key="4a" cx="16" cy="14" r="7" stroke={earned ? '#00BB78' : '#6B716D'} strokeWidth="1.5" fill="none" strokeOpacity={earned ? 0.6 : 0.3} /><Path key="4b" d="M16 7 Q19 10 19 14 Q19 18 16 21 Q13 18 13 14 Q13 10 16 7Z" stroke={earned ? '#00BB78' : '#6B716D'} strokeWidth="1" fill="none" strokeOpacity={earned ? 0.6 : 0.3} /></>,
    // Consistency — calendar check
    <Path key="5" d="M9 8 H23 V22 H9Z M9 11 H23 M13 7 V9 M19 7 V9 M13 16 L15 18 L19 14" stroke={earned ? '#00BB78' : '#6B716D'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={earned ? 1 : 0.4} />,
  ];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      {icons[index] ?? null}
    </Svg>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.profileTop}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>AM</Text>
            </View>
          </View>
          <Text style={styles.userName}>Alex Morgan</Text>
          <Text style={styles.tierLabel}>Growth Tier</Text>
          <Text style={styles.tierName}>Sapling</Text>

          {/* Growth Tier illustration — ONLY glow on this screen */}
          <View style={styles.tierIllustration}>
            <SaplingIllustration />
          </View>
        </View>

        {/* Tier progression strip */}
        <View style={styles.tierStrip}>
          {TIERS.map((t) => (
            <View key={t} style={styles.tierItem}>
              <View style={[styles.tierDot, t === 'Sapling' && styles.tierDotActive]} />
              <Text style={[styles.tierItemLabel, t === 'Sapling' && styles.tierItemLabelActive]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        {/* Badge shelf */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <Text style={styles.badgeTitle}>Badges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgeRow}>
              {BADGES.map((badge, index) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View
                    style={[
                      styles.badgeCircle,
                      badge.earned ? styles.badgeEarned : styles.badgeLocked,
                    ]}
                  >
                    <BadgeIcon earned={badge.earned} index={index} />
                  </View>
                  <Text style={styles.badgeLabel}>{badge.label}</Text>
                  <Text
                    style={[
                      styles.badgeStatus,
                      badge.earned ? styles.badgeStatusEarned : styles.badgeStatusLocked,
                    ]}
                  >
                    {badge.earned ? 'Earned' : 'Locked'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>1,248</Text>
            <Text style={styles.statSub}>CO₂e saved</Text>
            <Text style={styles.statUnit}>kg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <View style={styles.streakRow}>
              <Text style={styles.statValue}>14</Text>
              <Flame size={16} color="#E8833A" fill="rgba(232,131,58,0.2)" />
            </View>
            <Text style={styles.statSub}>Streak</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>2,430</Text>
            <Text style={styles.statSub}>Lifetime XP</Text>
            <Text style={styles.statUnit}>XP</Text>
          </View>
        </View>

        {/* Navigation menu */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuCard,
                  idx < MENU_ITEMS.length - 1 && styles.menuCardBorder,
                ]}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.85}
              >
                <View style={styles.menuIcon}>
                  <Icon size={20} color="#00BB78" strokeWidth={1.8} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <View style={styles.menuRight}>
                  {item.preview ? (
                    <Text
                      style={[
                        styles.menuPreview,
                        item.isMetric && styles.menuPreviewMetric,
                      ]}
                      numberOfLines={1}
                    >
                      {item.preview}
                    </Text>
                  ) : null}
                  {item.addButton && (
                    <View style={styles.addBtn}>
                      <Plus size={13} color="#6B716D" />
                    </View>
                  )}
                  <ChevronRight size={16} color="#6B716D" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F2' },
  scroll: { paddingBottom: 100 }, // space for tab bar

  // Profile top
  profileTop: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: 'rgba(29,31,30,0.10)',
    padding: 3,
    marginBottom: 12,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#ECEEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'Manrope',
    fontSize: 28,
    fontWeight: '700',
    color: '#161816',
  },
  userName: {
    fontFamily: 'Manrope',
    fontSize: 22,
    fontWeight: '700',
    color: '#161816',
    marginBottom: 2,
  },
  tierLabel: { fontFamily: 'Inter', fontSize: 13, color: '#6B716D' },
  tierName: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '700',
    color: '#00BB78',
    marginBottom: 4,
  },
  tierIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },

  // Tier strip
  tierStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  tierItem: { alignItems: 'center', gap: 4 },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4C8C3',
  },
  tierDotActive: {
    backgroundColor: '#00BB78',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierItemLabel: { fontFamily: 'Inter', fontSize: 11, color: '#6B716D' },
  tierItemLabelActive: { color: '#00BB78', fontWeight: '700' },

  // Badges
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 12,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badgeTitle: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
    color: '#161816',
  },
  viewAll: { fontFamily: 'Inter', fontSize: 13, color: '#00BB78' },
  badgeRow: { flexDirection: 'row', gap: 16, paddingBottom: 2 },
  badgeItem: { alignItems: 'center', width: 62 },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeEarned: {
    backgroundColor: 'rgba(0,187,120,0.07)',
    borderWidth: 1.5,
    borderColor: '#00BB78',
  },
  badgeLocked: {
    backgroundColor: '#F4F5F2',
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.10)',
  },
  badgeLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#161816',
    textAlign: 'center',
    lineHeight: 13,
  },
  badgeStatus: { fontFamily: 'Inter', fontSize: 9, marginTop: 2 },
  badgeStatusEarned: { color: '#00BB78' },
  badgeStatusLocked: { color: '#6B716D' },

  // Stats
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(29,31,30,0.08)',
  },
  statValue: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 22,
    fontWeight: '700',
    color: '#161816',
  },
  statSub: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#6B716D',
    marginTop: 2,
    textAlign: 'center',
  },
  statUnit: { fontFamily: 'Inter', fontSize: 9, color: '#6B716D' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Menu
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  menuCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29,31,30,0.06)',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,187,120,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '500',
    color: '#161816',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 180,
  },
  menuPreview: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B716D',
    flex: 1,
    textAlign: 'right',
  },
  menuPreviewMetric: {
    fontFamily: 'SpaceGrotesk',
    fontWeight: '700',
    fontSize: 13,
    color: '#161816',
  },
  addBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const C = {
  canvas:   '#F4F5F2',
  white:    '#FFFFFF',
  stone:    '#ECEEEA',
  green:    '#00BB78',
  granite:  '#6B716D',
  text:     '#161816',
  red:      '#BA1A1A',
  border:   'rgba(29,31,30,0.09)',
  divider:  'rgba(29,31,30,0.07)',
};

// ─── Toggle Row ──────────────────────────────────────────────────────────
function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.stone, true: 'rgba(0,187,120,0.30)' }}
        thumbColor={value ? C.green : C.granite}
        ios_backgroundColor={C.stone}
        style={{ transform: [{ scale: 0.88 }] }}
      />
    </View>
  );
}

// ─── Navigation Row ──────────────────────────────────────────────────────
function NavRow({
  label,
  desc,
  danger,
  onPress,
}: {
  label: string;
  desc?: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      <ChevronRight size={16} color={C.granite} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

// ─── Group card ──────────────────────────────────────────────────────────
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

// ─── SettingsScreen ───────────────────────────────────────────────────────
export function SettingsScreen() {
  const navigation = useNavigation<any>();

  // Connected accounts
  const [strava, setStrava]     = useState(true);
  const [googleFit, setGFit]    = useState(false);
  const [ouraRing, setOura]     = useState(false);
  const [googleCal, setGCal]    = useState(true);

  // Notifications
  const [dailyNudge, setDaily]  = useState(true);
  const [insights, setInsights] = useState(true);
  const [challenges, setChal]   = useState(false);
  const [household, setHouse]   = useState(true);
  const [weeklySum, setWeekly]  = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Connected Accounts ── */}
        <SettingsGroup title="Connected Accounts">
          <ToggleRow label="Strava"      desc="Sync cycling and running activity"  value={strava}    onChange={setStrava} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Google Fit"  desc="Sync steps and active minutes"      value={googleFit} onChange={setGFit} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Oura Ring"   desc="Sync health and sleep data"         value={ouraRing}  onChange={setOura} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Google Calendar" desc="Detect meeting-related travel"  value={googleCal} onChange={setGCal} />
        </SettingsGroup>

        {/* ── Notifications ── */}
        <SettingsGroup title="Notifications">
          <ToggleRow label="Daily nudge"     desc="One small action every morning"     value={dailyNudge}  onChange={setDaily} />
          <View style={styles.rowDivider} />
          <ToggleRow label="New insights"    desc="When Sol spots an important pattern" value={insights}    onChange={setInsights} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Challenge updates" desc="Progress and countdowns"          value={challenges}  onChange={setChal} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Household activity" desc="When a member logs something"    value={household}   onChange={setHouse} />
          <View style={styles.rowDivider} />
          <ToggleRow label="Weekly summary"  desc="Your week, every Sunday morning"    value={weeklySum}   onChange={setWeekly} />
        </SettingsGroup>

        {/* ── Privacy & Data ── */}
        <SettingsGroup title="Privacy & Data">
          <NavRow
            label="Export data"
            desc="Download all your activity and footprint history as CSV"
          />
          <View style={styles.rowDivider} />
          <NavRow
            label="Download history"
            desc="Receive a full data archive via email"
          />
          <View style={styles.rowDivider} />
          <NavRow
            label="Manage permissions"
            desc="Control which device sensors and services Tread can access"
          />
          <View style={styles.rowDivider} />
          <NavRow
            label="Delete account"
            desc="Permanently remove your data and close your account"
            danger
          />
        </SettingsGroup>

        {/* ── About & Help ── */}
        <SettingsGroup title="About & Help">
          <NavRow label="Help Center" />
          <View style={styles.rowDivider} />
          <NavRow label="Contact Support" />
          <View style={styles.rowDivider} />
          <NavRow label="Terms of Service" />
          <View style={styles.rowDivider} />
          <NavRow label="Privacy Policy" />
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={styles.versionText}>1.0.0 (24)</Text>
          </View>
        </SettingsGroup>

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
  scroll: { paddingTop: 12, paddingHorizontal: 20 },

  group: { marginBottom: 26 },
  groupTitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 10,
    paddingLeft: 2,
  },
  groupCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontFamily: 'Inter', fontSize: 15, color: C.text },
  rowLabelDanger: { color: C.red },
  rowDesc: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginTop: 2, lineHeight: 17 },
  rowDivider: { height: 1, backgroundColor: C.divider, marginHorizontal: 16 },
  versionText: { fontFamily: 'SpaceGrotesk', fontSize: 13, color: C.granite },
});

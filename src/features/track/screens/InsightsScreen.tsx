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
import { ArrowLeft, ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText, Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: W } = Dimensions.get('window');
const CARD_W = W - 40;

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  canvas:    '#F4F5F2',
  white:     '#FFFFFF',
  stone:     '#ECEEEA',
  charcoal:  '#1D1F1E',
  deep:      '#111412',
  green:     '#00BB78',
  mint:      '#A5FFA7',
  granite:   '#6B716D',
  text:      '#161816',
  textSoft:  '#F3F6F3',
  border:    'rgba(29,31,30,0.09)',
};

// ─── Category Breakdown Data ───────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Transport',  value: 148, unit: 'kg',  pct: 0.41, color: C.green },
  { label: 'Food',       value: 92,  unit: 'kg',  pct: 0.26, color: '#50C99A' },
  { label: 'Energy',     value: 67,  unit: 'kg',  pct: 0.19, color: '#7BB8A0' },
  { label: 'Shopping',   value: 35,  unit: 'kg',  pct: 0.10, color: '#A0B5AB' },
  { label: 'Waste',      value: 14,  unit: 'kg',  pct: 0.04, color: C.granite },
];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.value, 0);

// ─── Mini line chart data ─────────────────────────────────────────────────
const TREND_POINTS = [
  { x: 0,   y: 320 },
  { x: 1,   y: 305 },
  { x: 2,   y: 310 },
  { x: 3,   y: 290 },
  { x: 4,   y: 278 },
  { x: 5,   y: 265 },
  { x: 6,   y: 272 },
  { x: 7,   y: 248 },
  { x: 8,   y: 240 },
  { x: 9,   y: 228 },
  { x: 10,  y: 218 },
  { x: 11,  y: 210 },
];

function buildLinePath(pts: typeof TREND_POINTS, cw: number, ch: number): string {
  const xMin = pts[0].x, xMax = pts[pts.length - 1].x;
  const yMin = Math.min(...pts.map(p => p.y));
  const yMax = Math.max(...pts.map(p => p.y));
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * cw;
  const py = (y: number) => ch - ((y - yMin) / (yMax - yMin)) * (ch - 12) - 4;
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(' ');
}

function buildAreaPath(pts: typeof TREND_POINTS, cw: number, ch: number): string {
  const line = buildLinePath(pts, cw, ch);
  const xMin = pts[0].x, xMax = pts[pts.length - 1].x;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * cw;
  return `${line} L ${px(xMax).toFixed(1)} ${ch} L ${px(xMin).toFixed(1)} ${ch} Z`;
}

export function InsightsScreen() {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState(false);
  const chartW = CARD_W - 32;
  const chartH = 130;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Category Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FOOTPRINT BY CATEGORY</Text>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Total this month</Text>
            <Text style={styles.bigMetric}>{TOTAL} <Text style={styles.bigMetricUnit}>kg CO₂e</Text></Text>
            <View style={{ gap: 14, marginTop: 18 }}>
              {CATEGORIES.map(cat => {
                const barW = (CARD_W - 80) * cat.pct;
                return (
                  <View key={cat.label} style={styles.catRow}>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: barW, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                    <Text style={styles.catValue}>{cat.value} kg</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Trend Analysis ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MONTHLY TREND</Text>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={styles.cardTitle}>This vs last month</Text>
                <Text style={styles.cardSubtitle}>Jan → Dec 2024</Text>
              </View>
              <Text style={styles.trendBadge}>↓ 24.7%</Text>
            </View>
            <Svg width={chartW} height={chartH}>
              <Defs>
                <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={C.green} stopOpacity="0.14" />
                  <Stop offset="100%" stopColor={C.green} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              {/* Area fill */}
              <Path d={buildAreaPath(TREND_POINTS, chartW, chartH)} fill="url(#areaGrad)" />
              {/* Line */}
              <Path
                d={buildLinePath(TREND_POINTS, chartW, chartH)}
                stroke={C.green}
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={styles.axisLabel}>Jan</Text>
              <Text style={styles.axisLabel}>Jun</Text>
              <Text style={styles.axisLabel}>Dec</Text>
            </View>
          </View>
        </View>

        {/* ── How We Calculate ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.expandRow}
              onPress={() => setExpanded(e => !e)}
              activeOpacity={0.75}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Info size={16} color={C.granite} strokeWidth={1.6} />
                <Text style={styles.expandLabel}>How we calculate this</Text>
              </View>
              {expanded
                ? <ChevronUp size={16} color={C.granite} strokeWidth={1.6} />
                : <ChevronDown size={16} color={C.granite} strokeWidth={1.6} />
              }
            </TouchableOpacity>
            {expanded && (
              <View style={styles.expandBody}>
                <View style={styles.divider} />
                <Text style={styles.expandText}>
                  Estimates are generated using IPCC-aligned emission factors for each activity category. Transport figures combine fuel type, distance, and vehicle class. Food is calculated from meal frequency and dietary pattern surveys. Energy uses your local grid's carbon intensity, refreshed monthly. Shopping uses lifecycle estimates per product category.
                  {'\n\n'}
                  Where we lack precise data, we apply conservative regional averages and flag the assumption. You can review or correct any logged activity to improve accuracy.
                </Text>
              </View>
            )}
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
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: C.granite,
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  cardTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '600', color: C.text },
  cardSubtitle: { fontFamily: 'Inter', fontSize: 12, color: C.granite, marginTop: 2 },
  bigMetric: { fontFamily: 'SpaceGrotesk', fontSize: 30, fontWeight: '700', color: C.text, marginTop: 4 },
  bigMetricUnit: { fontFamily: 'Inter', fontSize: 14, fontWeight: '400', color: C.granite },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  catLabel: { fontFamily: 'Inter', fontSize: 13, color: C.text, width: 68 },
  barTrack: {
    height: 6,
    backgroundColor: C.stone,
    borderRadius: 3,
    flex: 1,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  catValue: { fontFamily: 'SpaceGrotesk', fontSize: 12, color: C.granite, width: 48, textAlign: 'right' },
  trendBadge: { fontFamily: 'SpaceGrotesk', fontSize: 13, fontWeight: '600', color: C.green },
  axisLabel: { fontFamily: 'Inter', fontSize: 11, color: C.granite },
  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expandLabel: { fontFamily: 'Inter', fontSize: 14, color: C.text },
  expandBody: { marginTop: 12 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 14 },
  expandText: { fontFamily: 'Inter', fontSize: 13, color: C.granite, lineHeight: 20 },
});

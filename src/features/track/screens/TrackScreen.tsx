import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  Trash2,
  BarChart2,
  ChevronDown,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useActivities } from '../../../hooks/useTrack';
import { useAuthStore } from '../../../store/useAuthStore';

const CATEGORIES = [
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'energy',    label: 'Energy',    icon: Zap },
  { id: 'food',      label: 'Food',      icon: UtensilsCrossed },
  { id: 'shopping',  label: 'Shopping',  icon: ShoppingBag },
  { id: 'waste',     label: 'Waste',     icon: Trash2 },
];

const RECENT = [
  // Mock data removed. We will use `data.pages` from the query
];

const TABS = ['Manual', 'Connected Sources'] as const;

export function TrackScreen() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Manual');
  const [selectedCat, setSelectedCat] = useState('transport');
  const [amount, setAmount] = useState('');
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  
  const { data, fetchNextPage, hasNextPage, logActivity, isLogging } = useActivities(user?.id);

  const handleLog = () => {
    if (!amount || isNaN(Number(amount))) return;
    
    logActivity({
      category: selectedCat,
      subcategory: 'general', // You could add subcategory selection later
      amount: Number(amount),
      unit: 'unit', // Adjust unit based on category in the future
    });
    setAmount('');
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Track</Text>
        <TouchableOpacity style={styles.insightsBtn} onPress={() => navigation.navigate('Insights')}>
          <BarChart2 size={16} color="#00BB78" strokeWidth={1.8} />
          <Text style={styles.insightsLabel}>Insights</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Segmented control */}
        <View style={styles.segControl}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.segTab, activeTab === tab && styles.segTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.segLabel, activeTab === tab && styles.segLabelActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category selector */}
        <View style={styles.catRow}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, active && styles.catBtnActive]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <Icon
                  size={22}
                  color={active ? '#161816' : '#6B716D'}
                  strokeWidth={active ? 2 : 1.5}
                />
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input card — no glow on this screen by design */}
        <View style={styles.inputCard}>
          <Text style={styles.inputHint}>Distance</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.inputValue}
              selectionColor="#00BB78"
            />
            <TouchableOpacity style={styles.unitPill}>
              <Text style={styles.unitText}>km</Text>
              <ChevronDown size={14} color="#6B716D" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.logBtn, isLogging && { opacity: 0.7 }]} 
            activeOpacity={0.85}
            onPress={handleLog}
            disabled={isLogging}
          >
            <Text style={styles.logBtnText}>{isLogging ? 'Logging...' : 'Log Activity'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentCard}>
          {data?.pages?.flatMap(page => page.data).map((item: any, index: number, array: any[]) => {
            const catDef = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
            const Icon = catDef.icon;
            const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <React.Fragment key={item.id}>
                <View style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Icon size={18} color="#6B716D" strokeWidth={1.5} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityLabel}>{catDef.label} • {item.subcategory || 'General'}</Text>
                    <Text style={styles.activityDate}>{formattedDate}</Text>
                  </View>
                  <View style={styles.activityCo2}>
                    <Text style={styles.co2Value}>{Number(item.co2_kg).toFixed(2)}</Text>
                    <Text style={styles.co2Unit}>kg CO₂e</Text>
                  </View>
                </View>
                {index < array.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
          {(!data || data.pages[0].data.length === 0) && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter', color: '#6B716D' }}>No recent activities found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F2' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 26,
    fontWeight: '700',
    color: '#161816',
  },
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightsLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#00BB78',
    fontWeight: '500',
  },

  // Segmented control
  segControl: {
    flexDirection: 'row',
    backgroundColor: '#ECEEEA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 3,
    marginBottom: 20,
    marginTop: 8,
  },
  segTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  segLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#6B716D',
    fontWeight: '400',
  },
  segLabelActive: {
    color: '#00BB78',
    fontWeight: '600',
  },

  // Categories
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  catBtn: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    gap: 6,
  },
  catBtnActive: {
    borderColor: 'rgba(29,31,30,0.15)',
    backgroundColor: '#FFFFFF',
  },
  catLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#6B716D',
  },
  catLabelActive: {
    color: '#161816',
    fontWeight: '600',
  },

  // Input card
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 20,
    marginBottom: 24,
  },
  inputHint: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B716D',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputValue: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 48,
    fontWeight: '700',
    color: '#161816',
    flex: 1,
  },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.10)',
    backgroundColor: '#F4F5F2',
  },
  unitText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#161816',
    fontWeight: '500',
  },
  logBtn: {
    backgroundColor: '#00BB78',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Recent
  sectionTitle: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '700',
    color: '#161816',
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#161816',
    fontWeight: '500',
  },
  activityDate: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B716D',
    marginTop: 2,
  },
  activityCo2: { alignItems: 'flex-end' },
  co2Value: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 16,
    fontWeight: '700',
    color: '#161816',
  },
  co2Unit: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#6B716D',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(29,31,30,0.06)',
    marginHorizontal: 16,
  },
});

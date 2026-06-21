import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Car,
  Bus,
  Bike,
  Footprints,
  Zap,
  UtensilsCrossed,
  Leaf,
  ShoppingBag,
  Trash2,
} from 'lucide-react-native';
import { useOnboardingStore } from '../../../store/useOnboardingStore';

const MODULES = [
  {
    id: 'transport',
    step: 1,
    label: 'Transport',
    question: 'How do you usually travel day to day?',
    options: [
      { value: 'car', label: 'Personal car', icon: Car },
      { value: 'bus', label: 'Bus or metro', icon: Bus },
      { value: 'bike', label: 'Bicycle', icon: Bike },
      { value: 'walk', label: 'Mostly walk', icon: Footprints },
    ],
  },
  {
    id: 'energy',
    step: 2,
    label: 'Energy',
    question: 'What best describes your home energy use?',
    options: [
      { value: 'highElec', label: 'High electricity use', icon: Zap },
      { value: 'avgElec', label: 'Average electricity use', icon: Zap },
      { value: 'renewable', label: 'Mostly renewable', icon: Leaf },
      { value: 'lowEnergy', label: 'Very energy-conscious', icon: Leaf },
    ],
  },
  {
    id: 'food',
    step: 3,
    label: 'Food',
    question: 'What does your typical diet look like?',
    options: [
      { value: 'meatHeavy', label: 'Meat at most meals', icon: UtensilsCrossed },
      { value: 'omnivore', label: 'Balanced omnivore', icon: UtensilsCrossed },
      { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
      { value: 'vegan', label: 'Vegan', icon: Leaf },
    ],
  },
  {
    id: 'shopping',
    step: 4,
    label: 'Shopping',
    question: 'How would you describe your shopping habits?',
    options: [
      { value: 'frequent', label: 'Buy new things often', icon: ShoppingBag },
      { value: 'average', label: 'Average consumer', icon: ShoppingBag },
      { value: 'mindful', label: 'Mindful shopper', icon: ShoppingBag },
      { value: 'minimal', label: 'Buy very little', icon: ShoppingBag },
    ],
  },
  {
    id: 'waste',
    step: 5,
    label: 'Waste',
    question: 'How do you handle household waste?',
    options: [
      { value: 'noRecycle', label: 'Rarely recycle', icon: Trash2 },
      { value: 'someRecycle', label: 'Recycle sometimes', icon: Trash2 },
      { value: 'recycle', label: 'Recycle most things', icon: Trash2 },
      { value: 'compost', label: 'Compost & recycle', icon: Trash2 },
    ],
  },
];

export function AssessmentScreen() {
  const [moduleIndex, setModuleIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const { saveAssessmentData, completeAssessment } = useOnboardingStore();

  const module = MODULES[moduleIndex];
  const totalSteps = MODULES.length;
  const progressPct = (module.step / totalSteps) * 100;

  const handleNext = () => {
    if (!selectedValue) return;
    saveAssessmentData({ [module.id]: selectedValue });
    setSelectedValue('');
    if (moduleIndex < MODULES.length - 1) {
      setModuleIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressArea}>
          <View style={styles.segmentRow}>
            {MODULES.map((m, i) => (
              <View key={m.id} style={styles.segmentTrack}>
                <View
                  style={[
                    styles.segment,
                    i < module.step
                      ? styles.segmentDone
                      : i === module.step - 1
                      ? styles.segmentActive
                      : styles.segmentIdle,
                  ]}
                />
              </View>
            ))}
          </View>
          <Text style={styles.progressLabel}>
            {module.step} of {totalSteps} · {module.label}
          </Text>
        </View>

        {/* Question */}
        <Animated.View key={module.id} entering={FadeIn.duration(350)} style={styles.questionArea}>
          <Text style={styles.question}>{module.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionList}>
          {module.options.map(option => {
            const Icon = option.icon;
            const selected = selectedValue === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => setSelectedValue(option.value)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                  <Icon size={22} color={selected ? '#00BB78' : '#6B716D'} strokeWidth={1.5} />
                </View>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                {selected && (
                  <View style={styles.checkDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.btnArea}>
        <TouchableOpacity
          style={[styles.btn, !selectedValue && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!selectedValue}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, !selectedValue && styles.btnTextDisabled]}>
            {moduleIndex === MODULES.length - 1 ? 'Finish assessment' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F2',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressArea: {
    marginBottom: 32,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  segmentTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(107,113,109,0.18)',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
    borderRadius: 2,
  },
  segmentDone: {
    width: '100%',
    backgroundColor: '#00BB78',
    opacity: 0.5,
  },
  segmentActive: {
    width: '100%',
    backgroundColor: '#00BB78',
  },
  segmentIdle: {
    width: 0,
  },
  progressLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#6B716D',
    letterSpacing: 0.2,
  },
  questionArea: {
    marginBottom: 28,
  },
  question: {
    fontFamily: 'Manrope',
    fontSize: 24,
    fontWeight: '700',
    color: '#161816',
    lineHeight: 32,
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.10)',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionCardSelected: {
    borderWidth: 1.5,
    borderColor: '#00BB78',
    backgroundColor: 'rgba(0,187,120,0.04)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(107,113,109,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(0,187,120,0.10)',
  },
  optionLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#161816',
    fontWeight: '400',
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: '#161816',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BB78',
    marginLeft: 8,
  },
  btnArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#F4F5F2',
  },
  btn: {
    backgroundColor: '#00BB78',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(107,113,109,0.25)',
  },
  btnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 17,
    color: '#FFFFFF',
  },
  btnTextDisabled: {
    color: '#6B716D',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';
import { useOnboardingStore } from '../../../store/useOnboardingStore';

const { width } = Dimensions.get('window');

/** Step 1 — Earth seen from space, a single soft glowing orb */
function EarthOrb() {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Defs>
        <RadialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#A5FFA7" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#A5FFA7" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="earthMain" cx="38%" cy="32%" r="58%">
          <Stop offset="0%" stopColor="#5AFFAA" stopOpacity="1" />
          <Stop offset="45%" stopColor="#00BB78" stopOpacity="1" />
          <Stop offset="100%" stopColor="#002E1C" stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="earthSpec" cx="34%" cy="26%" r="22%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="earthCloud" cx="60%" cy="40%" r="30%">
          <Stop offset="0%" stopColor="#ECFEEE" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#ECFEEE" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {/* Ambient glow */}
      <Circle cx="90" cy="90" r="88" fill="url(#earthGlow)" />
      {/* Planet body */}
      <Circle cx="90" cy="90" r="62" fill="url(#earthMain)" />
      {/* Continent-like clouds/land mass */}
      <Circle cx="90" cy="90" r="62" fill="url(#earthCloud)" />
      {/* Specular */}
      <Ellipse cx="74" cy="66" rx="20" ry="14" fill="url(#earthSpec)" />
      {/* Data arc — thin green orbit ring */}
      <Circle
        cx="90"
        cy="90"
        r="76"
        stroke="#00BB78"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        fill="none"
        strokeDasharray="12 6"
      />
      {/* Small dot node on orbit */}
      <Circle cx="90" cy="14" r="5" fill="#00BB78" fillOpacity="0.7" />
      <Circle cx="165" cy="112" r="3.5" fill="#A5FFA7" fillOpacity="0.7" />
    </Svg>
  );
}

/** Step 2 — A single growing leaf with data sparkles */
function LeafWithData() {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Defs>
        <RadialGradient id="leafGlow" cx="50%" cy="65%" r="40%">
          <Stop offset="0%" stopColor="#A5FFA7" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#A5FFA7" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="leafFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#A5FFA7" />
          <Stop offset="100%" stopColor="#00BB78" />
        </LinearGradient>
      </Defs>
      {/* Glow */}
      <Ellipse cx="90" cy="115" rx="55" ry="30" fill="url(#leafGlow)" />
      {/* Stem */}
      <Path
        d="M90 140 Q88 110 90 70"
        stroke="#00BB78"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Main leaf — organic teardrop */}
      <Path
        d="M90 70 C60 55 38 75 45 105 C52 130 85 138 90 140 C95 138 128 130 135 105 C142 75 120 55 90 70Z"
        fill="url(#leafFill)"
      />
      {/* Midrib */}
      <Path
        d="M90 75 Q91 105 90 135"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.45"
      />
      {/* Veins */}
      <Path d="M90 95 Q70 88 58 78" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      <Path d="M90 108 Q68 102 56 96" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      <Path d="M90 95 Q110 88 122 78" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      <Path d="M90 108 Q112 102 124 96" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      {/* Sparkle dots */}
      <Circle cx="44" cy="60" r="3" fill="#00BB78" fillOpacity="0.5" />
      <Circle cx="136" cy="56" r="2" fill="#A5FFA7" fillOpacity="0.7" />
      <Circle cx="155" cy="85" r="3.5" fill="#00BB78" fillOpacity="0.4" />
      <Circle cx="25" cy="90" r="2.5" fill="#A5FFA7" fillOpacity="0.5" />
      <Circle cx="90" cy="42" r="2" fill="#A5FFA7" fillOpacity="0.6" />
    </Svg>
  );
}

/** Step 3 — Carbon ring / impact visualization */
function ImpactRing() {
  const r = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ * 0.28; // 72% filled
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Defs>
        <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#A5FFA7" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#A5FFA7" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="ringArc" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#00BB78" />
          <Stop offset="100%" stopColor="#A5FFA7" />
        </LinearGradient>
      </Defs>
      {/* Ambient glow */}
      <Circle cx="90" cy="90" r="88" fill="url(#ringGlow)" />
      {/* Track */}
      <Circle
        cx="90" cy="90" r={r}
        stroke="rgba(29,31,30,0.12)"
        strokeWidth="10"
        fill="none"
      />
      {/* Inner dark fill */}
      <Circle cx="90" cy="90" r={r - 10} fill="#111412" />
      {/* Progress arc */}
      <Circle
        cx="90" cy="90" r={r}
        stroke="#00BB78"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin="90,90"
      />
      {/* Center number */}
      {/* Small downward arrow indicator */}
      <Path
        d="M84 84 L90 97 L96 84"
        stroke="#00BB78"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Outer sparkle nodes */}
      <Circle cx="90" cy="18" r="4" fill="#00BB78" fillOpacity="0.6" />
      <Circle cx="156" cy="113" r="3" fill="#A5FFA7" fillOpacity="0.65" />
      <Circle cx="26" cy="65" r="2.5" fill="#00BB78" fillOpacity="0.5" />
    </Svg>
  );
}

const STEPS = [
  {
    id: 'step1',
    headline: 'See your real number.',
    body: 'Most people underestimate their footprint. Tread gives you an honest, clear picture of yours.',
    illustration: EarthOrb,
    buttonLabel: 'Continue',
  },
  {
    id: 'step2',
    headline: 'Get one small step.',
    body: 'No overwhelm, no guilt. Just one meaningful action each day, chosen by Sol for your life.',
    illustration: LeafWithData,
    buttonLabel: 'Continue',
  },
  {
    id: 'step3',
    headline: 'Watch it drop.',
    body: 'Small, consistent choices compound into real impact. Your carbon ring will show you.',
    illustration: ImpactRing,
    buttonLabel: 'Start my assessment',
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboardingStore();
  const step = STEPS[currentStep];
  const Illustration = step.illustration;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Illustration */}
      <View style={styles.illustrationArea}>
        <Animated.View
          key={step.id + '_ill'}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(250)}
        >
          <Illustration />
        </Animated.View>
      </View>

      {/* Text */}
      <Animated.View
        key={step.id}
        entering={SlideInRight.duration(360)}
        exiting={SlideOutLeft.duration(260)}
        style={styles.textArea}
      >
        <Text style={styles.headline}>{step.headline}</Text>
        <Text style={styles.body}>{step.body}</Text>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStep ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.btn}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>{step.buttonLabel}</Text>
        </TouchableOpacity>
        {currentStep < STEPS.length - 1 && (
          <TouchableOpacity
            onPress={completeOnboarding}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F2',
    paddingHorizontal: 24,
  },
  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  headline: {
    fontFamily: 'Manrope',
    fontSize: 30,
    fontWeight: '700',
    color: '#161816',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#6B716D',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00BB78',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#C4C8C3',
  },
  btnContainer: {
    paddingBottom: 28,
    gap: 10,
  },
  btn: {
    backgroundColor: '#00BB78',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#6B716D',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { useBreathingAnimation } from '../../hooks/useBreathingAnimation';

interface CarbonRingProps {
  /** Progress 0–1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Enable mint glow behind ring (only one glow per screen) */
  showGlow?: boolean;
  children?: React.ReactNode;
}

export function CarbonRing({
  progress,
  size = 220,
  strokeWidth = 16,
  showGlow = true,
  children,
}: CarbonRingProps) {
  const breathStyle = useBreathingAnimation(5000);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const center = size / 2;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {showGlow && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {/* Soft radial mint glow — diffused, never neon */}
          <View
            style={{
              width: size * 1.3,
              height: size * 1.3,
              borderRadius: (size * 1.3) / 2,
              backgroundColor: 'rgba(165,255,167,0.12)',
              // Second layer for more diffusion
            }}
          />
        </View>
      )}

      <Animated.View style={breathStyle}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#00BB78" />
              <Stop offset="1" stopColor="#A5FFA7" />
            </LinearGradient>
          </Defs>

          {/* Track — muted grey */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(29,31,30,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Deep charcoal inner fill */}
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2 - 4}
            fill="#111412"
          />

          {/* Progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        {/* Centered content */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

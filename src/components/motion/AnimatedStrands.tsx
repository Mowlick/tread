import React, { useEffect, useRef } from 'react';
import { View, Animated as RNAnimated, StyleSheet, useWindowDimensions, Easing } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Strand configuration ──────────────────────────────────────────────────
// Each strand: a thin green line that drifts horizontally across the screen.
// yFrac: vertical position (0–1 of screen height)
// angle: degrees from horizontal
// length: px
// durationMs: one full crossing duration
// delay: start offset so they don't all move together
// opacity: stroke opacity
// reversed: direction (left→right vs right→left)
const STRAND_CONFIG = [
  { yFrac: 0.06,  angle: -6,  length: 140, durationMs: 20000, delay: 0,     opacity: 0.07, reversed: false },
  { yFrac: 0.14,  angle:  9,  length:  85, durationMs: 26000, delay: 4200,  opacity: 0.05, reversed: true  },
  { yFrac: 0.24,  angle: -11, length: 175, durationMs: 17000, delay: 8500,  opacity: 0.08, reversed: false },
  { yFrac: 0.35,  angle:  5,  length: 110, durationMs: 28000, delay: 1800,  opacity: 0.06, reversed: true  },
  { yFrac: 0.46,  angle: -4,  length: 130, durationMs: 22000, delay: 6000,  opacity: 0.07, reversed: false },
  { yFrac: 0.56,  angle:  12, length:  80, durationMs: 18500, delay: 9800,  opacity: 0.05, reversed: true  },
  { yFrac: 0.66,  angle: -8,  length: 160, durationMs: 24000, delay: 3000,  opacity: 0.06, reversed: false },
  { yFrac: 0.74,  angle:  7,  length: 100, durationMs: 21000, delay: 7200,  opacity: 0.07, reversed: true  },
  { yFrac: 0.83,  angle: -3,  length: 120, durationMs: 19500, delay: 5400,  opacity: 0.05, reversed: false },
  { yFrac: 0.91,  angle:  10, length:  95, durationMs: 27000, delay: 2400,  opacity: 0.06, reversed: true  },
  // Shorter accent strands
  { yFrac: 0.19,  angle: -15, length:  55, durationMs: 14000, delay: 11000, opacity: 0.05, reversed: false },
  { yFrac: 0.51,  angle:  6,  length:  70, durationMs: 16000, delay: 13000, opacity: 0.04, reversed: true  },
];

interface AnimatedStrandsProps {
  /** Reduce all opacities by this factor (0–1). Default 1. */
  intensity?: number;
}

export function AnimatedStrands({ intensity = 1 }: AnimatedStrandsProps) {
  const { width: W, height: H } = useWindowDimensions();
  const anims = useRef(STRAND_CONFIG.map(() => new RNAnimated.Value(0))).current;

  useEffect(() => {
    STRAND_CONFIG.forEach((strand, i) => {
      const loop = () => {
        anims[i].setValue(0);
        RNAnimated.timing(anims[i], {
          toValue: 1,
          duration: strand.durationMs,
          delay: strand.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) loop();
        });
      };
      loop();
    });
    return () => anims.forEach(a => a.stopAnimation());
  }, [W]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STRAND_CONFIG.map((strand, i) => {
        const strandH = Math.abs(Math.tan((strand.angle * Math.PI) / 180) * strand.length) + 4;
        const startX = strand.reversed ? -(strand.length + 40) : W + 40;
        const endX   = strand.reversed ? W + strand.length + 40 : -(strand.length + 40);
        const translateX = anims[i].interpolate({
          inputRange:  [0, 1],
          outputRange: [startX, endX],
        });

        const dy = Math.tan((strand.angle * Math.PI) / 180) * strand.length;
        const y1 = strandH / 2 - dy / 2;
        const y2 = strandH / 2 + dy / 2;

        return (
          <RNAnimated.View
            key={i}
            style={[
              {
                position: 'absolute',
                top: H * strand.yFrac - strandH / 2,
                left: 0,
                width: strand.length,
                height: Math.max(strandH, 2),
              },
              { transform: [{ translateX }] },
            ]}
          >
            <Svg
              width={strand.length}
              height={Math.max(strandH, 2)}
            >
              <Defs>
                <LinearGradient
                  id={`sg${i}`}
                  x1={strand.reversed ? '100%' : '0%'}
                  y1="0%"
                  x2={strand.reversed ? '0%' : '100%'}
                  y2="0%"
                >
                  <Stop offset="0%"   stopColor="#00BB78" stopOpacity="0" />
                  <Stop offset="20%"  stopColor="#00BB78" stopOpacity={intensity * strand.opacity} />
                  <Stop offset="80%"  stopColor="#A5FFA7" stopOpacity={intensity * strand.opacity} />
                  <Stop offset="100%" stopColor="#A5FFA7" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Line
                x1="0"
                y1={y1}
                x2={strand.length}
                y2={y2}
                stroke={`url(#sg${i})`}
                strokeWidth="0.75"
                strokeLinecap="round"
              />
            </Svg>
          </RNAnimated.View>
        );
      })}
    </View>
  );
}

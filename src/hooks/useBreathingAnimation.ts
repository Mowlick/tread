import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * The single shared breathing animation used across:
 * - CarbonRing (Home, Goals)
 * - Sol orb
 * - Streak flame
 * Scale: 1.0 → 1.02 → 1.0 over a 4–6 second loop
 */
export function useBreathingAnimation(durationMs = 4500) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
}

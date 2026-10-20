import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

// Fondo con degradé y dos resplandores que se mueven lentamente
function Glow({ color, size, style, duration }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.22,
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [20, -20] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        },
        style,
      ]}
    />
  );
}

export default function Background() {
  return (
    <>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
      <Glow color={colors.accent} size={320} duration={7000} style={{ top: -90, left: -110 }} />
      <Glow color={colors.accent2} size={260} duration={9000} style={{ bottom: -70, right: -90 }} />
    </>
  );
}

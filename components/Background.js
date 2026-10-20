import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// Resplandor suave: círculos concéntricos casi transparentes que simulan un desenfoque
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

  const rings = Array.from({ length: 14 }, (_, i) => 1 - i / 14);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        {
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-24, 24] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, -16] }) },
          ],
        },
        style,
      ]}
    >
      {rings.map((k) => (
        <View
          key={k}
          style={{
            position: 'absolute',
            width: size * k,
            height: size * k,
            borderRadius: (size * k) / 2,
            backgroundColor: color,
            opacity: 0.018,
          }}
        />
      ))}
    </Animated.View>
  );
}

export default function Background() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, overflow: 'hidden' }]} pointerEvents="none">
      <Glow color={colors.accent} size={520} duration={8000} style={{ top: -260, left: -180 }} />
      <Glow color={colors.blue} size={560} duration={10000} style={{ bottom: -300, right: -240 }} />
    </View>
  );
}

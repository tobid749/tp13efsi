import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

const PALETTE = [colors.accent, '#FFFFFF', colors.blue, '#FF7AB6', colors.warn];
const COUNT = 34;
const GRAVITY = 320;

const makeBurst = () =>
  Array.from({ length: COUNT }, (_, i) => {
    const angle = -Math.PI * (0.12 + Math.random() * 0.76); // abanico hacia arriba
    const speed = 170 + Math.random() * 240;
    return {
      id: i,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: (Math.random() - 0.5) * 900,
      color: PALETTE[i % PALETTE.length],
      w: 6 + Math.random() * 6,
      h: 9 + Math.random() * 9,
      round: Math.random() > 0.7,
    };
  });

// Una partícula con trayectoria parabólica (velocidad inicial + gravedad)
function Particle({ p }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 1300, easing: Easing.linear, useNativeDriver: true }).start();
  }, []);

  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const T = 1.3;
  const x = steps.map((s) => p.vx * s * T);
  const y = steps.map((s) => p.vy * s * T + GRAVITY * (s * T) * (s * T));

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: p.w,
        height: p.round ? p.w : p.h,
        borderRadius: p.round ? p.w : 2,
        backgroundColor: p.color,
        opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: t.interpolate({ inputRange: steps, outputRange: x }) },
          { translateY: t.interpolate({ inputRange: steps, outputRange: y }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
        ],
      }}
    />
  );
}

// Explosión de confeti cuando se acierta
export default function Confetti() {
  const { feedback } = useGame();
  const [burst, setBurst] = useState(null);

  useEffect(() => {
    if (feedback?.ok) setBurst({ key: Date.now(), particles: makeBurst() });
  }, [feedback]);

  if (!burst) return null;
  const { height } = Dimensions.get('window');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <View key={burst.key} style={{ position: 'absolute', top: height * 0.38 }}>
        {burst.particles.map((p) => (
          <Particle key={p.id} p={p} />
        ))}
      </View>
    </View>
  );
}

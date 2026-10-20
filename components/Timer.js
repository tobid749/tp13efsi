import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, radius } from '../theme';

export default function Timer() {
  const { timeLeft, ROUND_SECONDS } = useGame();
  const progress = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prev = useRef(timeLeft);

  // La barra se vacía de forma continua; si el tiempo sube (bandera nueva) se rellena rápido
  useEffect(() => {
    const refill = timeLeft > prev.current;
    prev.current = timeLeft;
    Animated.timing(progress, {
      toValue: timeLeft / ROUND_SECONDS,
      duration: refill ? 300 : 1000,
      easing: refill ? Easing.out(Easing.cubic) : Easing.linear,
      useNativeDriver: false,
    }).start();

    if (timeLeft <= 5 && timeLeft > 0) {
      pulse.setValue(1.3);
      Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [timeLeft]);

  const danger = timeLeft <= 5;
  const barColor = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [colors.danger, colors.danger, colors.warn, colors.success],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="timer-outline" size={18} color={danger ? colors.danger : colors.muted} />
        <Animated.Text
          style={[styles.text, { color: danger ? colors.danger : colors.text, transform: [{ scale: pulse }] }]}
        >
          {timeLeft}s
        </Animated.Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  text: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: radius.pill },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, radius } from '../theme';

export default function ScoreBoard() {
  const { score, playerName, mode, feedback } = useGame();

  const count = useRef(new Animated.Value(score)).current;
  const bump = useRef(new Animated.Value(1)).current;
  const chip = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(score);

  useEffect(() => {
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    return () => count.removeListener(id);
  }, []);

  // El puntaje sube/baja contando y rebota
  useEffect(() => {
    Animated.timing(count, { toValue: score, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    bump.setValue(1.18);
    Animated.spring(bump, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [score]);

  // El mensaje de resultado aparece y se desvanece
  useEffect(() => {
    if (!feedback) return;
    chip.setValue(0);
    Animated.sequence([
      Animated.spring(chip, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(chip, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [feedback]);

  const tint = feedback?.ok ? colors.success : colors.danger;

  return (
    <View style={styles.container}>
      <View style={styles.meta}>
        <View style={styles.pill}>
          <Ionicons name="person" size={12} color={colors.muted} />
          <Text style={styles.pillText}>{playerName}</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name={mode === 'flags' ? 'flag' : 'business'} size={12} color={colors.accent2} />
          <Text style={styles.pillText}>{mode === 'flags' ? 'Banderas' : 'Capitales'}</Text>
        </View>
      </View>

      <Text style={styles.caption}>PUNTAJE</Text>
      <Animated.Text
        style={[styles.score, { transform: [{ scale: bump }] }, shown < 0 && { color: colors.danger }]}
      >
        {shown}
      </Animated.Text>

      <View style={styles.chipSlot}>
        <Animated.View
          style={[
            styles.chip,
            { borderColor: tint, backgroundColor: `${tint}22` },
            {
              opacity: chip,
              transform: [{ translateY: chip.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Ionicons name={feedback?.ok ? 'checkmark-circle' : 'close-circle'} size={16} color={tint} />
          <Text style={[styles.chipText, { color: tint }]}>{feedback?.text}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  meta: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
  },
  pillText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  caption: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 16 },
  score: { color: colors.text, fontSize: 52, fontWeight: '800', letterSpacing: -1, marginTop: -2 },
  chipSlot: { height: 34, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
});

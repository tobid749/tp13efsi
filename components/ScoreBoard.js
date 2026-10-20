import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, fonts, radius } from '../theme';

export default function ScoreBoard() {
  const { score, streak, playerName, mode, feedback } = useGame();

  const count = useRef(new Animated.Value(score)).current;
  const bump = useRef(new Animated.Value(1)).current;
  const toast = useRef(new Animated.Value(0)).current;
  const delta = useRef(new Animated.Value(0)).current;
  const streakPop = useRef(new Animated.Value(1)).current;
  const [shown, setShown] = useState(score);

  useEffect(() => {
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    return () => count.removeListener(id);
  }, []);

  // El puntaje cuenta hasta el nuevo valor y rebota
  useEffect(() => {
    Animated.timing(count, { toValue: score, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    bump.setValue(1.22);
    Animated.spring(bump, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [score]);

  useEffect(() => {
    streakPop.setValue(1.5);
    Animated.spring(streakPop, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [streak]);

  // Mensaje de resultado + "+25" flotando
  useEffect(() => {
    if (!feedback) return;
    toast.setValue(0);
    delta.setValue(0);
    Animated.sequence([
      Animated.spring(toast, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(toast, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
    Animated.timing(delta, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [feedback]);

  const ok = feedback?.ok;
  const tint = ok ? colors.success : colors.danger;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.player}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(playerName[0] || '?').toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {playerName}
            </Text>
            <Text style={styles.mode}>{mode === 'flags' ? 'Banderas' : 'Capitales'}</Text>
          </View>
        </View>

        <View style={styles.scoreBox}>
          {streak >= 2 && (
            <Animated.View style={[styles.streak, { transform: [{ scale: streakPop }] }]}>
              <Ionicons name="flame" size={14} color={colors.warn} />
              <Text style={styles.streakText}>x{streak}</Text>
            </Animated.View>
          )}
          <View>
            <Animated.Text
              style={[styles.score, { transform: [{ scale: bump }] }, shown < 0 && { color: colors.danger }]}
            >
              {shown}
            </Animated.Text>
            {feedback && (
              <Animated.Text
                style={[
                  styles.delta,
                  {
                    color: tint,
                    opacity: delta.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
                    transform: [
                      { translateY: delta.interpolate({ inputRange: [0, 1], outputRange: [0, ok ? -34 : 24] }) },
                    ],
                  },
                ]}
              >
                {feedback.delta > 0 ? `+${feedback.delta}` : feedback.delta}
              </Animated.Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.toastSlot}>
        <Animated.View
          style={[
            styles.toast,
            { borderColor: `${tint}66`, backgroundColor: `${tint}1A` },
            {
              opacity: toast,
              transform: [{ translateY: toast.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={15} color={tint} />
          <Text style={[styles.toastText, { color: tint }]} numberOfLines={1}>
            {feedback?.text}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.display, fontSize: 18, color: colors.onAccent },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, maxWidth: 130 },
  mode: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 1 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  score: { color: colors.text, fontFamily: fonts.display, fontSize: 38, letterSpacing: -1, textAlign: 'right' },
  delta: { position: 'absolute', right: 0, top: 8, fontFamily: fonts.display, fontSize: 20 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,197,61,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,197,61,0.4)',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  streakText: { color: colors.warn, fontFamily: fonts.bold, fontSize: 12 },
  toastSlot: { height: 40, alignItems: 'center', justifyContent: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    maxWidth: '100%',
  },
  toastText: { fontFamily: fonts.semibold, fontSize: 13, flexShrink: 1 },
});

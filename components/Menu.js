import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors, fonts, MAX_WIDTH, radius, shadow } from '../theme';
import { FadeIn, PrimaryButton, PressableScale } from './ui';
import Leaderboard from './Leaderboard';

const MODES = [
  { key: 'flags', label: 'Banderas', icon: 'flag' },
  { key: 'capitals', label: 'Capitales', icon: 'business' },
];

// Abanico de banderas del héroe: [iso2, x, rotación, y]
const FAN = [
  ['jp', -128, -16, 26],
  ['fr', -64, -8, 8],
  ['ar', 0, 0, 0],
  ['br', 64, 8, 8],
  ['it', 128, 16, 26],
];

function FanCard({ iso, x, rot, y, index }) {
  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 6, tension: 50, delay: 200 + index * 90, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200 + index * 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200 + index * 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.fan,
        shadow('#000', 0.55, 16, 10),
        {
          zIndex: 10 - Math.abs(index - 2),
          opacity: enter,
          transform: [
            { translateX: x },
            { translateY: Animated.add(y, enter.interpolate({ inputRange: [0, 1], outputRange: [60, 0] })) },
            { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, index % 2 ? -7 : -4] }) },
            { rotate: `${rot}deg` },
          ],
        },
      ]}
    >
      <Image source={{ uri: `https://flagcdn.com/w320/${iso}.png` }} style={styles.fanImg} />
    </Animated.View>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.fanStage}>
        {FAN.map(([iso, x, rot, y], i) => (
          <FanCard key={iso} iso={iso} x={x} rot={rot} y={y} index={i} />
        ))}
      </View>
      <FadeIn delay={300}>
        <Text style={styles.title}>
          Flagmaster<Text style={{ color: colors.accent }}>.</Text>
        </Text>
        <Text style={styles.subtitle}>Banderas y capitales, contra el reloj.</Text>
      </FadeIn>
    </View>
  );
}

// Selector con píldora deslizante
function ModeSwitch({ mode, setMode }) {
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const thumb = (width - 8) / 2;

  useEffect(() => {
    Animated.spring(x, { toValue: mode === 'flags' ? 0 : thumb, friction: 9, tension: 90, useNativeDriver: true }).start();
  }, [mode, thumb]);

  return (
    <View style={styles.switch} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && <Animated.View style={[styles.thumb, { width: thumb, transform: [{ translateX: x }] }]} />}
      {MODES.map((m) => {
        const active = mode === m.key;
        return (
          <PressableScale key={m.key} style={styles.switchItem} onPress={() => setMode(m.key)}>
            <Ionicons name={m.icon} size={16} color={active ? colors.onAccent : colors.muted} />
            <Text style={[styles.switchText, active && { color: colors.onAccent }]}>{m.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default function Menu() {
  const { loading, error, startGame, playerName } = useGame();
  const [name, setName] = useState(playerName);
  const [mode, setMode] = useState('flags');
  const [focused, setFocused] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.status}>Cargando países…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={44} color={colors.danger} />
        <Text style={styles.status}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Hero />

      <FadeIn delay={450} style={styles.block}>
        <View style={[styles.inputWrap, focused && styles.inputFocused]}>
          <Ionicons name="person" size={17} color={focused ? colors.accent : colors.muted} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre de jugador"
            placeholderTextColor={colors.muted}
            maxLength={16}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      </FadeIn>

      <FadeIn delay={540} style={styles.block}>
        <ModeSwitch mode={mode} setMode={setMode} />
      </FadeIn>

      <FadeIn delay={630} style={styles.block}>
        <PrimaryButton
          label="Jugar"
          icon="arrow-forward"
          disabled={!name.trim()}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            startGame(name, mode);
          }}
        />
      </FadeIn>

      <FadeIn delay={720} style={[styles.block, { marginTop: 28 }]}>
        <Leaderboard />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: MAX_WIDTH, alignItems: 'center' },
  block: { width: '100%', marginTop: 14 },
  center: { alignItems: 'center', gap: 14, padding: 24 },
  status: { color: colors.muted, textAlign: 'center', fontSize: 15, fontFamily: fonts.body },
  hero: { alignItems: 'center', width: '100%', marginBottom: 14 },
  fanStage: { width: '100%', height: 150, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  fan: {
    position: 'absolute',
    width: 104,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.borderHi,
    backgroundColor: colors.surface,
  },
  fanImg: { width: '100%', height: '100%' },
  title: { color: colors.text, fontSize: 42, fontFamily: fonts.display, letterSpacing: -2, textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 15, fontFamily: fonts.body, textAlign: 'center', marginTop: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: colors.accent, backgroundColor: colors.surfaceHi },
  input: { flex: 1, color: colors.text, fontSize: 16, fontFamily: fonts.semibold, paddingVertical: 15, outlineStyle: 'none' },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.accent,
  },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  switchText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 14 },
});

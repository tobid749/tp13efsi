import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors, gradients, MAX_WIDTH, radius, shadow } from '../theme';
import { FadeIn, GradientButton, PressableScale } from './ui';
import Leaderboard from './Leaderboard';

const MODES = [
  { key: 'flags', label: 'Banderas', icon: 'flag' },
  { key: 'capitals', label: 'Capitales', icon: 'business' },
];

// Selector con píldora deslizante
function ModeSwitch({ mode, setMode }) {
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const thumb = (width - 8) / 2;

  useEffect(() => {
    Animated.spring(x, { toValue: mode === 'flags' ? 0 : thumb, friction: 8, tension: 80, useNativeDriver: true }).start();
  }, [mode, thumb]);

  return (
    <View style={styles.switch} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Animated.View style={[styles.thumb, { width: thumb, transform: [{ translateX: x }] }]}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      {MODES.map((m) => (
        <PressableScale key={m.key} style={styles.switchItem} onPress={() => setMode(m.key)}>
          <Ionicons name={m.icon} size={16} color={mode === m.key ? '#fff' : colors.muted} />
          <Text style={[styles.switchText, mode === m.key && { color: '#fff' }]}>{m.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

function Hero() {
  const float = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={styles.hero}>
      <Animated.View
        style={[
          styles.orb,
          shadow(colors.accent, 0.7, 34, 14),
          { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] },
        ]}
      >
        <LinearGradient colors={['#8B5CF6', '#22D3EE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orbFill}>
          <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
            <Ionicons name="earth" size={54} color="#fff" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.title}>Flagmaster</Text>
      <Text style={styles.subtitle}>Adiviná banderas y capitales{'\n'}contra el reloj</Text>
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

  const ready = name.trim().length > 0;

  return (
    <View style={styles.container}>
      <FadeIn>
        <Hero />
      </FadeIn>

      <FadeIn delay={150} style={styles.block}>
        <View style={[styles.inputWrap, focused && styles.inputFocused]}>
          <Ionicons name="person-outline" size={18} color={focused ? colors.accent : colors.muted} />
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

      <FadeIn delay={250} style={styles.block}>
        <ModeSwitch mode={mode} setMode={setMode} />
      </FadeIn>

      <FadeIn delay={350} style={styles.block}>
        <GradientButton
          label="Jugar"
          icon="play"
          colors={gradients.success}
          disabled={!ready}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            startGame(name, mode);
          }}
        />
      </FadeIn>

      <FadeIn delay={450} style={styles.block}>
        <Leaderboard />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: MAX_WIDTH, alignItems: 'center' },
  block: { width: '100%', marginTop: 16 },
  center: { alignItems: 'center', gap: 14, padding: 24 },
  status: { color: colors.muted, textAlign: 'center', fontSize: 15 },
  hero: { alignItems: 'center', marginTop: 8, marginBottom: 6 },
  orb: { width: 112, height: 112, borderRadius: 56 },
  orbFill: { flex: 1, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -1, marginTop: 20 },
  subtitle: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: colors.accent, backgroundColor: colors.surfaceStrong },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 14 },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
  },
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: radius.sm + 2, overflow: 'hidden' },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  switchText: { color: colors.muted, fontWeight: '700', fontSize: 14 },
});

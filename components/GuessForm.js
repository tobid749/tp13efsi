import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame, normalize } from '../context/GameContext';
import { colors, radius } from '../theme';
import { FadeIn, GhostButton, GradientButton, PressableScale } from './ui';

// Casillas del nombre: las letras reveladas con pista se iluminan
function LetterBoxes() {
  const { currentCountry, revealed } = useGame();
  const words = currentCountry.name.split(' ');
  let index = 0;
  return (
    <View style={styles.words}>
      {words.map((word, w) => (
        <View key={w} style={styles.word}>
          {[...word].map((ch) => {
            const i = index++;
            const on = revealed.includes(i + w); // +w: los espacios también cuentan como índice
            return (
              <View key={i} style={[styles.box, on && styles.boxOn]}>
                <Text style={styles.boxText}>{on ? ch.toUpperCase() : ''}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Modo banderas: input con sugerencias + pista
function FlagsForm() {
  const { countries, guess, useHint } = useGame();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions =
    text.trim().length >= 2
      ? countries.filter((c) => normalize(c.name).includes(normalize(text))).slice(0, 4)
      : [];

  const submit = (value) => {
    guess(value);
    setText('');
  };

  return (
    <View style={styles.container}>
      <LetterBoxes />
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <Ionicons name="search" size={18} color={focused ? colors.accent : colors.muted} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribí el país…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => submit(text)}
          returnKeyType="send"
        />
      </View>
      {suggestions.map((c) => (
        <PressableScale key={c.iso2} style={styles.suggestion} onPress={() => submit(c.name)}>
          <Ionicons name="arrow-forward-circle-outline" size={18} color={colors.accent2} />
          <Text style={styles.suggestionText}>{c.name}</Text>
        </PressableScale>
      ))}
      <View style={styles.row}>
        <GradientButton label="Adivinar" icon="send" onPress={() => submit(text)} style={{ flex: 1 }} />
        <GhostButton label="Pista −2s" icon="bulb-outline" onPress={useHint} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// Una opción de capital; si se elimina se apaga con animación
function CapitalOption({ index }) {
  const { options, eliminated, guessCapital } = useGame();
  const option = options[index];
  const gone = eliminated.includes(option);
  const v = useRef(new Animated.Value(gone ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(v, { toValue: gone ? 0 : 1, friction: 7, useNativeDriver: true }).start();
  }, [gone, option]);

  return (
    <FadeIn delay={index * 90}>
      <Animated.View
        style={{
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
        }}
      >
        <PressableScale disabled={gone} onPress={() => guessCapital(option)} style={styles.option}>
          <View style={[styles.badge, gone && { backgroundColor: colors.surface }]}>
            <Text style={styles.badgeText}>{'ABC'[index]}</Text>
          </View>
          <Text style={[styles.optionText, gone && styles.optionGone]} numberOfLines={1}>
            {option}
          </Text>
          {gone && <Ionicons name="close" size={18} color={colors.muted} />}
        </PressableScale>
      </Animated.View>
    </FadeIn>
  );
}

// Modo capitales: 3 opciones, se van borrando con el tiempo
function CapitalsForm() {
  const { options, useHint } = useGame();
  return (
    <View style={styles.container}>
      {options.map((_, i) => (
        <CapitalOption key={i} index={i} />
      ))}
      <GhostButton label="Pista: borrar opción (−2s)" icon="bulb-outline" onPress={useHint} style={{ marginTop: 4 }} />
    </View>
  );
}

export default function GuessForm() {
  const { mode, currentCountry } = useGame();
  if (!currentCountry) return null;
  return mode === 'flags' ? <FlagsForm /> : <CapitalsForm />;
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10 },
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 4 },
  word: { flexDirection: 'row', gap: 4 },
  box: {
    width: 22,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxOn: { backgroundColor: 'rgba(124,92,255,0.35)', borderColor: colors.accent },
  boxText: { color: colors.text, fontSize: 14, fontWeight: '800' },
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
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  suggestionText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '800' },
  optionText: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '700' },
  optionGone: { textDecorationLine: 'line-through', color: colors.muted },
});

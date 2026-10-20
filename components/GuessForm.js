import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame, normalize } from '../context/GameContext';
import { colors, fonts, radius } from '../theme';
import { FadeIn, GhostButton, PrimaryButton, PressableScale } from './ui';

// Casilla de una letra: al revelarse con una pista salta y se ilumina
function LetterBox({ i }) {
  const { currentCountry, revealed } = useGame();
  const on = revealed.includes(i);
  const pop = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    if (on) {
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    } else {
      pop.setValue(0);
    }
  }, [on, currentCountry.iso2]);

  return (
    <Animated.View
      style={[
        styles.box,
        on && styles.boxOn,
        { transform: [{ scale: pop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.25, 1] }) }] },
      ]}
    >
      <Text style={styles.boxText}>{on ? currentCountry.name[i].toUpperCase() : ''}</Text>
    </Animated.View>
  );
}

function LetterBoxes() {
  const { currentCountry } = useGame();
  let offset = 0;
  return (
    <View style={styles.words}>
      {currentCountry.name.split(' ').map((word, w) => {
        const start = offset;
        offset += word.length + 1;
        return (
          <View key={w} style={styles.word}>
            {[...word].map((_, k) => (
              <LetterBox key={k} i={start + k} />
            ))}
          </View>
        );
      })}
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
      ? countries.filter((c) => normalize(c.name).includes(normalize(text))).slice(0, 3)
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
        <FadeIn key={c.iso2}>
          <PressableScale style={styles.suggestion} onPress={() => submit(c.name)}>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
            <Text style={styles.suggestionText}>{c.name}</Text>
          </PressableScale>
        </FadeIn>
      ))}
      <View style={styles.row}>
        <PrimaryButton label="Adivinar" icon="arrow-forward" onPress={() => submit(text)} style={{ flex: 1.3 }} />
        <GhostButton label="Pista  −2s" icon="bulb-outline" onPress={useHint} style={{ flex: 1 }} />
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
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        }}
      >
        <PressableScale disabled={gone} onPress={() => guessCapital(option)} style={styles.option}>
          <View style={[styles.badge, gone && styles.badgeGone]}>
            <Text style={[styles.badgeText, gone && { color: colors.muted }]}>{'ABC'[index]}</Text>
          </View>
          <Text style={[styles.optionText, gone && styles.optionGone]} numberOfLines={1}>
            {option}
          </Text>
          <Ionicons name={gone ? 'close' : 'chevron-forward'} size={18} color={colors.muted} />
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
      <GhostButton label="Pista: borrar una opción  −2s" icon="bulb-outline" onPress={useHint} style={{ marginTop: 2 }} />
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
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 6 },
  word: { flexDirection: 'row', gap: 4 },
  box: {
    width: 24,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
  },
  boxOn: { backgroundColor: 'rgba(200,245,51,0.14)', borderColor: colors.accent },
  boxText: { color: colors.accent, fontSize: 15, fontFamily: fonts.display },
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
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionText: { color: colors.text, fontSize: 15, fontFamily: fonts.semibold },
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
    paddingRight: 16,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGone: { backgroundColor: colors.surfaceHi },
  badgeText: { color: colors.onAccent, fontFamily: fonts.display, fontSize: 15 },
  optionText: { flex: 1, color: colors.text, fontSize: 17, fontFamily: fonts.bold },
  optionGone: { textDecorationLine: 'line-through', color: colors.muted },
});

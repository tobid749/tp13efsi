import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { MAX_WIDTH } from '../theme';
import Flag from './Flag';
import GuessForm from './GuessForm';
import ScoreBoard from './ScoreBoard';
import Timer from './Timer';
import { FadeIn, GhostButton } from './ui';

export default function Game() {
  const { currentCountry, feedback, finishGame, resetScore } = useGame();
  const shake = useRef(new Animated.Value(0)).current;

  // Respuesta incorrecta: la pantalla tiembla
  useEffect(() => {
    if (!feedback || feedback.ok) return;
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 7, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [feedback]);

  if (!currentCountry) return null;

  return (
    <FadeIn style={styles.container}>
      <Animated.View style={[styles.inner, { transform: [{ translateX: shake }] }]}>
        <ScoreBoard />
        <Timer />
        <Flag />
        <GuessForm />
        <View style={styles.footer}>
          <GhostButton label="Reiniciar" icon="refresh" onPress={resetScore} style={{ flex: 1 }} />
          <GhostButton label="Terminar" icon="flag" onPress={finishGame} style={{ flex: 1 }} />
        </View>
      </Animated.View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: MAX_WIDTH },
  inner: { width: '100%', alignItems: 'center' },
  footer: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 22 },
});

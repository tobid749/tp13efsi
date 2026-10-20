import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useGame } from '../context/GameContext';
import { colors, fonts, shadow } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 78;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

// Anillo de cuenta regresiva que cambia de color con el tiempo
export default function Timer() {
  const { timeLeft, ROUND_SECONDS } = useGame();
  const progress = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prev = useRef(timeLeft);

  useEffect(() => {
    const refill = timeLeft > prev.current;
    prev.current = timeLeft;
    Animated.timing(progress, {
      toValue: timeLeft / ROUND_SECONDS,
      duration: refill ? 350 : 1000,
      easing: refill ? Easing.out(Easing.cubic) : Easing.linear,
      useNativeDriver: false,
    }).start();

    if (timeLeft <= 5 && timeLeft > 0) {
      pulse.setValue(1.14);
      Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [timeLeft]);

  const danger = timeLeft <= 5;
  const stroke = progress.interpolate({
    inputRange: [0, 0.33, 0.6, 1],
    outputRange: [colors.danger, colors.danger, colors.warn, colors.accent],
  });

  return (
    <Animated.View style={[styles.wrap, shadow(danger ? colors.danger : '#000', danger ? 0.6 : 0.5, 18, 6), { transform: [{ scale: pulse }] }]}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.border} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [C, 0] })}
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={[styles.text, danger && { color: colors.danger }]}>{timeLeft}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.bg,
    alignSelf: 'center',
  },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.text, fontFamily: fonts.display, fontSize: 28 },
});

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

// Viñeta de color + vibración al responder (verde acierto, rojo error)
export default function FlashOverlay() {
  const { feedback } = useGame();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!feedback) return;
    Haptics.notificationAsync(
      feedback.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    opacity.setValue(1);
    Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }).start();
  }, [feedback]);

  const tint = feedback?.ok ? colors.success : colors.danger;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderWidth: 6,
          borderColor: tint,
          backgroundColor: `${tint}14`,
          opacity,
        },
      ]}
    />
  );
}

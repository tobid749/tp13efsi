import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

// Destello verde/rojo en toda la pantalla + vibración al responder
export default function FlashOverlay() {
  const { feedback } = useGame();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!feedback) return;
    Haptics.notificationAsync(
      feedback.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    opacity.setValue(1);
    Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }).start();
  }, [feedback]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: feedback?.ok ? colors.success : colors.danger,
          opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }),
        },
      ]}
    />
  );
}

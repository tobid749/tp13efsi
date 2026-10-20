import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radius, shadow } from '../theme';

// Botón base: se achica al tocarlo y vibra suave
export function PressableScale({ children, style, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        to(0.96);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function GradientButton({ label, icon, onPress, disabled, colors: c = gradients.primary, style }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.btnWrap, shadow(c[0], 0.45, 18, 8), disabled && { opacity: 0.4 }, style]}
    >
      <LinearGradient colors={c} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.btnLabel}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

export function GhostButton({ label, icon, onPress, style }) {
  return (
    <PressableScale onPress={onPress} style={[styles.btnWrap, styles.ghost, style]}>
      <View style={styles.btn}>
        {icon && <Ionicons name={icon} size={17} color={colors.text} style={{ marginRight: 8 }} />}
        <Text style={styles.btnLabel}>{label}</Text>
      </View>
    </PressableScale>
  );
}

// Entrada con fade + deslizamiento
export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Tarjeta de vidrio
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  btnWrap: { borderRadius: radius.md },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  btnLabel: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 18,
  },
});

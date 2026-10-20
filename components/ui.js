import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, shadow } from '../theme';

// Las propiedades de layout van al Pressable (si no, flex/width no tienen efecto)
const LAYOUT_KEYS = ['flex', 'flexGrow', 'flexShrink', 'flexBasis', 'width', 'alignSelf', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical'];

function splitLayout(style) {
  const flat = StyleSheet.flatten(style) || {};
  const layout = {};
  const rest = {};
  Object.keys(flat).forEach((k) => (LAYOUT_KEYS.includes(k) ? (layout[k] = flat[k]) : (rest[k] = flat[k])));
  return [layout, rest];
}

// Botón base: se hunde al tocarlo y vibra suave
export function PressableScale({ children, style, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 50, bounciness: 8 }).start();
  const [layout, rest] = splitLayout(style);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={layout}
      onPressIn={() => {
        to(0.955);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[rest, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function PrimaryButton({ label, icon, onPress, disabled, style }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, styles.primary, shadow(colors.accent, 0.35, 22, 8), disabled && { opacity: 0.35 }, style]}
    >
      <Text style={[styles.label, { color: colors.onAccent }]}>{label}</Text>
      {icon && <Ionicons name={icon} size={18} color={colors.onAccent} style={{ marginLeft: 8 }} />}
    </PressableScale>
  );
}

export function GhostButton({ label, icon, onPress, style, small }) {
  return (
    <PressableScale onPress={onPress} style={[styles.btn, styles.ghost, small && { paddingVertical: 11 }, style]}>
      {icon && <Ionicons name={icon} size={small ? 15 : 17} color={colors.text} style={{ marginRight: 8 }} />}
      <Text style={[styles.label, small && { fontSize: 13 }]}>{label}</Text>
    </PressableScale>
  );
}

// Entrada con fade + deslizamiento
export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 650, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  primary: { backgroundColor: colors.accent },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 15, fontFamily: fonts.bold, letterSpacing: 0.2 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 18,
  },
});

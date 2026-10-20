import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { colors, radius, shadow } from '../theme';

export default function Flag() {
  const { currentCountry, mode } = useGame();
  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const imgOpacity = useRef(new Animated.Value(0)).current;

  // Cada bandera nueva entra con un resorte
  useEffect(() => {
    enter.setValue(0);
    imgOpacity.setValue(0);
    Animated.spring(enter, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [currentCountry?.iso2]);

  // Flotación suave permanente
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!currentCountry) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {mode === 'flags' ? '¿DE QUÉ PAÍS ES ESTA BANDERA?' : '¿CUÁL ES LA CAPITAL DE ESTE PAÍS?'}
      </Text>
      <Animated.View
        style={[
          styles.card,
          shadow(colors.accent, 0.55, 30, 14),
          {
            opacity: enter,
            transform: [
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { rotate: enter.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '0deg'] }) },
            ],
          },
        ]}
      >
        <Animated.Image
          source={{ uri: currentCountry.flag }}
          style={[styles.flag, { opacity: imgOpacity }]}
          resizeMode="cover"
          onLoad={() => Animated.timing(imgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start()}
        />
        {/* brillo diagonal tipo vidrio */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 14, width: '100%' },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginBottom: 14 },
  card: {
    width: '86%',
    aspectRatio: 1.6,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bg1,
  },
  flag: { width: '100%', height: '100%' },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { colors, fonts, radius, shadow } from '../theme';

export default function Flag() {
  const { currentCountry, mode } = useGame();
  const [width, setWidth] = useState(0);

  const enter = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const imgOpacity = useRef(new Animated.Value(0)).current;

  // Cada bandera nueva se "reparte" desde la derecha con un resorte
  useEffect(() => {
    enter.setValue(0);
    imgOpacity.setValue(0);
    Animated.spring(enter, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }).start();
  }, [currentCountry?.iso2]);

  // Inclinación 3D lenta + destello que cruza la bandera
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sheen, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!currentCountry) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {mode === 'flags' ? 'ADIVINÁ EL PAÍS' : 'ADIVINÁ LA CAPITAL'}
      </Text>
      <Animated.View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.card,
          shadow('#000', 0.6, 30, 18),
          {
            opacity: enter,
            transform: [
              { perspective: 900 },
              { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) },
              { rotateZ: enter.interpolate({ inputRange: [0, 1], outputRange: ['10deg', '0deg'] }) },
              { rotateY: tilt.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) },
              { rotateX: tilt.interpolate({ inputRange: [0, 1], outputRange: ['3deg', '-3deg'] }) },
            ],
          },
        ]}
      >
        <Animated.Image
          source={{ uri: currentCountry.flag }}
          style={[styles.flag, { opacity: imgOpacity }]}
          resizeMode="cover"
          onLoad={() => Animated.timing(imgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()}
        />
        {/* sombra interior para dar volumen */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.14)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.22)']}
          style={StyleSheet.absoluteFill}
        />
        {/* destello que cruza */}
        {width > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -20,
              bottom: -20,
              width: width * 0.35,
              transform: [
                { translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.5, width * 1.2] }) },
                { rotate: '18deg' },
              ],
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%', marginTop: 6 },
  label: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  card: {
    width: '90%',
    aspectRatio: 1.55,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderHi,
    backgroundColor: colors.surface,
  },
  flag: { width: '100%', height: '100%' },
});

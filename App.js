import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GameProvider, useGame } from './context/GameContext';
import { colors } from './theme';
import Background from './components/Background';
import Confetti from './components/Confetti';
import FlashOverlay from './components/FlashOverlay';
import Menu from './components/Menu';
import Game from './components/Game';

function Screen() {
  const { playing } = useGame();
  return playing ? <Game /> : <Menu />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <GameProvider>
      <View style={styles.root}>
        <Background />
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Screen />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <FlashOverlay />
        <Confetti />
        <StatusBar style="light" />
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 40 },
});

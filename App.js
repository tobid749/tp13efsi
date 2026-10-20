import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { GameProvider, useGame } from './context/GameContext';
import { colors } from './theme';
import Background from './components/Background';
import FlashOverlay from './components/FlashOverlay';
import Menu from './components/Menu';
import Game from './components/Game';

function Screen() {
  const { playing } = useGame();
  return playing ? <Game /> : <Menu />;
}

export default function App() {
  return (
    <GameProvider>
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
      <StatusBar style="light" />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 40 },
});

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, fonts, radius } from '../theme';
import { Card, FadeIn } from './ui';

const MEDALS = [colors.gold, colors.silver, colors.bronze];

export default function Leaderboard() {
  const { leaderboard } = useGame();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        <Ionicons name="trophy" size={18} color={colors.gold} />
      </View>

      {leaderboard.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="podium-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyText}>Todavía no hay partidas.{'\n'}Jugá una y terminá para entrar al podio.</Text>
        </View>
      )}

      {leaderboard.slice(0, 10).map((p, i) => (
        <FadeIn key={`${p.date}-${i}`} delay={i * 60}>
          <View style={[styles.row, i === 0 && styles.rowFirst]}>
            <Text style={[styles.rank, i < 3 && { color: MEDALS[i] }]}>{i + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
            <View style={styles.tag}>
              <Ionicons name={p.mode === 'capitals' ? 'business' : 'flag'} size={11} color={colors.muted} />
            </View>
            <Text style={[styles.points, i === 0 && { color: colors.accent }]}>{p.score}</Text>
          </View>
        </FadeIn>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: colors.text, fontSize: 18, fontFamily: fonts.heading },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 20, fontFamily: fonts.body },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: radius.md },
  rowFirst: { backgroundColor: 'rgba(200,245,51,0.07)' },
  rank: { width: 26, color: colors.muted, fontFamily: fonts.display, fontSize: 16 },
  name: { flex: 1, color: colors.text, fontSize: 15, fontFamily: fonts.semibold },
  tag: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  points: { color: colors.text, fontSize: 17, fontFamily: fonts.display, minWidth: 40, textAlign: 'right' },
});

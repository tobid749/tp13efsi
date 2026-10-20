import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, radius } from '../theme';
import { Card, FadeIn } from './ui';

const MEDALS = [colors.gold, colors.silver, colors.bronze];

export default function Leaderboard() {
  const { leaderboard } = useGame();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={18} color={colors.gold} />
        <Text style={styles.title}>Ranking</Text>
      </View>

      {leaderboard.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="podium-outline" size={30} color={colors.muted} />
          <Text style={styles.emptyText}>Todavía no hay partidas.{'\n'}¡Sé el primero en el podio!</Text>
        </View>
      )}

      {leaderboard.slice(0, 10).map((p, i) => (
        <FadeIn key={`${p.date}-${i}`} delay={i * 70}>
          <View style={[styles.row, i === 0 && styles.rowFirst]}>
            <View
              style={[
                styles.rank,
                i < 3 && { backgroundColor: `${MEDALS[i]}26`, borderColor: MEDALS[i] },
              ]}
            >
              <Text style={[styles.rankText, i < 3 && { color: MEDALS[i] }]}>{i + 1}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
            <Ionicons
              name={p.mode === 'capitals' ? 'business' : 'flag'}
              size={13}
              color={colors.muted}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.points}>{p.score}</Text>
          </View>
        </FadeIn>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 14 },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.md,
  },
  rowFirst: { backgroundColor: 'rgba(251,191,36,0.08)' },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  rankText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  name: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  points: { color: colors.text, fontSize: 16, fontWeight: '800', minWidth: 36, textAlign: 'right' },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Props = { icon: string; title: string; subtitle: string; selected: boolean; onPress: () => void };

export function ChoiceCard({ icon, title, subtitle, selected, onPress }: Props) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[styles.card, selected && styles.active]}>
      <View style={[styles.icon, selected && styles.activeIcon]}><Text style={styles.emoji}>{icon}</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioActive]}>{selected && <View style={styles.dot} />}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 82, borderRadius: 18, padding: 15, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  active: { borderColor: theme.colors.orange, backgroundColor: theme.colors.orangeSoft },
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  activeIcon: { backgroundColor: theme.colors.orange },
  emoji: { fontSize: 22 },
  copy: { flex: 1, marginLeft: 14 },
  title: { color: theme.colors.ink, fontSize: 15, fontWeight: '700' },
  subtitle: { color: theme.colors.muted, fontSize: 12, marginTop: 5 },
  radio: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#CBBCAF', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: theme.colors.orangeDeep },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: theme.colors.orangeDeep },
});

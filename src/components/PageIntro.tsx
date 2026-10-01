import { StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { theme } from '@/theme';

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <>
      <View style={styles.top}><Brand /><Text style={styles.topNote}>SCHOLZFIT · SEU ESPAÇO</Text></View>
      <View style={styles.intro}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>
    </>
  );
}

const styles = StyleSheet.create({
  top: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line, marginBottom: 32 },
  topNote: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '800' },
  intro: { marginBottom: 25 },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 10, letterSpacing: 1.4, fontWeight: '900', marginBottom: 8 },
  title: { color: theme.colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.8, fontWeight: '900' },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
});

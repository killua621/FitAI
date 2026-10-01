import { StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';

const weeks = [
  { label: 'SEM 01', value: 1 }, { label: 'SEM 02', value: 2 }, { label: 'SEM 03', value: 3 },
  { label: 'SEM 04', value: 2 }, { label: 'SEM 05', value: 4 }, { label: 'SEM 06', value: 3 },
  { label: 'SEM 07', value: 5 },
];

export default function ProgressScreen() {
  return (
    <Screen scroll footer={<AppTabBar active="/progress" />} style={styles.screen}>
      <PageIntro eyebrow="CADA PASSO CONTA" title="Sua evolução" description="Acompanhe o que você está construindo, sem pressa e sem comparação." />
      <View style={styles.highlight}><View><Text style={styles.highlightLabel}>SEU PRIMEIRO MARCO</Text><Text style={styles.highlightTitle}>A constância começa{ '\n' }com o próximo treino.</Text><Text style={styles.highlightCopy}>Seu histórico vai aparecer aqui conforme você registra suas atividades.</Text></View><View style={styles.highlightMark}><Text style={styles.highlightSymbol}>↗</Text></View></View>
      <View style={styles.stats}><View style={styles.statCard}><Text style={styles.statValue}>01</Text><Text style={styles.statLabel}>treino nesta semana</Text></View><View style={styles.statCard}><Text style={styles.statValue}>03</Text><Text style={styles.statLabel}>dias planejados</Text></View><View style={styles.statCard}><Text style={styles.statValue}>12%</Text><Text style={styles.statLabel}>do seu primeiro marco</Text></View></View>
      <View style={styles.chartCard}><View style={styles.chartHeading}><View><Text style={styles.chartEyebrow}>ATIVIDADE RECENTE</Text><Text style={styles.chartTitle}>Treinos por semana</Text></View><Text style={styles.chartRange}>7 SEMANAS</Text></View><View style={styles.chart}>{weeks.map((week) => <View key={week.label} style={styles.chartColumn}><View style={styles.barTrack}><View style={[styles.bar, { height: `${week.value * 16}%` }]} /></View><Text style={styles.chartLabel}>{week.label}</Text></View>)}</View><Text style={styles.chartNote}>Dados ilustrativos até você começar a registrar seus treinos.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, highlight: { minHeight: 220, borderRadius: 25, backgroundColor: theme.colors.dark, padding: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, overflow: 'hidden' }, highlightLabel: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, highlightTitle: { color: theme.colors.white, fontSize: 23, lineHeight: 28, fontWeight: '900', marginTop: 12 }, highlightCopy: { maxWidth: 440, color: '#C1B0A4', fontSize: 12, lineHeight: 19, marginTop: 8 }, highlightMark: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#38271E', alignItems: 'center', justifyContent: 'center' }, highlightSymbol: { color: theme.colors.orange, fontSize: 31 }, stats: { flexDirection: 'row', gap: 12, marginTop: 15, marginBottom: 30 }, statCard: { flex: 1, minHeight: 102, borderRadius: 19, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15, justifyContent: 'center' }, statValue: { color: theme.colors.brown, fontSize: 25, fontWeight: '900' }, statLabel: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 }, chartCard: { borderRadius: 23, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 20, marginBottom: 20 }, chartHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, chartEyebrow: { color: theme.colors.orangeDeep, fontSize: 8, letterSpacing: 1.3, fontWeight: '900' }, chartTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 }, chartRange: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: '800' }, chart: { height: 175, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingBottom: 7 }, chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }, barTrack: { width: 22, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }, bar: { width: 20, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: theme.colors.orange }, chartLabel: { color: theme.colors.muted, fontSize: 8, marginTop: 7 }, chartNote: { color: theme.colors.muted, fontSize: 10, marginTop: 14 } });



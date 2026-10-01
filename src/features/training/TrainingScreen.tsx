import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { Button } from '@/components/Button';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';

const exercises = [
  { number: '01', name: 'Agachamento', detail: '3 séries · 10 repetições' },
  { number: '02', name: 'Flexão inclinada', detail: '3 séries · 8 repetições' },
  { number: '03', name: 'Remada com halteres', detail: '3 séries · 10 repetições' },
  { number: '04', name: 'Prancha', detail: '3 séries · 30 segundos' },
];

export default function TrainingScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  return (
    <Screen scroll footer={<AppTabBar active="/workout" />} style={styles.screen}>
      <PageIntro eyebrow="MOVIMENTO COM INTENÇÃO" title="Seu treino" description="Uma sessão simples para começar com segurança e consistência." />
      <View style={[styles.topGrid, wide && styles.topGridWide]}>
        <View style={[styles.sessionCard, wide && styles.sessionCardWide]}>
          <View style={styles.sessionTop}><Text style={styles.sessionTag}>PLANO DE HOJE</Text><Text style={styles.sessionLevel}>INICIANTE</Text></View>
          <Text style={styles.sessionTitle}>Full body{ '\n' }para começar</Text>
          <Text style={styles.sessionCopy}>Quatro movimentos fundamentais, no seu ritmo.</Text>
          <View style={styles.sessionMeta}><Text style={styles.metaText}>◷  35 min</Text><Text style={styles.metaText}>↗  4 exercícios</Text></View>
          <Button title="Começar treino" onPress={() => Alert.alert('Treino FitAI', 'Esta é uma prévia visual do seu treino.')} style={styles.startButton} />
          <View style={styles.sessionOrb}><Text style={styles.sessionOrbText}>01</Text></View>
        </View>
        <View style={styles.weekCard}>
          <Text style={styles.smallLabel}>SUA ROTINA</Text><Text style={styles.weekTitle}>3 dias por semana</Text><Text style={styles.weekCopy}>Uma frequência leve para criar o hábito.</Text>
          <View style={styles.days}>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => <View key={i} style={[styles.day, [0, 2, 4].includes(i) && styles.dayActive]}><Text style={[styles.dayText, [0, 2, 4].includes(i) && styles.dayTextActive]}>{day}</Text></View>)}</View>
          <Text style={styles.weekFoot}>SEG · QUA · SEX</Text>
        </View>
      </View>
      <View style={styles.section}><Text style={styles.sectionEyebrow}>SEQUÊNCIA DO DIA</Text><Text style={styles.sectionTitle}>Seu treino, passo a passo</Text></View>
      <View style={styles.exerciseList}>{exercises.map((exercise, index) => <View key={exercise.number} style={[styles.exercise, index === exercises.length - 1 && styles.lastExercise]}><View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{exercise.number}</Text></View><View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseDetail}>{exercise.detail}</Text></View><Text style={styles.exerciseArrow}>↗</Text></View>)}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, topGrid: { gap: 14, marginBottom: 31 }, topGridWide: { flexDirection: 'row' }, sessionCard: { minHeight: 270, borderRadius: 25, backgroundColor: theme.colors.dark, padding: 22, overflow: 'hidden' }, sessionCardWide: { flex: 1.35 }, sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sessionTag: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, sessionLevel: { color: '#E9D9CC', backgroundColor: '#38271E', fontSize: 8, letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, fontWeight: '800' }, sessionTitle: { color: theme.colors.white, fontSize: 25, lineHeight: 29, fontWeight: '900', marginTop: 22 }, sessionCopy: { color: '#C1B0A4', fontSize: 13, marginTop: 7 }, sessionMeta: { flexDirection: 'row', gap: 18, marginTop: 17 }, metaText: { color: '#DCCABD', fontSize: 11, fontWeight: '700' }, startButton: { alignSelf: 'flex-start', minHeight: 46, paddingHorizontal: 20, marginTop: 19 }, sessionOrb: { position: 'absolute', right: -20, bottom: -55, width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#48352A', alignItems: 'center', justifyContent: 'center' }, sessionOrbText: { color: '#3B2A21', fontSize: 68, fontWeight: '900' }, weekCard: { flex: 1, minHeight: 270, borderRadius: 25, backgroundColor: theme.colors.surface, padding: 22, borderWidth: 1, borderColor: theme.colors.line, justifyContent: 'center' }, smallLabel: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, weekTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '900', marginTop: 8 }, weekCopy: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }, days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23 }, day: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }, dayActive: { backgroundColor: theme.colors.orange }, dayText: { color: theme.colors.muted, fontWeight: '700', fontSize: 10 }, dayTextActive: { color: theme.colors.dark }, weekFoot: { color: theme.colors.brown, fontSize: 8, letterSpacing: 1.2, fontWeight: '900', marginTop: 12 }, section: { marginBottom: 13 }, sectionEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 5 }, sectionTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '900' }, exerciseList: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 17, marginBottom: 20 }, exercise: { minHeight: 75, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.line, gap: 13 }, lastExercise: { borderBottomWidth: 0 }, exerciseNumber: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, exerciseNumberText: { color: theme.colors.orangeDeep, fontWeight: '900', fontSize: 11 }, exerciseCopy: { flex: 1 }, exerciseName: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' }, exerciseDetail: { color: theme.colors.muted, fontSize: 11, marginTop: 4 }, exerciseArrow: { color: theme.colors.brown, fontSize: 18 } });



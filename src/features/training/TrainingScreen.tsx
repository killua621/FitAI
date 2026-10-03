import { useEffect, useState } from 'react';
import { ExerciseDemo } from '@/features/training/ExerciseDemo';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { Button } from '@/components/Button';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { buildTrainingProgram } from '@/features/training/programGenerator';
import { theme } from '@/theme';
import { getCurrentWeekCheckins, weekdayLabels } from '@/features/training/checkins';

export default function TrainingScreen() {
  const { width } = useWindowDimensions();
  const { profile, workoutCheckinDates, refreshWorkoutCheckins } = useAuth();
  const wide = width >= 800;
  const program = buildTrainingProgram(profile || {});
  const todayIndex = (new Date().getDay() + 6) % 7;
  const trainingWeekdays = profile?.training_weekdays?.length ? profile.training_weekdays : weekdayLabels.slice(0, profile?.training_days || 3);
  const todaySessionIndex = trainingWeekdays.indexOf(weekdayLabels[todayIndex]);
  const initialSessionIndex = todaySessionIndex >= 0 ? todaySessionIndex : Math.max(0, trainingWeekdays.indexOf(weekdayLabels[(todayIndex + 1) % 7]));
  const [selectedIndex, setSelectedIndex] = useState(initialSessionIndex);
  const [activeDemoKey, setActiveDemoKey] = useState<string | null>(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const selectedSession = program.sessions[selectedIndex] || program.sessions[0];
  const isMinor = Boolean(profile?.age && profile.age < 18);
  const week = getCurrentWeekCheckins(workoutCheckinDates);
  const alreadyCheckedIn = week.days.find((day) => day.isToday)?.checkedIn || false;
  useEffect(() => { void refreshWorkoutCheckins().catch(() => undefined); }, []);
  return (
    <Screen scroll footer={<AppTabBar active="/workout" />} style={styles.screen}>
      <PageIntro eyebrow="TREINO FEITO PARA SUA ROTINA" title="Seu treino" description="Sessões organizadas pelos seus dias, experiência, objetivo e grupos musculares que você escolheu priorizar." />
      <View style={[styles.topGrid, wide && styles.topGridWide]}>
        <View style={[styles.sessionCard, wide && styles.sessionCardWide]}>
          <View style={styles.sessionTop}><Text style={styles.sessionTag}>SEU PLANO</Text><Text style={styles.sessionLevel}>{profile?.experience_level === 'Estou começando' ? 'INICIANTE' : 'PROGRESSIVO'}</Text></View>
          <Text style={styles.sessionTitle}>{program.title}</Text>
          <Text style={styles.sessionCopy}>{program.subtitle}</Text>
          <View style={styles.sessionMeta}><Text style={styles.metaText}>◷  {selectedSession.duration} min</Text><Text style={styles.metaText}>↗  {selectedSession.exercises.length} exercícios</Text></View>
          <Button title="Ver orientação do treino" onPress={() => setGuidanceOpen(true)} style={styles.startButton} />
          <Pressable accessibilityRole="button" disabled={alreadyCheckedIn} onPress={() => router.replace('/home')} style={({ pressed }) => [{ alignSelf: 'flex-start', minHeight: 42, borderRadius: 13, backgroundColor: alreadyCheckedIn ? theme.colors.purpleSoft : theme.colors.orange, paddingHorizontal: 15, marginTop: 10, justifyContent: 'center' }, pressed && { opacity: 0.8 }]}><Text style={{ color: theme.colors.dark, fontSize: 10, fontWeight: '900' }}>{alreadyCheckedIn ? '✓ Treino de hoje contado' : 'Fazer check-in na aba Início'}</Text></Pressable>
          <Text style={{ color: '#B5A6C0', fontSize: 9, marginTop: 7 }}>{week.count} check-in{week.count === 1 ? '' : 's'} nesta semana</Text>
          <View style={styles.sessionOrb}><Text style={styles.sessionOrbText}>F</Text></View>
        </View>
        <View style={styles.weekCard}>
          <Text style={styles.smallLabel}>FREQUÊNCIA ESCOLHIDA</Text><Text style={styles.weekTitle}>{program.sessions.length} dias por semana</Text><Text style={styles.weekCopy}>Cada sessão alterna ênfases e movimentos para equilibrar o trabalho dos grupos musculares.</Text>
          <View style={styles.days}>{program.sessions.map((session, index) => <View key={session.id} style={[styles.day, index === selectedIndex && styles.dayActive]}><Text style={[styles.dayText, index === selectedIndex && styles.dayTextActive]}>{index + 1}</Text></View>)}</View>
          <Text style={styles.weekFoot}>ALTERNÂNCIA COM RECUPERAÇÃO</Text>
        </View>
      </View>

      {isMinor ? (
        <View style={styles.guidanceCard}><Text style={styles.sectionEyebrow}>ORIENTAÇÃO DE IDADE</Text><Text style={styles.sectionTitle}>Treino com supervisão</Text><Text style={styles.guidanceText}>Este plano é uma referência geral para adultos. Como seu perfil informa menos de 18 anos, monte a rotina com um profissional qualificado e um responsável, com carga e progressão adequadas à sua idade.</Text></View>
      ) : (
        <>
          <View style={styles.section}><View><Text style={styles.sectionEyebrow}>SUA SESSÃO {String(selectedIndex + 1).padStart(2, '0')}</Text><Text style={styles.sectionTitle}>{selectedSession.title}</Text></View><Text style={styles.sessionFocus}>{selectedSession.focus}</Text></View>
          <Text style={styles.videoHint}>Assista às demonstrações do canal selecionado dentro do app. Toque em qualquer exercício para abrir o vídeo; os músculos trabalhados aparecem destacados.</Text>
          <View style={styles.sessionPicker}>{program.sessions.map((session, index) => <Pressable key={session.id} onPress={() => setSelectedIndex(index)} style={[styles.pickerPill, selectedIndex === index && styles.pickerPillActive]}><Text style={[styles.pickerText, selectedIndex === index && styles.pickerTextActive]}>Dia {index + 1}</Text></Pressable>)}</View>
          <View style={styles.exerciseList}>{selectedSession.exercises.map((exercise, index) => {
            const exerciseKey = `${selectedSession.id}-${index}`;
            const demoOpen = activeDemoKey === exerciseKey;
            return <View key={exerciseKey} style={[styles.exercise, index === selectedSession.exercises.length - 1 && styles.lastExercise]}><View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseDetail}>{exercise.focus}</Text><Text style={styles.exercisePrescription}>{exercise.sets} séries · {exercise.reps} repetições · pausa {exercise.rest}</Text><View style={styles.muscleTags}>{exercise.focus.split(/\s+e\s+/i).map((muscle, muscleIndex) => <Text key={`${exerciseKey}-muscle-${muscleIndex}`} style={styles.muscleTag}>{muscle}</Text>)}</View><Pressable accessibilityRole="button" accessibilityLabel={`${demoOpen ? 'Fechar' : 'Ver'} demonstração de ${exercise.name}`} onPress={() => exercise.demoVideoId && setActiveDemoKey(demoOpen ? null : exerciseKey)} style={styles.demoLink}><Text style={styles.demoLinkText}>{demoOpen ? '×  Fechar vídeo' : '▶  Ver exercício'}</Text></Pressable>{demoOpen && exercise.demoVideoId ? <ExerciseDemo videoId={exercise.demoVideoId} title={`Demonstração: ${exercise.name}`} /> : null}{!exercise.demoVideoId ? <Text style={styles.videoUnavailable}>Demonstração em preparação.</Text> : null}</View></View>;
          })}</View>
          <View style={styles.guidanceCard}><Text style={styles.sectionEyebrow}>PROGRESSÃO SIMPLES</Text><Text style={styles.guidanceText}>{program.method}</Text></View>
          <View style={styles.guidanceCard}><Text style={styles.sectionEyebrow}>MOVIMENTO AERÓBICO</Text><Text style={styles.guidanceText}>{program.cardio}</Text></View>
        </>
      )}
      <Text style={styles.footnote}>Plano educativo. Se você tem lesão, dor persistente ou condição de saúde, ajuste o treino com um profissional antes de iniciar.</Text>
      <Modal transparent visible={guidanceOpen} animationType="fade" onRequestClose={() => setGuidanceOpen(false)}>
        <View style={modalStyles.shade}><View style={modalStyles.card}>
          <View style={modalStyles.header}><View><Text style={styles.sectionEyebrow}>GUIA DO SEU PLANO</Text><Text style={modalStyles.title}>{selectedSession.title}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar orientação" onPress={() => setGuidanceOpen(false)} style={modalStyles.close}><Text style={modalStyles.closeText}>×</Text></Pressable></View>
          <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.label}>Como executar</Text><Text style={styles.guidanceText}>{program.method}</Text>
            <Text style={modalStyles.label}>Movimento aeróbico</Text><Text style={styles.guidanceText}>{program.cardio}</Text>
            <Text style={modalStyles.safety}>Use os vídeos de cada exercício para revisar o movimento. Se sentir dor, interrompa e procure orientação profissional. Ajuste a rotina com um profissional se tiver lesão ou condição de saúde.</Text>
          </ScrollView>
          <Pressable accessibilityRole="button" onPress={() => setGuidanceOpen(false)} style={modalStyles.done}><Text style={modalStyles.doneText}>Entendi</Text></Pressable>
        </View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, topGrid: { gap: 14, marginBottom: 31 }, topGridWide: { flexDirection: 'row' }, sessionCard: { minHeight: 270, borderRadius: 25, backgroundColor: theme.colors.dark, padding: 22, overflow: 'hidden' }, sessionCardWide: { flex: 1.35 }, sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sessionTag: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, sessionLevel: { color: theme.colors.orangeDeep, backgroundColor: theme.colors.darkSoft, fontSize: 8, letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, fontWeight: '800' }, sessionTitle: { color: theme.colors.white, fontSize: 25, lineHeight: 29, fontWeight: '900', marginTop: 22, maxWidth: 360 }, sessionCopy: { color: '#B4A6BA', fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 420 }, sessionMeta: { flexDirection: 'row', gap: 18, marginTop: 17 }, metaText: { color: '#DFD2E8', fontSize: 11, fontWeight: '700' }, startButton: { alignSelf: 'flex-start', minHeight: 46, paddingHorizontal: 20, marginTop: 19 }, sessionOrb: { position: 'absolute', right: -20, bottom: -55, width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#4A3858', alignItems: 'center', justifyContent: 'center' }, sessionOrbText: { color: '#4D355F', fontSize: 68, fontWeight: '900' }, weekCard: { flex: 1, minHeight: 270, borderRadius: 25, backgroundColor: theme.colors.surface, padding: 22, borderWidth: 1, borderColor: theme.colors.line, justifyContent: 'center' }, smallLabel: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, weekTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '900', marginTop: 8 }, weekCopy: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }, days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, gap: 7 }, day: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }, dayActive: { backgroundColor: theme.colors.purple }, dayText: { color: theme.colors.muted, fontWeight: '700', fontSize: 10 }, dayTextActive: { color: theme.colors.dark }, weekFoot: { color: theme.colors.purpleMuted, fontSize: 8, letterSpacing: 1.2, fontWeight: '900', marginTop: 12 }, section: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 13 }, sectionEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 5 }, sectionTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '900' }, sessionFocus: { color: theme.colors.muted, fontSize: 11, marginBottom: 4 }, videoHint: { color: theme.colors.purpleMuted, fontSize: 10, lineHeight: 16, marginBottom: 12 }, muscleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 }, muscleTag: { color: theme.colors.orangeDeep, backgroundColor: theme.colors.orangeSoft, borderRadius: 8, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '800' }, videoUnavailable: { color: theme.colors.muted, fontSize: 10, marginTop: 7 }, sessionPicker: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }, pickerPill: { minHeight: 36, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, pickerPillActive: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, pickerText: { color: theme.colors.muted, fontSize: 11, fontWeight: '800' }, pickerTextActive: { color: theme.colors.white }, exerciseList: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 17, marginBottom: 17 }, exercise: { minHeight: 80, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.line, gap: 13 }, lastExercise: { borderBottomWidth: 0 }, exerciseNumber: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, exerciseNumberText: { color: theme.colors.orangeDeep, fontWeight: '900', fontSize: 11 }, exerciseCopy: { flex: 1, paddingVertical: 12 }, exerciseName: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' }, exerciseDetail: { color: theme.colors.muted, fontSize: 10, marginTop: 3 }, exercisePrescription: { color: theme.colors.orangeDeep, fontSize: 10, marginTop: 5, fontWeight: '800' }, demoLink: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 7, backgroundColor: theme.colors.purpleSoft }, demoLinkText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '900' }, guidanceCard: { borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 18, marginBottom: 12 }, guidanceText: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 }, footnote: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5, marginBottom: 18 },
});

const modalStyles = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 580, maxHeight: '88%', borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { color: theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 5 },
  close: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: theme.colors.orange, fontSize: 25, fontWeight: '700', marginTop: -2 },
  scroll: { marginTop: 10 },
  content: { paddingBottom: 12 },
  label: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 15, marginBottom: 6 },
  safety: { color: theme.colors.muted, backgroundColor: theme.colors.background, borderRadius: 14, padding: 12, fontSize: 10, lineHeight: 16, marginTop: 14 },
  done: { minHeight: 44, borderRadius: 13, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  doneText: { color: theme.colors.dark, fontSize: 11, fontWeight: '900' },
});



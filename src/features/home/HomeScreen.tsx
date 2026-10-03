import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { AppTabBar } from '@/components/AppTabBar';
import { Brand } from '@/components/Brand';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { buildTrainingProgram } from '@/features/training/programGenerator';
import { getCurrentWeekCheckins, weekdayLabels } from '@/features/training/checkins';
import { theme } from '@/theme';

export default function HomeScreen() {
  const { profile, workoutCheckinDates, refreshWorkoutCheckins, addWorkoutCheckin } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [activityType, setActivityType] = useState('Musculação');
  const [workoutFocus, setWorkoutFocus] = useState('');
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  const firstName = (profile?.display_name || 'Atleta').split(' ')[0];
  const daysPerWeek = Math.max(2, Math.min(6, profile?.training_days || 3));
  const program = buildTrainingProgram(profile || { training_days: daysPerWeek });
  const week = getCurrentWeekCheckins(workoutCheckinDates);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const today = week.days[todayIndex];
  const schedule = profile?.training_weekdays?.length
    ? weekdayLabels.filter((day) => profile.training_weekdays.includes(day)).slice(0, 6)
    : weekdayLabels.slice(0, daysPerWeek);
  const todaySessionIndex = schedule.indexOf(weekdayLabels[todayIndex]);
  const upcomingIndex = Array.from({ length: 7 }, (_, offset) => (todayIndex + offset) % 7)
    .map((weekday) => schedule.indexOf(weekdayLabels[weekday]))
    .find((index) => index >= 0) ?? 0;
  const sessionIndex = todaySessionIndex >= 0 ? todaySessionIndex : upcomingIndex;
  const todaySession = program.sessions[sessionIndex] || program.sessions[0];

  useEffect(() => { void refreshWorkoutCheckins().catch(() => undefined); }, []);

  const checkIn = async () => {
    if (!workoutFocus.trim()) return Alert.alert('Conte o que você fez', 'Escreva o treino ou atividade antes de registrar.');
    setCheckingIn(true);
    try {
      const added = await addWorkoutCheckin(workoutFocus.trim(), activityType, workoutFocus.trim());
      setCheckinOpen(false);
      Alert.alert(added ? 'Check-in registrado' : 'Check-in já feito', added ? `${activityType}: ${workoutFocus.trim()}. Seu treino entrou no progresso.` : 'Seu treino de hoje já está contado.');
    } catch (error) {
      Alert.alert('Não foi possível registrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally { setCheckingIn(false); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/home" />} style={styles.screen}>
      <View style={styles.nav}><Brand /><Text style={styles.navLabel}>SEU ESPAÇO DE EVOLUÇÃO</Text><Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')} style={styles.avatar}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></Pressable></View>
      <View style={styles.intro}><Text style={styles.eyebrow}>SEU DIA, NO SEU RITMO</Text><Text style={styles.heading}>Olá, {firstName}.</Text><Text style={styles.subheading}>Um passo de cada vez. O que vamos fazer hoje?</Text></View>

      <View style={styles.checkinCard}>
        <View style={styles.cardTop}><View><Text style={styles.cardEyebrow}>CHECK-IN DE HOJE · {weekdayLabels[todayIndex].toUpperCase()}</Text><Text style={styles.cardTitle}>{today.checkedIn ? 'Você já marcou presença!' : 'Foi treinar hoje?'}</Text></View><View style={styles.checkIcon}><Text style={styles.checkIconText}>{today.checkedIn ? '✓' : '↗'}</Text></View></View>
        <Text style={styles.cardCopy}>{today.checkedIn ? 'Seu esforço já está registrado no seu progresso.' : 'Registre musculação, cardio, uma aula ou outra atividade.'}</Text>
        <Pressable accessibilityRole="button" disabled={checkingIn || today.checkedIn} onPress={() => { setWorkoutFocus(''); setActivityType('Musculação'); setCheckinOpen(true); }} style={[styles.checkinButton, today.checkedIn && styles.checkinButtonDone, checkingIn && { opacity: 0.7 }]}><Text style={styles.checkinButtonText}>{checkingIn ? 'Salvando…' : today.checkedIn ? '✓  Check-in concluído' : 'Fazer check-in'}</Text></Pressable>
        <View style={styles.weekSummary}><Text style={styles.weekSummaryValue}>{week.count}<Text style={styles.weekSummaryTotal}>/{daysPerWeek}</Text></Text><Text style={styles.weekSummaryLabel}>treinos registrados esta semana</Text></View>
        <View style={styles.weekDays}>{week.days.map((day, index) => <View key={day.key} style={styles.weekDay}><View style={[styles.dayDot, day.checkedIn && styles.dayDone, day.isToday && styles.dayToday]}><Text style={[styles.dayMark, day.checkedIn && styles.dayMarkDone]}>{day.checkedIn ? '✓' : weekdayLabels[index]}</Text></View></View>)}</View>
      </View>

      <View style={[styles.workoutCard, wide && styles.workoutCardWide]}>
        <View style={styles.workoutIcon}><Text style={styles.workoutIconText}>◉</Text></View>
        <View style={styles.workoutCopy}><Text style={styles.cardEyebrow}>{todaySession.focus.toUpperCase()}</Text><Text style={styles.workoutTitle}>{todaySession.title}</Text><Text style={styles.cardCopy}>{todaySession.exercises.length} exercícios · cerca de {todaySession.duration} min · {program.sessions.length} sessões na semana</Text></View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/workout')} style={styles.workoutButton}><Text style={styles.workoutButtonText}>Abrir treino  ↗</Text></Pressable>
      </View>

      <Modal visible={checkinOpen} transparent animationType="fade" onRequestClose={() => setCheckinOpen(false)}>
        <View style={styles.modalShade}><View style={styles.modalCard}>
          <Text style={styles.modalEyebrow}>CHECK-IN DE HOJE · {weekdayLabels[todayIndex].toUpperCase()}</Text><Text style={styles.modalTitle}>O que você fez?</Text><Text style={styles.modalCopy}>Seu registro fica salvo no seu histórico.</Text>
          <View style={styles.activityOptions}>{['Musculação', 'Cardio', 'Aula', 'Outro'].map((item) => <Pressable key={item} onPress={() => setActivityType(item)} style={[styles.activityOption, activityType === item && styles.activityOptionActive]}><Text style={[styles.activityOptionText, activityType === item && styles.activityOptionTextActive]}>{item}</Text></Pressable>)}</View>
          <Text style={styles.modalLabel}>{activityType === 'Musculação' ? 'Grupos ou foco do treino' : 'Nome da atividade'}</Text><TextInput value={workoutFocus} onChangeText={setWorkoutFocus} placeholder={activityType === 'Musculação' ? 'Ex.: Costas + bíceps' : 'Ex.: Corrida leve'} placeholderTextColor={theme.colors.muted} style={styles.modalInput} />
          <Pressable disabled={checkingIn} onPress={checkIn} style={styles.modalSubmit}><Text style={styles.modalSubmitText}>{checkingIn ? 'Salvando…' : 'Confirmar check-in'}</Text></Pressable><Pressable onPress={() => setCheckinOpen(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Agora não</Text></Pressable>
        </View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, nav: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line, marginBottom: 28 }, navLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '800', marginLeft: 'auto', marginRight: 18 }, avatar: { width: 38, height: 38, borderRadius: 20, backgroundColor: theme.colors.purpleSurface, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: theme.colors.white, fontSize: 15, fontWeight: '800' }, intro: { marginBottom: 22 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900', marginBottom: 8 }, heading: { color: theme.colors.ink, fontSize: 31, fontWeight: '900' }, subheading: { color: theme.colors.muted, fontSize: 13, marginTop: 6 }, checkinCard: { borderRadius: 25, backgroundColor: theme.colors.dark, padding: 21, marginBottom: 16 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardEyebrow: { color: theme.colors.orangeDeep, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' }, cardTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '900', marginTop: 7 }, cardCopy: { color: '#B9ADBF', fontSize: 11, lineHeight: 17, marginTop: 6 }, checkIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: '#392345', alignItems: 'center', justifyContent: 'center' }, checkIconText: { color: theme.colors.orange, fontSize: 19, fontWeight: '900' }, checkinButton: { minHeight: 44, borderRadius: 13, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, checkinButtonDone: { backgroundColor: '#392345' }, checkinButtonText: { color: theme.colors.dark, fontSize: 11, fontWeight: '900' }, weekSummary: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginTop: 20 }, weekSummaryValue: { color: theme.colors.white, fontSize: 26, fontWeight: '900' }, weekSummaryTotal: { color: '#B9ADBF', fontSize: 15, fontWeight: '700' }, weekSummaryLabel: { color: '#B9ADBF', fontSize: 10 }, weekDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11 }, weekDay: { alignItems: 'center' }, dayDot: { minWidth: 35, height: 35, paddingHorizontal: 5, borderRadius: 18, backgroundColor: '#211A28', alignItems: 'center', justifyContent: 'center' }, dayDone: { backgroundColor: theme.colors.orange }, dayToday: { borderWidth: 1, borderColor: theme.colors.orange }, dayMark: { color: '#C2B7C8', fontSize: 8, fontWeight: '800' }, dayMarkDone: { color: theme.colors.dark }, workoutCard: { borderRadius: 23, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 18, marginBottom: 26 }, workoutCardWide: { flexDirection: 'row', alignItems: 'center', gap: 18 }, workoutIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.purpleSoft, alignItems: 'center', justifyContent: 'center' }, workoutIconText: { color: theme.colors.orange, fontSize: 23 }, workoutCopy: { flex: 1 }, workoutTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: '900', marginTop: 5 }, workoutButton: { minHeight: 42, borderRadius: 13, backgroundColor: theme.colors.purpleSurface, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginTop: 13 }, workoutButtonText: { color: theme.colors.orange, fontSize: 10, fontWeight: '900' },
  modalShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 }, modalCard: { width: '100%', maxWidth: 430, borderRadius: 25, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 22 }, modalEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1, fontWeight: '900' }, modalTitle: { color: theme.colors.ink, fontSize: 25, fontWeight: '900', marginTop: 9 }, modalCopy: { color: theme.colors.muted, fontSize: 12, marginTop: 5 }, activityOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 19 }, activityOption: { paddingHorizontal: 11, minHeight: 35, borderRadius: 12, justifyContent: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, activityOptionActive: { backgroundColor: theme.colors.dark, borderColor: theme.colors.dark }, activityOptionText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, activityOptionTextActive: { color: theme.colors.orange }, modalLabel: { color: theme.colors.ink, fontSize: 11, fontWeight: '800', marginTop: 18, marginBottom: 7 }, modalInput: { minHeight: 47, borderRadius: 13, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 13, color: theme.colors.ink, fontSize: 13, outlineStyle: 'none' } as never, modalSubmit: { minHeight: 47, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orange, marginTop: 15 }, modalSubmitText: { color: theme.colors.dark, fontWeight: '900', fontSize: 12 }, modalCancel: { alignSelf: 'center', padding: 12 }, modalCancelText: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' },
});

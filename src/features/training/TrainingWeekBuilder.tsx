import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExerciseDemo } from '@/features/training/ExerciseDemo';
import { useAuth } from '@/features/auth/AuthProvider';
import { buildCustomTrainingExercises, trainingMuscleGroups, type TrainingMuscleGroup } from '@/features/training/programGenerator';
import { getCurrentWeekCheckins, getCurrentWeekStartKey, localDateKey, weekdayTabLabels } from '@/features/training/checkins';
import { theme } from '@/theme';

function normalizeGroupList(value: string | null | undefined): TrainingMuscleGroup[] {
  if (!value) return [];
  return trainingMuscleGroups.filter((group) => value.split(/\s*\+\s*/).includes(group));
}

export function TrainingWeekBuilder() {
  const { profile, workoutCheckinDetails, trainingWeekPlans, refreshTrainingWeekPlans, saveTrainingWeekPlan, addWorkoutCheckin } = useAuth();
  const [selectedWeekday, setSelectedWeekday] = useState((new Date().getDay() + 6) % 7);
  const [weekKey, setWeekKey] = useState(getCurrentWeekStartKey());
  const [selectedGroups, setSelectedGroups] = useState<TrainingMuscleGroup[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const week = getCurrentWeekCheckins(workoutCheckinDetails.map((entry) => entry.checkin_date));
  const selectedDay = week.days[selectedWeekday];
  const todayKey = localDateKey();
  const selectedPlan = trainingWeekPlans.find((plan) => plan.weekday === selectedWeekday);
  const savedCheckin = workoutCheckinDetails.find((entry) => entry.checkin_date === selectedDay.key);
  const completedToday = Boolean(savedCheckin);
  const isFutureDay = selectedDay.key > todayKey;
  const exercises = useMemo(() => buildCustomTrainingExercises(selectedGroups, profile?.experience_level), [selectedGroups, profile?.experience_level]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextWeekKey = getCurrentWeekStartKey();
      if (nextWeekKey !== weekKey) {
        setWeekKey(nextWeekKey);
        setSelectedWeekday((new Date().getDay() + 6) % 7);
        setSelectedGroups([]);
        setNotice('');
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [weekKey]);

  useEffect(() => {
    let active = true;
    setLoadingPlans(true);
    void refreshTrainingWeekPlans().catch(() => {
      if (active) setNotice('Não foi possível carregar sua divisão desta semana.');
    }).finally(() => { if (active) setLoadingPlans(false); });
    return () => { active = false; };
  }, [weekKey]);

  useEffect(() => {
    const fromPlan = selectedPlan?.muscle_groups || [];
    const fromCheckin = normalizeGroupList(savedCheckin?.workout_focus);
    setSelectedGroups((fromPlan.length ? fromPlan : fromCheckin) as TrainingMuscleGroup[]);
    setActiveDemo(null);
  }, [weekKey, selectedWeekday, selectedPlan?.muscle_groups, savedCheckin?.workout_focus]);

  const toggleGroup = (group: TrainingMuscleGroup) => {
    setNotice('');
    setSelectedGroups((current) => {
      if (current.includes(group)) return current.filter((item) => item !== group);
      if (current.length >= 3) {
        setNotice('Escolha até 3 grupos por treino para manter a sessão objetiva.');
        return current;
      }
      return [...current, group];
    });
  };

  const savePlan = async () => {
    if (selectedGroups.length === 0) {
      setNotice('Escolha pelo menos um grupo muscular para salvar o treino deste dia.');
      return;
    }
    setSavingPlan(true);
    setNotice('');
    try {
      await saveTrainingWeekPlan(selectedWeekday, selectedGroups);
      setNotice(`Divisão de ${weekdayTabLabels[selectedWeekday]} salva nesta semana.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.');
    } finally { setSavingPlan(false); }
  };

  const registerWorkout = async () => {
    if (selectedGroups.length === 0) {
      setNotice('Escolha os grupos que treinou antes de registrar o check-in.');
      return;
    }
    if (isFutureDay) {
      setNotice('Você pode montar o treino com antecedência; o check-in fica disponível no dia escolhido.');
      return;
    }
    setSavingCheckin(true);
    setNotice('');
    try {
      const groups = selectedGroups.join(' + ');
      const added = await addWorkoutCheckin(`Treino · ${groups}`, 'Musculação', groups, selectedDay.key);
      setNotice(added ? `${weekdayTabLabels[selectedWeekday]} registrado. Seu progresso foi atualizado!` : 'Este dia já tem um check-in registrado.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível registrar o treino.');
    } finally { setSavingCheckin(false); }
  };

  const selectedDateLabel = new Date(`${selectedDay.key}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <View style={styles.card}>
      <View style={styles.topLine}><View><Text style={styles.eyebrow}>SUA SEMANA</Text><Text style={styles.title}>Treino por dia</Text></View><View style={styles.countPill}><Text style={styles.countText}>{week.count}<Text style={styles.countMuted}>/{profile?.training_days || 3}</Text></Text></View></View>
      <Text style={styles.description}>Toque em um dia, escolha até 3 grupos musculares e veja uma série sugerida com vídeos.</Text>

      <View style={styles.weekRow}>{week.days.map((day, index) => {
        const record = workoutCheckinDetails.find((entry) => entry.checkin_date === day.key);
        const plan = trainingWeekPlans.find((entry) => entry.weekday === index);
        const dayGroups = record?.workout_focus || plan?.muscle_groups.join(' + ') || '';
        return <Pressable key={day.key} accessibilityRole="button" accessibilityLabel={`${weekdayTabLabels[index]}${day.checkedIn ? `, treino registrado: ${record?.workout_focus || 'sim'}` : ''}`} accessibilityState={{ selected: index === selectedWeekday }} onPress={() => { setSelectedWeekday(index); setNotice(''); }} style={[styles.weekDay, index === selectedWeekday && styles.weekDaySelected, day.checkedIn && styles.weekDayDone]}>
          <Text style={[styles.weekLabel, index === selectedWeekday && styles.selectedText]}>{weekdayTabLabels[index]}</Text>
          <View style={[styles.dayMark, day.checkedIn && styles.dayMarkDone, day.isToday && styles.dayMarkToday]}><Text style={[styles.dayMarkText, day.checkedIn && styles.dayMarkTextDone]}>{day.checkedIn ? '✓' : String(Number(day.key.slice(-2)))}</Text></View>
          <Text numberOfLines={2} style={[styles.dayFocus, index === selectedWeekday && styles.selectedText]}>{dayGroups || (day.isToday ? 'Hoje' : '—')}</Text>
        </Pressable>;
      })}</View>

      <View style={styles.dayHeading}><View><Text style={styles.selectedDayTitle}>{weekdayTabLabels[selectedWeekday]} · {selectedDateLabel}</Text><Text style={styles.selectedDayCopy}>{completedToday ? `Treino registrado: ${savedCheckin?.workout_focus || savedCheckin?.activity_type}` : selectedDay.isToday ? 'O que você vai treinar hoje?' : isFutureDay ? 'Planeje o treino deste dia' : 'Escolha os grupos treinados neste dia'}</Text></View><View style={[styles.statusDot, completedToday && styles.statusDone]}><Text style={styles.statusText}>{completedToday ? '✓' : isFutureDay ? 'PLANO' : 'DIA'}</Text></View></View>

      <Text style={styles.groupLabel}>GRUPOS MUSCULARES <Text style={styles.groupHint}>· até 3</Text></Text>
      {loadingPlans ? <Text style={styles.helper}>Carregando sua semana…</Text> : <View style={styles.groupGrid}>{trainingMuscleGroups.map((group) => {
        const selected = selectedGroups.includes(group);
        return <Pressable key={group} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleGroup(group)} style={[styles.groupPill, selected && styles.groupPillSelected]}><Text style={[styles.groupText, selected && styles.groupTextSelected]}>{selected ? '✓  ' : '+  '}{group}</Text></Pressable>;
      })}</View>}

      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" disabled={savingPlan || loadingPlans} onPress={() => void savePlan()} style={[styles.savePlanButton, (savingPlan || loadingPlans) && styles.disabled]}><Text style={styles.savePlanText}>{savingPlan ? 'Salvando…' : 'Salvar dia'}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={savingCheckin || completedToday || isFutureDay || loadingPlans} onPress={() => void registerWorkout()} style={[styles.checkinButton, (savingCheckin || completedToday || isFutureDay || loadingPlans) && styles.disabled]}><Text style={styles.checkinText}>{savingCheckin ? 'Registrando…' : completedToday ? 'Treino registrado ✓' : isFutureDay ? 'Check-in no dia do treino' : 'Marcar check-in'}</Text></Pressable>
      </View>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}

      {exercises.length > 0 ? <View style={styles.routine}>
        <View style={styles.routineHeading}><View><Text style={styles.eyebrow}>SÉRIE SUGERIDA</Text><Text style={styles.routineTitle}>{selectedGroups.join(' + ')}</Text></View><Text style={styles.exerciseCount}>{exercises.length} exercícios</Text></View>
        <Text style={styles.helper}>Volumes usuais por sessão: até 4 exercícios para grupos grandes e 2 para grupos menores. As sugestões podem variar conforme sua experiência.</Text>
        {exercises.map((exercise, index) => {
          const key = `${selectedWeekday}-${exercise.name}`;
          const open = activeDemo === key;
          return <View key={key} style={styles.exerciseRow}><View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.exerciseInfo}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseFocus}>{exercise.focus}</Text><Text style={styles.exerciseMeta}>{exercise.sets} séries · {exercise.reps} repetições · pausa {exercise.rest}</Text><Pressable accessibilityRole="button" onPress={() => setActiveDemo(open ? null : key)} style={styles.videoButton}><Text style={styles.videoButtonText}>{open ? 'Fechar vídeo' : '▶  Ver exercício'}</Text></Pressable>{open && exercise.demoVideoId ? <ExerciseDemo videoId={exercise.demoVideoId} title={`Demonstração: ${exercise.name}`} /> : null}{!exercise.demoVideoId ? <Text style={styles.helper}>Demonstração em preparação.</Text> : null}</View></View>;
        })}
      </View> : <View style={styles.emptyRoutine}><Text style={styles.emptyIcon}>✦</Text><Text style={styles.emptyTitle}>Sua série aparece aqui</Text><Text style={styles.helper}>Escolha peito e tríceps, costas e bíceps, pernas ou qualquer combinação que faça sentido para você.</Text></View>}

      <Text style={styles.footerHint}>Sua semana começa na segunda. Na próxima segunda, o painel abre uma nova semana; o histórico antigo continua salvo no seu progresso.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 25, padding: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, marginBottom: 18 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontSize: 22, fontWeight: '900', marginTop: 5 },
  countPill: { minWidth: 61, height: 46, paddingHorizontal: 10, borderRadius: 15, backgroundColor: theme.colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  countText: { color: theme.colors.orange, fontSize: 19, fontWeight: '900' }, countMuted: { color: theme.colors.purpleMuted, fontSize: 12 },
  description: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 8 },
  weekRow: { flexDirection: 'row', gap: 5, marginTop: 17, marginBottom: 19 },
  weekDay: { flex: 1, minWidth: 0, minHeight: 93, alignItems: 'center', justifyContent: 'flex-start', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 3, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line },
  weekDaySelected: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, weekDayDone: { borderBottomColor: theme.colors.orange, borderBottomWidth: 2 },
  weekLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: '900' }, selectedText: { color: theme.colors.white },
  dayMark: { width: 27, height: 27, borderRadius: 14, marginTop: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }, dayMarkDone: { backgroundColor: theme.colors.orange }, dayMarkToday: { borderWidth: 1, borderColor: theme.colors.orange }, dayMarkText: { color: theme.colors.muted, fontSize: 9, fontWeight: '900' }, dayMarkTextDone: { color: theme.colors.dark },
  dayFocus: { color: theme.colors.muted, fontSize: 7, lineHeight: 9, textAlign: 'center', marginTop: 5, minHeight: 18 },
  dayHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 15 },
  selectedDayTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' }, selectedDayCopy: { color: theme.colors.muted, fontSize: 10, marginTop: 4 },
  statusDot: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.purpleSoft }, statusDone: { backgroundColor: theme.colors.orangeSoft }, statusText: { color: theme.colors.orangeDeep, fontSize: 8, fontWeight: '900', letterSpacing: .6 },
  groupLabel: { color: theme.colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: .8, marginTop: 19, marginBottom: 9 }, groupHint: { color: theme.colors.muted, fontWeight: '600' },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, groupPill: { minHeight: 36, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 11, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, groupPillSelected: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, groupText: { color: theme.colors.muted, fontSize: 9, fontWeight: '800' }, groupTextSelected: { color: theme.colors.orange },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 15 }, savePlanButton: { minHeight: 43, minWidth: 105, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.purpleSoft, paddingHorizontal: 13 }, savePlanText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '900' }, checkinButton: { flex: 1, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orange, paddingHorizontal: 13 }, checkinText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900', textAlign: 'center' }, disabled: { opacity: .55 }, notice: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '700', marginTop: 10 },
  routine: { marginTop: 22, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 16 }, routineHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, routineTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900', marginTop: 5 }, exerciseCount: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '800', marginBottom: 2 }, helper: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  exerciseRow: { flexDirection: 'row', gap: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingVertical: 12 }, exerciseNumber: { width: 33, height: 33, borderRadius: 11, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }, exerciseNumberText: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900' }, exerciseInfo: { flex: 1 }, exerciseName: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' }, exerciseFocus: { color: theme.colors.muted, fontSize: 9, marginTop: 3 }, exerciseMeta: { color: theme.colors.orangeDeep, fontSize: 9, fontWeight: '800', marginTop: 5 }, videoButton: { alignSelf: 'flex-start', marginTop: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.purpleSoft }, videoButtonText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' },
  emptyRoutine: { marginTop: 20, padding: 17, borderRadius: 17, backgroundColor: theme.colors.background, alignItems: 'center' }, emptyIcon: { color: theme.colors.orange, fontSize: 20 }, emptyTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900', marginTop: 6 }, footerHint: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 18 },
});

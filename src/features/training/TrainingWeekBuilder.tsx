import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExerciseDemo } from '@/features/training/ExerciseDemo';
import { useAuth } from '@/features/auth/AuthProvider';
import { buildCustomTrainingExercises, getExerciseLibrary, trainingMuscleGroups, type TrainingMuscleGroup } from '@/features/training/programGenerator';
import { getCurrentWeekCheckins, getCurrentWeekStartKey, localDateKey, weekdayTabLabels } from '@/features/training/checkins';
import { theme } from '@/theme';

function normalizeGroupList(value: string | null | undefined): TrainingMuscleGroup[] {
  if (!value) return [];
  return trainingMuscleGroups.filter((group) => value.split(/\s*\+\s*/).includes(group));
}

export function TrainingWeekBuilder() {
  const { profile, workoutCheckinDetails, trainingWeekPlans, refreshTrainingWeekPlans, saveTrainingWeekPlan } = useAuth();
  const [selectedWeekday, setSelectedWeekday] = useState((new Date().getDay() + 6) % 7);
  const [weekKey, setWeekKey] = useState(getCurrentWeekStartKey());
  const [selectedGroups, setSelectedGroups] = useState<TrainingMuscleGroup[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, import('@/features/training/programGenerator').ExerciseVariation>>({});
  const [openVariations, setOpenVariations] = useState<number | null>(null);
  const [openLibraryGroup, setOpenLibraryGroup] = useState<TrainingMuscleGroup | null>(null);
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
  const libraryExercises = useMemo(() => openLibraryGroup ? getExerciseLibrary(openLibraryGroup) : [], [openLibraryGroup]);

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
    const fromPlan = selectedPlan?.muscle_groups?.filter((group): group is TrainingMuscleGroup => trainingMuscleGroups.includes(group as TrainingMuscleGroup)) || [];
    const fromCheckin = normalizeGroupList(savedCheckin?.workout_focus);
    const initialGroups = fromPlan.length ? fromPlan : fromCheckin;
    setSelectedGroups(initialGroups);
    setActiveDemo(null);
    setOpenLibraryGroup(initialGroups[0] || null);
    setSelectedVariations({});
    setOpenVariations(null);
  }, [weekKey, selectedWeekday, selectedPlan?.muscle_groups, savedCheckin?.workout_focus]);

  const toggleGroup = (group: TrainingMuscleGroup) => {
    setNotice('');
    if (selectedGroups.includes(group)) {
      setOpenLibraryGroup((current) => current === group ? null : current);
    } else {
      setOpenLibraryGroup(group);
      setActiveDemo(null);
    }
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

  const selectedDateLabel = new Date(`${selectedDay.key}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <View style={styles.card}>
      <View style={styles.topLine}><View><Text style={styles.eyebrow}>SUA SEMANA</Text><Text style={styles.title}>Treino por dia</Text></View><View style={styles.countPill}><Text style={styles.countText}>{week.count}<Text style={styles.countMuted}>/{profile?.training_days || 3}</Text></Text></View></View>
      <Text style={styles.description}>Toque em um dia e escolha até 3 grupos. Ao selecionar um músculo, você vê uma série curta e abre a biblioteca completa de exercícios.</Text>

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

      <Text style={styles.groupLabel}>GRUPOS MUSCULARES <Text style={styles.groupHint}>· até 3 · toque para ver a biblioteca</Text></Text>
      {loadingPlans ? <Text style={styles.helper}>Carregando sua semana…</Text> : <View style={styles.groupGrid}>{trainingMuscleGroups.map((group) => {
        const selected = selectedGroups.includes(group);
        return <Pressable key={group} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleGroup(group)} style={[styles.groupPill, selected && styles.groupPillSelected]}><Text style={[styles.groupText, selected && styles.groupTextSelected]}>{selected ? '✓  ' : '+  '}{group}</Text></Pressable>;
      })}</View>}
      {selectedGroups.length > 0 ? <View style={styles.libraryShortcuts}><Text style={styles.libraryShortcutLabel}>BIBLIOTECA COMPLETA</Text>{selectedGroups.map((group) => <Pressable key={group} accessibilityRole="button" accessibilityLabel={`Abrir biblioteca de exercícios de ${group}`} onPress={() => { setOpenLibraryGroup(group); setActiveDemo(null); }} style={styles.libraryShortcut}><Text style={styles.libraryShortcutText}>{group} ↗</Text></Pressable>)}</View> : null}

      <View style={styles.actionRow}><Pressable accessibilityRole="button" disabled={savingPlan || loadingPlans} onPress={() => void savePlan()} style={[styles.savePlanButton, styles.savePlanFull, (savingPlan || loadingPlans) && styles.disabled]}><Text style={styles.savePlanText}>{savingPlan ? 'Salvando…' : 'Salvar divisão do dia'}</Text></Pressable></View>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}

      {exercises.length > 0 ? <View style={styles.routine}>
        <View style={styles.routineHeading}><View><Text style={styles.eyebrow}>SÉRIE SUGERIDA</Text><Text style={styles.routineTitle}>{selectedGroups.join(' + ')}</Text></View><Text style={styles.exerciseCount}>{exercises.length} exercícios</Text></View>
        <Text style={styles.helper}>Volumes usuais por sessão: até 4 exercícios para grupos grandes e 2 para grupos menores. As sugestões podem variar conforme sua experiência.</Text>
        {exercises.map((exercise, index) => {
          const shown = selectedVariations[index] ? { ...exercise, ...selectedVariations[index] } : exercise;
          const key = `${selectedWeekday}-${index}-${shown.name}`;
          const open = activeDemo === key;
          const alternativesOpen = openVariations === index;
          return <View key={`${selectedWeekday}-${index}`} style={styles.exerciseRow}>
            <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{String(index + 1).padStart(2, '0')}</Text></View>
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseTitleRow}><Text style={styles.exerciseName}>{shown.name}</Text>{shown.region ? <Text style={styles.regionBadge}>{shown.region}</Text> : null}</View>
              <Text style={styles.exerciseFocus}>Alvo principal: {shown.focus}</Text>
              <Text style={styles.exerciseMeta}>{exercise.sets} séries · {exercise.reps} repetições · pausa {exercise.rest}</Text>
              {exercise.alternatives?.length ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: alternativesOpen }} onPress={() => setOpenVariations(alternativesOpen ? null : index)} style={styles.swapButton}><Text style={styles.swapText}>{alternativesOpen ? 'Fechar opções' : '↻  Trocar por exercício equivalente'}</Text></Pressable> : null}
              {alternativesOpen ? <View style={styles.variationList}><Text style={styles.variationHeading}>Opções para o mesmo grupo muscular</Text>{exercise.alternatives?.map((option) => <Pressable key={option.name} accessibilityRole="button" onPress={() => { setSelectedVariations((current) => ({ ...current, [index]: option })); setOpenVariations(null); setActiveDemo(null); }} style={styles.variationOption}><View style={styles.variationCopy}><Text style={styles.variationName}>{option.name}</Text><Text style={styles.variationFocus}>{option.region ? `${option.region} · ` : ''}{option.focus}</Text></View><Text style={styles.variationArrow}>›</Text></Pressable>)}</View> : null}
              {shown.demoVideoId ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setActiveDemo(open ? null : key)} style={styles.videoButton}><Text style={styles.videoButtonText}>{open ? 'Fechar vídeo' : '▶  Ver exercício'}</Text></Pressable> : <Text style={styles.helper}>Demonstração específica em revisão; não associamos outro movimento a este exercício.</Text>}
              {open && shown.demoVideoId ? <ExerciseDemo videoId={shown.demoVideoId} title={`Demonstração: ${shown.name} · ${shown.focus}`} /> : null}
            </View>
          </View>;
        })}
      </View> : <View style={styles.emptyRoutine}><Text style={styles.emptyIcon}>✦</Text><Text style={styles.emptyTitle}>Sua série aparece aqui</Text><Text style={styles.helper}>Escolha peito e tríceps, costas e bíceps, pernas ou qualquer combinação que faça sentido para você.</Text></View>}

      {openLibraryGroup ? <View style={styles.library}>
        <View style={styles.libraryHeading}><View><Text style={styles.eyebrow}>BIBLIOTECA COMPLETA</Text><Text style={styles.routineTitle}>{openLibraryGroup}</Text></View><Pressable accessibilityRole="button" onPress={() => setOpenLibraryGroup(null)} style={styles.libraryClose}><Text style={styles.libraryCloseText}>Fechar</Text></Pressable></View>
        <Text style={styles.helper}>{libraryExercises.length} opções catalogadas. Os botões de vídeo aparecem somente quando a demonstração corresponde ao movimento.</Text>
        {selectedGroups.length > 1 ? <View style={styles.libraryGroupTabs}>{selectedGroups.map((group) => <Pressable key={group} accessibilityRole="button" accessibilityState={{ selected: openLibraryGroup === group }} onPress={() => { setOpenLibraryGroup(group); setActiveDemo(null); }} style={[styles.libraryGroupTab, openLibraryGroup === group && styles.libraryGroupTabSelected]}><Text style={[styles.libraryGroupTabText, openLibraryGroup === group && styles.libraryGroupTabTextSelected]}>{group}</Text></Pressable>)}</View> : null}
        {openLibraryGroup === 'Peito' ? <View style={styles.chestMap}>
          <Text style={styles.chestMapTitle}>Mapa do peitoral</Text>
          <View style={styles.chestMapRows}><Text style={styles.chestMapTag}>Superior · inclinado 30°</Text><Text style={styles.chestMapTag}>Superior · inclinado 45°</Text><Text style={styles.chestMapTag}>Central · banco reto</Text><Text style={styles.chestMapTag}>Inferior · declinado</Text></View>
          <Text style={styles.chestMapCopy}>O ângulo muda a ênfase entre as porções do peitoral, sem isolar completamente cada faixa. Em inclinações maiores, o ombro da frente pode participar mais. O “miolo” não é um músculo separado.</Text>
        </View> : null}
        {libraryExercises.map((exercise, index) => {
          const key = `library-${openLibraryGroup}-${index}-${exercise.name}`;
          const open = activeDemo === key;
          return <View key={key} style={styles.libraryExercise}>
            <View style={styles.exerciseTitleRow}><Text style={styles.exerciseName}>{exercise.name}</Text>{exercise.region ? <Text style={styles.regionBadge}>{exercise.region}</Text> : null}</View>
            <Text style={styles.exerciseFocus}>Alvo principal: {exercise.focus}</Text>
            {exercise.demoVideoId ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setActiveDemo(open ? null : key)} style={styles.videoButton}><Text style={styles.videoButtonText}>{open ? 'Fechar vídeo' : '▶  Ver demonstração 3D'}</Text></Pressable> : <Text style={styles.helper}>Demonstração específica em revisão; não associamos outro movimento a este exercício.</Text>}
            {open && exercise.demoVideoId ? <ExerciseDemo videoId={exercise.demoVideoId} title={`Demonstração: ${exercise.name} · ${exercise.focus}`} /> : null}
          </View>;
        })}
      </View> : null}

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
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 15 }, savePlanFull: { flex: 1 }, savePlanButton: { minHeight: 43, minWidth: 105, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.purpleSoft, paddingHorizontal: 13 }, savePlanText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '900' }, checkinButton: { flex: 1, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orange, paddingHorizontal: 13 }, checkinText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900', textAlign: 'center' }, disabled: { opacity: .55 }, notice: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '700', marginTop: 10 },
  routine: { marginTop: 22, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 16 }, routineHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, routineTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900', marginTop: 5 }, exerciseCount: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '800', marginBottom: 2 }, helper: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  exerciseRow: { flexDirection: 'row', gap: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingVertical: 12 }, exerciseNumber: { width: 33, height: 33, borderRadius: 11, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }, exerciseNumberText: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900' }, exerciseInfo: { flex: 1 }, exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }, exerciseName: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' }, regionBadge: { color: theme.colors.purpleMuted, backgroundColor: theme.colors.purpleSoft, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900' }, exerciseFocus: { color: theme.colors.muted, fontSize: 9, marginTop: 3 }, exerciseMeta: { color: theme.colors.orangeDeep, fontSize: 9, fontWeight: '800', marginTop: 5 }, videoButton: { alignSelf: 'flex-start', marginTop: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.purpleSoft }, videoButtonText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' },
  libraryShortcuts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 11 }, libraryShortcutLabel: { color: theme.colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: .5 }, libraryShortcut: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: theme.colors.purpleSoft }, libraryShortcutText: { color: theme.colors.purpleMuted, fontSize: 8, fontWeight: '900' },
  library: { marginTop: 21, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 16 }, libraryHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, libraryClose: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, libraryCloseText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' }, libraryExercise: { borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingVertical: 12 }, libraryGroupTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }, libraryGroupTab: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, libraryGroupTabSelected: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, libraryGroupTabText: { color: theme.colors.muted, fontSize: 8, fontWeight: '800' }, libraryGroupTabTextSelected: { color: theme.colors.orange }, chestMap: { marginTop: 13, padding: 13, borderRadius: 15, backgroundColor: theme.colors.dark }, chestMapTitle: { color: theme.colors.white, fontSize: 12, fontWeight: '900' }, chestMapRows: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }, chestMapTag: { color: theme.colors.orange, backgroundColor: '#362342', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6, fontSize: 8, fontWeight: '900' }, chestMapCopy: { color: '#C3B7CC', fontSize: 9, lineHeight: 14, marginTop: 8 },
  swapButton: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.purple, backgroundColor: theme.colors.background }, swapText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' }, variationList: { marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, variationHeading: { color: theme.colors.muted, fontSize: 8, fontWeight: '800', marginBottom: 5 }, variationOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: theme.colors.line }, variationCopy: { flex: 1 }, variationName: { color: theme.colors.ink, fontSize: 10, fontWeight: '900' }, variationFocus: { color: theme.colors.muted, fontSize: 8, marginTop: 2 }, variationArrow: { color: theme.colors.orange, fontSize: 17, fontWeight: '900' },
  emptyRoutine: { marginTop: 20, padding: 17, borderRadius: 17, backgroundColor: theme.colors.background, alignItems: 'center' }, emptyIcon: { color: theme.colors.orange, fontSize: 20 }, emptyTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900', marginTop: 6 }, footerHint: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 18 },
});


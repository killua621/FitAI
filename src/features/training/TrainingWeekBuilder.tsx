import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseDemo } from '@/features/training/ExerciseDemo';
import { WorkoutTimerModal, type WorkoutTimerExercise } from '@/features/training/WorkoutTimerModal';
import { useAuth } from '@/features/auth/AuthProvider';
import { buildCustomTrainingExercises, getExerciseLibrary, trainingMuscleGroups, type TrainingMuscleGroup } from '@/features/training/programGenerator';
import { getCurrentWeekCheckins, getCurrentWeekStartKey, localDateKey, weekdayTabLabels } from '@/features/training/checkins';
import { theme } from '@/theme';

function normalizeExerciseName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

type ActiveWorkoutExercise = WorkoutTimerExercise & {
  index: number;
  exerciseCount: number;
  nextExerciseName?: string;
};

export function TrainingWeekBuilder() {
  const { profile, trainingWeekPlans, refreshTrainingWeekPlans, saveTrainingWeekPlan } = useAuth();
  const [selectedWeekday, setSelectedWeekday] = useState((new Date().getDay() + 6) % 7);
  const [weekKey, setWeekKey] = useState(getCurrentWeekStartKey());
  const [selectedGroups, setSelectedGroups] = useState<TrainingMuscleGroup[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, import('@/features/training/programGenerator').ExerciseVariation>>({});
  const [openVariations, setOpenVariations] = useState<number | null>(null);
  const [openLibraryGroup, setOpenLibraryGroup] = useState<TrainingMuscleGroup | null>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [finishedExercises, setFinishedExercises] = useState<Record<string, boolean>>({});
  const [activeExercise, setActiveExercise] = useState<ActiveWorkoutExercise | null>(null);
  const [timerVisible, setTimerVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const week = getCurrentWeekCheckins([]);
  const selectedDay = week.days[selectedWeekday];
  const todayKey = localDateKey();
  const selectedPlan = trainingWeekPlans.find((plan) => plan.weekday === selectedWeekday);
  const isFutureDay = selectedDay.key > todayKey;
  const exercises = useMemo(() => buildCustomTrainingExercises(selectedGroups), [selectedGroups]);
  const libraryExercises = useMemo(() => openLibraryGroup ? getExerciseLibrary(openLibraryGroup) : [], [openLibraryGroup]);
  const workoutProgressKey = profile?.id && selectedGroups.length
    ? `scholzfit:workout-progress:${profile.id}:${selectedDay.key}:${selectedGroups.join('-')}`
    : null;
  const [loadedProgressKey, setLoadedProgressKey] = useState<string | null>(null);
  const progressReady = workoutProgressKey === null || loadedProgressKey === workoutProgressKey;

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
    setSelectedGroups(fromPlan);
    setActiveDemo(null);
    setOpenLibraryGroup(fromPlan[0] || null);
    setSelectedVariations({});
    setOpenVariations(null);
  }, [weekKey, selectedWeekday, selectedPlan?.muscle_groups]);

  useEffect(() => {
    setCompletedSets({});
    setFinishedExercises({});
    setActiveExercise(null);
    setTimerVisible(false);
    if (!workoutProgressKey) {
      setLoadedProgressKey(null);
      return;
    }
    let active = true;
    void AsyncStorage.getItem(workoutProgressKey).then((saved) => {
      if (!active) return;
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        const savedSets = parsed.completedSets && typeof parsed.completedSets === 'object'
          ? parsed.completedSets as Record<string, unknown>
          : parsed;
        const safeProgress = Object.fromEntries(Object.entries(savedSets).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0));
        const savedFinished = parsed.finishedExercises && typeof parsed.finishedExercises === 'object'
          ? parsed.finishedExercises as Record<string, unknown>
          : {};
        const safeFinished = Object.fromEntries(Object.entries(savedFinished).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
        setCompletedSets(safeProgress);
        setFinishedExercises(safeFinished);
      } catch {
        setCompletedSets({});
        setFinishedExercises({});
      }
    }).catch(() => {
      if (active) {
        setCompletedSets({});
        setFinishedExercises({});
      }
    }).finally(() => {
      if (active) setLoadedProgressKey(workoutProgressKey);
    });
    return () => { active = false; };
  }, [workoutProgressKey]);

  useEffect(() => {
    if (!workoutProgressKey || loadedProgressKey !== workoutProgressKey) return;
    void AsyncStorage.setItem(workoutProgressKey, JSON.stringify({ completedSets, finishedExercises })).catch(() => {});
  }, [completedSets, finishedExercises, loadedProgressKey, workoutProgressKey]);

  const toggleGroup = (group: TrainingMuscleGroup) => {
    setNotice('');
    setCompletedSets({});
    setFinishedExercises({});
    setActiveExercise(null);
    setTimerVisible(false);
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

  const exerciseKey = (index: number, name: string) => `${selectedDay.key}-${index}-${name}`;
  const getShownExercise = (index: number, exercise: (typeof exercises)[number]) => ({ ...exercise, ...selectedVariations[index] });
  const allExercisesComplete = exercises.length > 0 && exercises.every((exercise, index) => {
    const shown = getShownExercise(index, exercise);
    return finishedExercises[exerciseKey(index, shown.name)] === true;
  });

  const selectedDateLabel = new Date(`${selectedDay.key}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <View style={styles.card}>
      <View style={styles.topLine}><View><Text style={styles.eyebrow}>SUA ROTINA</Text><Text style={styles.title}>Treino por dia</Text></View></View>
      <Text style={styles.description}>Escolha um dia para planejar até 3 grupos musculares. O check-in do treino fica somente na aba Início.</Text>

      <View style={styles.weekRow}>{week.days.map((day, index) => {
        const plan = trainingWeekPlans.find((entry) => entry.weekday === index);
        const dayGroups = plan?.muscle_groups.join(' + ') || '';
        return <Pressable key={day.key} disabled={activeExercise !== null && index !== selectedWeekday} accessibilityRole="button" accessibilityLabel={`${weekdayTabLabels[index]}${dayGroups ? `, rotina: ${dayGroups}` : ', sem rotina salva'}`} accessibilityState={{ selected: index === selectedWeekday }} onPress={() => { setSelectedWeekday(index); setNotice(''); }} style={[styles.weekDay, index === selectedWeekday && styles.weekDaySelected, day.isToday && styles.weekDayToday, activeExercise !== null && index !== selectedWeekday && styles.disabled]}>
          <Text style={[styles.weekLabel, index === selectedWeekday && styles.selectedText]}>{weekdayTabLabels[index]}</Text>
          <View style={[styles.dayMark, index === selectedWeekday && styles.dayMarkSelected, day.isToday && styles.dayMarkToday, Boolean(plan) && styles.dayMarkPlanned]}><Text style={[styles.dayMarkText, Boolean(plan) && styles.dayMarkTextPlanned, index === selectedWeekday && styles.dayMarkTextSelected]}>{Boolean(plan) ? '•' : String(Number(day.key.slice(-2)))}</Text></View>
          <Text numberOfLines={2} style={[styles.dayFocus, index === selectedWeekday && styles.selectedText]}>{dayGroups || (day.isToday ? 'Hoje' : '—')}</Text>
        </Pressable>;
      })}</View>

      <View style={styles.dayHeading}><View><Text style={styles.selectedDayTitle}>{weekdayTabLabels[selectedWeekday]} · {selectedDateLabel}</Text><Text style={styles.selectedDayCopy}>{selectedPlan ? `Rotina salva: ${selectedPlan.muscle_groups.join(' + ')}` : selectedDay.isToday ? 'Monte sua rotina para hoje' : isFutureDay ? 'Planeje o treino deste dia' : 'Revise ou monte a rotina deste dia'}</Text></View><View style={[styles.statusDot, selectedPlan && styles.statusDone]}><Text style={styles.statusText}>{selectedPlan ? 'SALVO' : selectedDay.isToday ? 'HOJE' : 'PLANO'}</Text></View></View>

      <Text style={styles.groupLabel}>GRUPOS MUSCULARES <Text style={styles.groupHint}>· até 3 · toque para ver a biblioteca</Text></Text>
      {loadingPlans ? <Text style={styles.helper}>Carregando sua semana…</Text> : <View style={styles.groupGrid}>{trainingMuscleGroups.map((group) => {
        const selected = selectedGroups.includes(group);
        return <Pressable key={group} disabled={activeExercise !== null} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleGroup(group)} style={[styles.groupPill, selected && styles.groupPillSelected, activeExercise !== null && styles.disabled]}><Text style={[styles.groupText, selected && styles.groupTextSelected]}>{selected ? '✓  ' : '+  '}{group}</Text></Pressable>;
      })}</View>}
      {selectedGroups.length > 0 ? <View style={styles.libraryShortcuts}><Text style={styles.libraryShortcutLabel}>BIBLIOTECA COMPLETA</Text>{selectedGroups.map((group) => <Pressable key={group} accessibilityRole="button" accessibilityLabel={`Abrir biblioteca de exercícios de ${group}`} onPress={() => { setOpenLibraryGroup(group); setActiveDemo(null); }} style={styles.libraryShortcut}><Text style={styles.libraryShortcutText}>{group} ↗</Text></Pressable>)}</View> : null}

      <View style={styles.actionRow}><Pressable accessibilityRole="button" disabled={savingPlan || loadingPlans} onPress={() => void savePlan()} style={[styles.savePlanButton, styles.savePlanFull, (savingPlan || loadingPlans) && styles.disabled]}><Text style={styles.savePlanText}>{savingPlan ? 'Salvando…' : 'Salvar divisão do dia'}</Text></Pressable></View>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}

      {exercises.length > 0 ? <View style={styles.routine}>
        <View style={styles.routineHeading}><View><Text style={styles.eyebrow}>SÉRIE SUGERIDA</Text><Text style={styles.routineTitle}>{selectedGroups.join(' + ')}</Text></View><Text style={styles.exerciseCount}>{exercises.length} exercícios</Text></View>
        <Text style={styles.helper}>Peito, costas, pernas, glúteos e abdômen: 3 séries. Ombros, braços e outros grupos menores: 2. Descanso de 1:30.</Text>
        {activeExercise && !timerVisible ? <Pressable accessibilityRole="button" onPress={() => setTimerVisible(true)} style={styles.resumeTimer}>
          <View style={styles.resumeIcon}><Text style={styles.resumeIconText}>⏱</Text></View>
          <View style={styles.resumeCopy}><Text style={styles.resumeTitle}>Cronômetro em andamento</Text><Text style={styles.resumeSubtitle}>{activeExercise.name} · toque para voltar</Text></View>
          <Text style={styles.resumeArrow}>›</Text>
        </Pressable> : null}
        {exercises.map((exercise, index) => {
          const shown = getShownExercise(index, exercise);
          const key = exerciseKey(index, shown.name);
          const open = activeDemo === key;
          const alternativesOpen = openVariations === index;
          const exercisesAlreadyInRoutine = new Set(exercises.map((item, itemIndex) => normalizeExerciseName(getShownExercise(itemIndex, item).name)));
          const availableAlternatives = (exercise.alternatives || []).filter((option) => !exercisesAlreadyInRoutine.has(normalizeExerciseName(option.name)));
          const done = Math.min(completedSets[key] || 0, exercise.sets);
          const isComplete = finishedExercises[key] === true;
          const thisExerciseActive = activeExercise?.key === key;
          const anotherExerciseActive = activeExercise !== null && !thisExerciseActive;
          return <View key={`${selectedDay.key}-${index}-${shown.name}`} style={[styles.exerciseCard, isComplete && styles.exerciseCardDone]}>
            <View style={styles.exerciseCardTop}>
              <View style={[styles.exerciseNumber, isComplete && styles.exerciseNumberDone]}><Text style={[styles.exerciseNumberText, isComplete && styles.exerciseNumberTextDone]}>{isComplete ? '✓' : String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseTitleRow}><Text style={styles.exerciseName}>{shown.name}</Text>{shown.region ? <Text style={styles.regionBadge}>{shown.region}</Text> : null}<Text style={[styles.setStatus, isComplete && styles.setStatusDone]}>{isComplete ? 'FEITO' : `${done}/${exercise.sets} séries`}</Text></View>
                <Text style={styles.exerciseFocus}>Alvo principal: {shown.focus}</Text>
                <Text style={styles.exerciseMeta}>{exercise.sets} séries · {exercise.reps} repetições · descanso {exercise.rest}</Text>
                <View style={styles.setProgressTrack}><View style={[styles.setProgressFill, { width: `${Math.round((done / exercise.sets) * 100)}%` }]} /></View>
              </View>
            </View>
            {availableAlternatives.length ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: alternativesOpen }} disabled={activeExercise !== null} onPress={() => setOpenVariations(alternativesOpen ? null : index)} style={[styles.swapButton, activeExercise !== null && styles.disabled]}><Text style={styles.swapText}>{alternativesOpen ? 'Fechar opções' : '↻  Trocar por exercício equivalente'}</Text></Pressable> : null}
            {alternativesOpen && availableAlternatives.length ? <View style={styles.variationList}><Text style={styles.variationHeading}>Alternativas do mesmo grupo que ainda não estão neste treino</Text>{availableAlternatives.map((option) => <Pressable key={option.name} accessibilityRole="button" disabled={activeExercise !== null} onPress={() => { setSelectedVariations((current) => ({ ...current, [index]: option })); setOpenVariations(null); setActiveDemo(null); }} style={styles.variationOption}><View style={styles.variationCopy}><Text style={styles.variationName}>{option.name}</Text><Text style={styles.variationFocus}>{option.region ? `${option.region} · ` : ''}{option.focus}</Text></View><Text style={styles.variationArrow}>›</Text></Pressable>)}</View> : null}
            <View style={styles.exerciseActions}>
              {shown.demoVideoId ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setActiveDemo(open ? null : key)} style={styles.videoButton}><Text style={styles.videoButtonText}>{open ? 'Fechar vídeo' : '▶  Ver vídeo'}</Text></Pressable> : null}
              <Pressable accessibilityRole="button" disabled={!progressReady || isComplete || anotherExerciseActive} onPress={() => {
                if (thisExerciseActive) { setTimerVisible(true); return; }
                setActiveExercise({ key, index, exerciseCount: exercises.length, nextExerciseName: exercises[index + 1] ? getShownExercise(index + 1, exercises[index + 1]).name : undefined, name: shown.name, focus: shown.focus, reps: exercise.reps, sets: exercise.sets, rest: exercise.rest, demoVideoId: shown.demoVideoId });
                setTimerVisible(true);
              }} style={[styles.startExerciseButton, (!progressReady || isComplete || anotherExerciseActive) && styles.disabled]}>
                <Text style={styles.startExerciseText}>{!progressReady ? 'Carregando séries…' : isComplete ? '✓ FEITO' : thisExerciseActive && done >= exercise.sets ? 'Terminei · marcar FEITO' : thisExerciseActive ? 'Retomar cronômetro' : anotherExerciseActive ? 'Conclua a série em andamento' : 'Iniciar exercício  →'}</Text>
              </Pressable>
            </View>
            {open && shown.demoVideoId ? <View style={styles.demoPreview}><ExerciseDemo videoId={shown.demoVideoId} title={`Demonstração: ${shown.name} · ${shown.focus}`} /></View> : null}
            {!shown.demoVideoId ? <Text style={styles.helper}>Demonstração específica em revisão; não associamos outro movimento a este exercício.</Text> : null}
          </View>;
        })}
        {allExercisesComplete ? <View style={styles.finishCard}>
          <View style={styles.finishIcon}><Text style={styles.finishIconText}>✓</Text></View>
          <Text style={styles.finishTitle}>Treino concluído!</Text>
          <Text style={styles.finishCopy}>Todos os exercícios estão marcados como FEITO. Registre o check-in na aba Início.</Text>
        </View> : null}
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
          const matchingRoutineIndex = exercises.findIndex((routineExercise, routineIndex) => getShownExercise(routineIndex, routineExercise).name === exercise.name);
          const key = matchingRoutineIndex >= 0
            ? exerciseKey(matchingRoutineIndex, exercise.name)
            : `library-${selectedDay.key}-${openLibraryGroup}-${index}-${exercise.name}`;
          const open = activeDemo === key;
          const done = Math.min(completedSets[key] || 0, exercise.sets);
          const isComplete = finishedExercises[key] === true;
          const thisExerciseActive = activeExercise?.key === key;
          const anotherExerciseActive = activeExercise !== null && !thisExerciseActive;
          return <View key={key} style={styles.libraryExercise}>
            <View style={styles.exerciseTitleRow}><Text style={styles.exerciseName}>{exercise.name}</Text>{exercise.region ? <Text style={styles.regionBadge}>{exercise.region}</Text> : null}</View>
            <Text style={styles.exerciseFocus}>Alvo principal: {exercise.focus}</Text>
            <Text style={styles.exerciseMeta}>{exercise.sets} séries · {exercise.reps} repetições · descanso {exercise.rest}</Text>
            <Text style={styles.exerciseMeta}>{isComplete ? 'FEITO' : `${done}/${exercise.sets} séries concluídas`}</Text>
            <View style={styles.setProgressTrack}><View style={[styles.setProgressFill, { width: `${Math.round((done / exercise.sets) * 100)}%` }]} /></View>
            <View style={styles.exerciseActions}>
            {exercise.demoVideoId ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setActiveDemo(open ? null : key)} style={styles.videoButton}><Text style={styles.videoButtonText}>{open ? 'Fechar vídeo' : '▶  Ver demonstração 3D'}</Text></Pressable> : <Text style={styles.helper}>Demonstração específica em revisão; não associamos outro movimento a este exercício.</Text>}
            <Pressable accessibilityRole="button" disabled={!progressReady || isComplete || anotherExerciseActive} onPress={() => {
              setActiveExercise({ key, index, exerciseCount: libraryExercises.length, nextExerciseName: libraryExercises[index + 1]?.name, name: exercise.name, focus: exercise.focus, reps: exercise.reps, sets: exercise.sets, rest: exercise.rest, demoVideoId: exercise.demoVideoId });
              setTimerVisible(true);
            }} style={[styles.startExerciseButton, (!progressReady || isComplete || anotherExerciseActive) && styles.disabled]}>
              <Text style={styles.startExerciseText}>{!progressReady ? 'Carregando séries…' : isComplete ? '✓ FEITO' : thisExerciseActive && done >= exercise.sets ? 'Terminei · marcar FEITO' : thisExerciseActive ? 'Retomar cronômetro' : anotherExerciseActive ? 'Conclua a série em andamento' : 'Iniciar exercício  →'}</Text>
            </Pressable>
            </View>
            {open && exercise.demoVideoId ? <ExerciseDemo videoId={exercise.demoVideoId} title={`Demonstração: ${exercise.name} · ${exercise.focus}`} /> : null}
          </View>;
        })}
      </View> : null}

      <Text style={styles.footerHint}>Sua semana começa na segunda. Na próxima segunda, o painel abre uma nova semana; o histórico antigo continua salvo no seu progresso.</Text>
      {activeExercise ? <WorkoutTimerModal
        key={activeExercise.key}
        visible={timerVisible}
        exercise={activeExercise}
        exerciseNumber={activeExercise.index + 1}
        exerciseCount={activeExercise.exerciseCount}
        nextExerciseName={activeExercise.nextExerciseName}
        initialCompletedSets={completedSets[activeExercise.key] || 0}
        onSetProgress={(count) => setCompletedSets((current) => ({ ...current, [activeExercise.key]: count }))}
        onDismiss={() => setTimerVisible(false)}
        onFinishExercise={() => {
          setFinishedExercises((current) => ({ ...current, [activeExercise.key]: true }));
          setTimerVisible(false);
          setActiveExercise(null);
        }}
      /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 25, padding: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, marginBottom: 18 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontSize: 22, fontWeight: '900', marginTop: 5 },
  description: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  weekRow: { flexDirection: 'row', gap: 5, marginTop: 17, marginBottom: 19 },
  weekDay: { flex: 1, minWidth: 0, minHeight: 93, alignItems: 'center', justifyContent: 'flex-start', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 3, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line },
  weekDaySelected: { backgroundColor: theme.colors.pinkSurface, borderColor: theme.colors.pink }, weekDayToday: { borderBottomColor: theme.colors.orange, borderBottomWidth: 2 },
  weekLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '900' }, selectedText: { color: theme.colors.pinkMuted },
  dayMark: { width: 27, height: 27, borderRadius: 14, marginTop: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }, dayMarkSelected: { backgroundColor: theme.colors.pink }, dayMarkPlanned: { backgroundColor: theme.colors.orangeSoft }, dayMarkToday: { borderWidth: 1, borderColor: theme.colors.orange }, dayMarkText: { color: theme.colors.muted, fontSize: 9, fontWeight: '900' }, dayMarkTextPlanned: { color: theme.colors.orange, fontSize: 15 }, dayMarkTextSelected: { color: '#27101F' },
  dayFocus: { color: theme.colors.muted, fontSize: 8, lineHeight: 10, textAlign: 'center', marginTop: 5, minHeight: 20 },
  dayHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 15 },
  selectedDayTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' }, selectedDayCopy: { color: theme.colors.muted, fontSize: 10, marginTop: 4 },
  statusDot: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.purpleSoft }, statusDone: { backgroundColor: theme.colors.orangeSoft }, statusText: { color: theme.colors.orangeDeep, fontSize: 8, fontWeight: '900', letterSpacing: .6 },
  groupLabel: { color: theme.colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: .8, marginTop: 19, marginBottom: 9 }, groupHint: { color: theme.colors.muted, fontWeight: '600' },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, groupPill: { minHeight: 38, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 11, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, groupPillSelected: { backgroundColor: theme.colors.pink, borderColor: theme.colors.pink }, groupText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, groupTextSelected: { color: '#27101F' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 15 }, savePlanFull: { flex: 1 }, savePlanButton: { minHeight: 47, minWidth: 105, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.pink, paddingHorizontal: 13 }, savePlanText: { color: '#27101F', fontSize: 10, fontWeight: '900' }, checkinButton: { flex: 1, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orange, paddingHorizontal: 13 }, checkinText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900', textAlign: 'center' }, disabled: { opacity: .55 }, notice: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '700', marginTop: 10 },
  routine: { marginTop: 22, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 16 }, routineHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, routineTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900', marginTop: 5 }, exerciseCount: { color: theme.colors.pinkMuted, fontSize: 10, fontWeight: '800', marginBottom: 2 }, helper: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 8 },
  exerciseRow: { flexDirection: 'row', gap: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingVertical: 12 }, exerciseNumber: { width: 33, height: 33, borderRadius: 11, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }, exerciseNumberText: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900' }, exerciseInfo: { flex: 1 }, regionBadge: { color: theme.colors.purpleMuted, backgroundColor: theme.colors.purpleSoft, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900' }, videoButton: { minHeight: 39, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11, borderRadius: 12, backgroundColor: theme.colors.purpleSoft }, videoButtonText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '900' },
  resumeTimer: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 66, paddingHorizontal: 12, marginTop: 15, borderRadius: 16, backgroundColor: theme.colors.pinkSoft, borderWidth: 1, borderColor: theme.colors.pink }, resumeIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.colors.pink, alignItems: 'center', justifyContent: 'center' }, resumeIconText: { color: '#27101F', fontSize: 17 }, resumeCopy: { flex: 1 }, resumeTitle: { color: theme.colors.ink, fontSize: 11, fontWeight: '900' }, resumeSubtitle: { color: theme.colors.pinkMuted, fontSize: 10, marginTop: 4 }, resumeArrow: { color: theme.colors.pinkMuted, fontSize: 24, fontWeight: '800' },
  exerciseCard: { marginTop: 12, padding: 13, borderRadius: 18, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, exerciseCardDone: { borderColor: theme.colors.pinkSurface }, exerciseCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, exerciseNumberDone: { backgroundColor: theme.colors.pink }, exerciseNumberTextDone: { color: '#27101F' }, exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }, exerciseName: { color: theme.colors.ink, fontSize: 14, lineHeight: 19, fontWeight: '900' }, setStatus: { color: theme.colors.pinkMuted, fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, backgroundColor: theme.colors.pinkSoft }, setStatusDone: { color: theme.colors.pinkMuted, backgroundColor: theme.colors.pinkSurface }, exerciseFocus: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, exerciseMeta: { color: theme.colors.pinkDeep, fontSize: 10, lineHeight: 15, fontWeight: '800', marginTop: 6 }, setProgressTrack: { height: 4, borderRadius: 3, backgroundColor: theme.colors.surfaceRaised, marginTop: 9, overflow: 'hidden' }, setProgressFill: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.pink },
  exerciseActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 11 }, startExerciseButton: { flex: 1, minHeight: 43, minWidth: 150, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.pink, paddingHorizontal: 10 }, startExerciseText: { color: '#27101F', fontSize: 10, textAlign: 'center', fontWeight: '900' }, demoPreview: { overflow: 'hidden', borderRadius: 13, marginTop: 9 },
  finishCard: { alignItems: 'center', padding: 18, marginTop: 18, borderRadius: 19, backgroundColor: theme.colors.pinkSoft, borderWidth: 1, borderColor: theme.colors.pinkSurface }, finishIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.pink }, finishIconText: { color: '#27101F', fontSize: 18, fontWeight: '900' }, finishTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '900', marginTop: 9 }, finishCopy: { color: theme.colors.pinkMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 5 }, finishButton: { minHeight: 43, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.pink, marginTop: 13 }, finishButtonText: { color: '#27101F', fontSize: 10, fontWeight: '900', textAlign: 'center', paddingHorizontal: 8 },
  libraryShortcuts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 11 }, libraryShortcutLabel: { color: theme.colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: .5 }, libraryShortcut: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: theme.colors.purpleSoft }, libraryShortcutText: { color: theme.colors.purpleMuted, fontSize: 8, fontWeight: '900' },
  library: { marginTop: 21, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 16 }, libraryHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, libraryClose: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, libraryCloseText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' }, libraryExercise: { borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingVertical: 12 }, libraryGroupTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }, libraryGroupTab: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, libraryGroupTabSelected: { backgroundColor: theme.colors.pinkSurface, borderColor: theme.colors.pink }, libraryGroupTabText: { color: theme.colors.muted, fontSize: 8, fontWeight: '800' }, libraryGroupTabTextSelected: { color: theme.colors.pinkMuted }, chestMap: { marginTop: 13, padding: 13, borderRadius: 15, backgroundColor: theme.colors.dark }, chestMapTitle: { color: theme.colors.white, fontSize: 12, fontWeight: '900' }, chestMapRows: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }, chestMapTag: { color: theme.colors.orange, backgroundColor: '#362342', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6, fontSize: 8, fontWeight: '900' }, chestMapCopy: { color: '#C3B7CC', fontSize: 9, lineHeight: 14, marginTop: 8 },
  swapButton: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.purple, backgroundColor: theme.colors.background }, swapText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '900' }, variationList: { marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, variationHeading: { color: theme.colors.muted, fontSize: 8, fontWeight: '800', marginBottom: 5 }, variationOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: theme.colors.line }, variationCopy: { flex: 1 }, variationName: { color: theme.colors.ink, fontSize: 10, fontWeight: '900' }, variationFocus: { color: theme.colors.muted, fontSize: 8, marginTop: 2 }, variationArrow: { color: theme.colors.orange, fontSize: 17, fontWeight: '900' },
  emptyRoutine: { marginTop: 20, padding: 17, borderRadius: 17, backgroundColor: theme.colors.background, alignItems: 'center' }, emptyIcon: { color: theme.colors.pink, fontSize: 20 }, emptyTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '900', marginTop: 6 }, footerHint: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 18 },
});


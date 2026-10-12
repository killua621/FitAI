import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExerciseDemo } from '@/features/training/ExerciseDemo';
import { theme } from '@/theme';

export type WorkoutTimerExercise = {
  key: string;
  name: string;
  focus: string;
  reps: string;
  sets: number;
  rest: string;
  demoVideoId?: string;
};

type Props = {
  visible: boolean;
  exercise: WorkoutTimerExercise;
  exerciseNumber: number;
  exerciseCount: number;
  nextExerciseName?: string;
  initialCompletedSets: number;
  onSetProgress: (completedSets: number) => void;
  onDismiss: () => void;
  onFinishExercise: () => void;
};

type Phase = 'working' | 'resting' | 'ready' | 'finished';

export function getRestTimerSeconds(rest: string) {
  const match = rest.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(s|seg(?:undo)?s?|m|min(?:uto)?s?)/i);
  if (!match) return 90;
  const amount = Number(match[1]);
  const unit = match[3].toLowerCase();
  return unit === 'm' || unit.startsWith('min') ? amount * 60 : amount;
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function WorkoutTimerModal({
  visible,
  exercise,
  exerciseNumber,
  exerciseCount,
  nextExerciseName,
  initialCompletedSets,
  onSetProgress,
  onDismiss,
  onFinishExercise,
}: Props) {
  const restSeconds = getRestTimerSeconds(exercise.rest);
  const [phase, setPhase] = useState<Phase>(initialCompletedSets >= exercise.sets ? 'finished' : 'working');
  const [completedSets, setCompletedSets] = useState(initialCompletedSets);
  const [workStartedAt, setWorkStartedAt] = useState(Date.now);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(restSeconds);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (phase === 'working') {
        setElapsed(Math.floor((now - workStartedAt) / 1000));
      } else if (phase === 'resting' && restEndsAt !== null) {
        const secondsLeft = Math.max(0, Math.ceil((restEndsAt - now) / 1000));
        setRemaining(secondsLeft);
        if (secondsLeft === 0) setPhase('ready');
      }
    }, 250);
    return () => clearInterval(interval);
  }, [phase, restEndsAt, workStartedAt]);

  const completeSet = () => {
    const nextCompletedSets = Math.min(exercise.sets, completedSets + 1);
    setCompletedSets(nextCompletedSets);
    onSetProgress(nextCompletedSets);

    if (nextCompletedSets >= exercise.sets) {
      setPhase('finished');
      return;
    }

    const nextRestEndsAt = Date.now() + restSeconds * 1000;
    setRestEndsAt(nextRestEndsAt);
    setRemaining(restSeconds);
    setPhase('resting');
  };

  const startNextSet = () => {
    setElapsed(0);
    setWorkStartedAt(Date.now());
    setPhase('working');
  };

  const skipRest = () => {
    setRestEndsAt(null);
    setRemaining(0);
    setPhase('ready');
  };

  const addRest = () => {
    const nextRestEndsAt = (restEndsAt ?? Date.now()) + 15_000;
    setRestEndsAt(nextRestEndsAt);
    setRemaining((current) => current + 15);
  };

  const timerValue = phase === 'resting' ? remaining : phase === 'ready' ? 0 : elapsed;
  const phaseLabel = phase === 'working'
    ? 'TEMPO DE EXECUÇÃO'
    : phase === 'resting'
      ? 'DESCANSO'
      : phase === 'ready'
        ? 'PRÓXIMA SÉRIE'
        : 'SÉRIES CONCLUÍDAS';
  const repetitionLabel = /(?:s|seg(?:undo)?s?|repetições?|por lado)$/i.test(exercise.reps.trim())
    ? exercise.reps
    : `${exercise.reps} repetições`;
  const setLabel = phase === 'finished'
    ? `${exercise.sets} de ${exercise.sets} séries`
    : `${Math.min(completedSets + 1, exercise.sets)} de ${exercise.sets} séries`;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.shade}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>EXERCÍCIO {exerciseNumber} DE {exerciseCount}</Text>
              <Text style={styles.title}>{exercise.name}</Text>
              <Text style={styles.focus}>{exercise.focus}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Minimizar cronômetro" onPress={onDismiss} style={styles.closeButton}>
              <Text style={styles.closeText}>⌄</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.timerPanel, phase === 'resting' && styles.restPanel, phase === 'finished' && styles.finishedPanel]}>
              <Text style={styles.phaseLabel}>{phaseLabel}</Text>
              <Text accessibilityLiveRegion="polite" style={styles.timer}>{formatTime(timerValue)}</Text>
              <Text style={styles.setLabel}>{setLabel} · {repetitionLabel}</Text>
              {phase === 'resting' ? <Text style={styles.restHint}>Respire e prepare-se para a próxima série.</Text> : null}
              {phase === 'ready' ? <Text style={styles.restHint}>Pausa concluída. Comece quando estiver pronto.</Text> : null}
              {phase === 'finished' ? <Text style={styles.restHint}>{nextExerciseName ? `Próximo: ${nextExerciseName}` : 'Você chegou ao fim da série de hoje.'}</Text> : null}
            </View>

            {phase === 'working' ? (
              <Pressable accessibilityRole="button" onPress={completeSet} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{completedSets + 1 >= exercise.sets ? 'Concluir última série' : 'Série concluída · iniciar descanso'}</Text>
              </Pressable>
            ) : null}

            {phase === 'resting' ? (
              <View style={styles.restActions}>
                <Pressable accessibilityRole="button" onPress={skipRest} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Pular descanso</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={addRest} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>+ 15 segundos</Text>
                </Pressable>
              </View>
            ) : null}

            {phase === 'ready' ? (
              <Pressable accessibilityRole="button" onPress={startNextSet} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Iniciar série {completedSets + 1}</Text>
              </Pressable>
            ) : null}

            {phase === 'finished' ? (
              <Pressable accessibilityRole="button" onPress={onFinishExercise} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Terminei · marcar FEITO</Text>
              </Pressable>
            ) : null}

            {exercise.demoVideoId ? (
              <>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: demoOpen }} onPress={() => setDemoOpen((open) => !open)} style={styles.demoButton}>
                  <Text style={styles.demoButtonText}>{demoOpen ? 'Fechar demonstração' : '▶  Rever demonstração'}</Text>
                </Pressable>
                {demoOpen ? <View style={styles.demoFrame}><ExerciseDemo videoId={exercise.demoVideoId} title={`Demonstração: ${exercise.name}`} /></View> : null}
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(5,3,8,0.82)' },
  card: { width: '100%', maxWidth: 560, maxHeight: '92%', alignSelf: 'center', borderTopLeftRadius: 29, borderTopRightRadius: 29, paddingHorizontal: 21, paddingTop: 22, paddingBottom: 28, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 17, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  headerCopy: { flex: 1 },
  eyebrow: { color: theme.colors.pinkDeep, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' },
  title: { color: theme.colors.ink, fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 6 },
  focus: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  closeButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.pinkSoft },
  closeText: { color: theme.colors.pinkMuted, fontSize: 24, fontWeight: '700', lineHeight: 28 },
  scrollContent: { paddingBottom: 8 },
  timerPanel: { alignItems: 'center', justifyContent: 'center', borderRadius: 23, paddingVertical: 23, paddingHorizontal: 14, marginTop: 17, backgroundColor: theme.colors.purpleSoft, borderWidth: 1, borderColor: theme.colors.pinkSurface },
  restPanel: { backgroundColor: theme.colors.pinkSoft, borderColor: theme.colors.pink },
  finishedPanel: { backgroundColor: theme.colors.orangeSoft, borderColor: theme.colors.orange },
  phaseLabel: { color: theme.colors.pinkMuted, fontSize: 10, letterSpacing: 1.5, fontWeight: '900' },
  timer: { color: theme.colors.white, fontSize: 66, lineHeight: 76, fontVariant: ['tabular-nums'], fontWeight: '900', letterSpacing: -2, marginTop: 4 },
  setLabel: { color: theme.colors.ink, fontSize: 12, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  restHint: { color: '#D8C7D8', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 10 },
  primaryButton: { minHeight: 53, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.pink, paddingHorizontal: 14, marginTop: 15 },
  primaryButtonText: { color: '#27101F', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  restActions: { gap: 8 },
  secondaryButton: { minHeight: 45, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line },
  secondaryButtonText: { color: theme.colors.pinkMuted, fontSize: 11, fontWeight: '800' },
  demoButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, marginTop: 10 },
  demoButtonText: { color: theme.colors.purpleMuted, fontSize: 11, fontWeight: '800' },
  demoFrame: { width: '100%', overflow: 'hidden', borderRadius: 14, marginTop: 8 },
});


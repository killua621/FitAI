import { demoVideoFor, exerciseCatalog, getExerciseAlternatives } from '@/features/training/exerciseCatalog';

export type TrainingProfile = {
  age?: number | null;
  goal?: string | null;
  experience_level?: string | null;
  training_days?: number | null;
  training_emphasis?: 'automatic' | 'balanced' | 'lower_body' | 'upper_body' | null;
  energy_equation_profile?: 'female' | 'male' | null;
};

export type ExerciseVariation = { name: string; focus: string; region?: string; demoVideoId: string };
export type Exercise = { name: string; focus: string; region?: string; area?: string; sets: number; reps: string; rest: string; demoVideoId: string; alternatives?: ExerciseVariation[] };
export type TrainingSession = { id: string; title: string; focus: string; exercises: Exercise[]; duration: number };
export type TrainingProgram = { title: string; subtitle: string; sessions: TrainingSession[]; method: string; cardio: string };

export type ExerciseSeed = { name: string; focus: string; reps?: string; rest?: string; priority?: boolean; region?: string; area?: string };
type SessionSeed = { title: string; focus: string; exercises: ExerciseSeed[] };

export const trainingMuscleGroups = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Trapézio', 'Antebraços',
  'Quadríceps', 'Posterior de coxa', 'Glúteos', 'Adutores', 'Panturrilhas', 'Abdômen', 'Lombar',
] as const;
export type TrainingMuscleGroup = (typeof trainingMuscleGroups)[number];

const largeMuscleGroups = new Set<TrainingMuscleGroup>([
  'Peito', 'Costas', 'Quadríceps', 'Posterior de coxa', 'Glúteos', 'Abdômen',
]);
const twoSetMuscleGroups = new Set<TrainingMuscleGroup>(trainingMuscleGroups.filter((group) => !largeMuscleGroups.has(group)));

function getSetsForGroup(group: TrainingMuscleGroup) {
  return twoSetMuscleGroups.has(group) ? 2 : 3;
}

export function buildCustomTrainingExercises(groups: TrainingMuscleGroup[]): Exercise[] {
  const seeds = uniqueExercises(groups.flatMap((group) =>
    exerciseCatalog[group].slice(0, largeMuscleGroups.has(group) ? 4 : 2).map((exercise) => ({ exercise, group })),
  ));
  return seeds.map(({ exercise, group }) => ({
    ...exercise,
    sets: getSetsForGroup(group),
    reps: exercise.reps || '8–12',
    rest: exercise.rest || '90–120 s',
    demoVideoId: demoVideoFor(exercise.name),
    alternatives: getExerciseAlternatives(exercise, group),
  }));
}

export function getExerciseLibrary(group: TrainingMuscleGroup): Exercise[] {
  return exerciseCatalog[group].map((exercise) => ({
    ...exercise,
    sets: getSetsForGroup(group),
    reps: exercise.reps || '8–12',
    rest: exercise.rest || '90 s',
    demoVideoId: demoVideoFor(exercise.name),
    alternatives: getExerciseAlternatives(exercise, group),
  }));
}

function uniqueExercises<T extends ExerciseSeed | { exercise: ExerciseSeed; group: TrainingMuscleGroup }>(exercises: T[]) {
  const seen = new Set<string>();
  return exercises.filter((item) => {
    const exercise = (item as { exercise?: ExerciseSeed }).exercise || item as ExerciseSeed;
    const key = exercise.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const squat = (name = 'Agachamento com halteres'): ExerciseSeed => ({ name, focus: 'Quadríceps e glúteos' });
const hinge = (name = 'Stiff com barra'): ExerciseSeed => ({ name, focus: 'Posterior de coxa e glúteos' });
const push = (name = 'Supino reto com halteres'): ExerciseSeed => ({ name, focus: 'Peito e tríceps' });
const pull = (name = 'Remada baixa na polia'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const verticalPush = (name = 'Desenvolvimento sentado'): ExerciseSeed => ({ name, focus: 'Ombros e tríceps' });
const verticalPull = (name = 'Puxada na frente'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const hip = (name = 'Elevação pélvica'): ExerciseSeed => ({ name, focus: 'Glúteos' });
const core = (name = 'Prancha'): ExerciseSeed => ({ name, focus: 'Estabilidade do tronco', reps: '20–40 s', rest: '90 s' });

const templatesByDays: Record<number, SessionSeed[]> = {
  2: [
    { title: 'Treino A · Corpo todo', focus: 'Base de força', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Variação e equilíbrio', exercises: [squat('Afundo no Smith'), verticalPush(), verticalPull(), hip(), core('Prancha lateral')] },
  ],
  3: [
    { title: 'Treino A · Corpo todo', focus: 'Agachar e empurrar', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Unilateral e puxadas', exercises: [squat('Afundo no Smith'), verticalPush(), verticalPull(), hip(), core('Prancha lateral')] },
    { title: 'Treino C · Corpo todo', focus: 'Variação e estabilidade', exercises: [squat('Leg press horizontal'), push('Supino inclinado com halteres'), pull('Remada baixa na polia'), hinge('Mesa flexora'), core('Prancha lateral')] },
  ],
  4: [
    { title: 'Treino A · Superior', focus: 'Empurrar e puxar', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Superior', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa na polia'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), core('Prancha lateral')] },
    { title: 'Treino D · Inferior', focus: 'Unilateral e glúteos', exercises: [squat('Afundo no Smith'), hinge('Stiff com barra'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Superior', focus: 'Peito e costas', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Base de pernas', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Empurrar', focus: 'Peito, ombros e tríceps', exercises: [push('Supino inclinado com halteres'), verticalPush(), { name: 'Supino máquina', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino D · Puxar', focus: 'Costas e bíceps', exercises: [verticalPull(), pull('Remada baixa'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Prancha lateral')] },
    { title: 'Treino E · Inferior', focus: 'Variação de pernas', exercises: [squat('Leg press horizontal'), hinge('Stiff com barra'), hip('Elevação pélvica'), { name: 'Afundo no Smith', focus: 'Quadríceps e glúteos' }, core('Prancha lateral')] },
  ],
  6: [
    { title: 'Treino A · Empurrar', focus: 'Peito e ombros', exercises: [push(), verticalPush(), { name: 'Supino máquina', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino B · Puxar', focus: 'Costas', exercises: [verticalPull(), pull(), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Prancha lateral')] },
    { title: 'Treino C · Pernas', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino D · Empurrar', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo na máquina', focus: 'Peito' }, { name: 'Tríceps na polia', focus: 'Tríceps' }, core('Prancha lateral')] },
    { title: 'Treino E · Puxar', focus: 'Remadas e braços', exercises: [verticalPull('Puxada neutra'), pull('Remada baixa na polia'), { name: 'Pulldown com corda', focus: 'Costas · extensão do ombro' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core('Prancha lateral')] },
    { title: 'Treino F · Pernas', focus: 'Unilateral e estabilidade', exercises: [squat('Afundo no Smith'), hinge('Stiff com barra'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
};

const lowerBodySessions: Record<number, SessionSeed[]> = {
  3: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Posterior de coxa e glúteos, com manutenção de superiores', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, pull(), push(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Unilateral, quadríceps e glúteo médio', exercises: [squat('Leg press horizontal'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteo médio e abdutores' }, { name: 'Coice na polia', focus: 'Glúteos' }, core('Prancha lateral')] },
  ],
  4: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press horizontal'), squat('Afundo no Smith'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Superiores', focus: 'Ombros, peito e costas', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino E · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press horizontal'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
  ],
  6: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Superiores', focus: 'Ombros, peito e costas', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino E · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino F · Inferiores', focus: 'Posterior, glúteos e panturrilhas', exercises: [squat('Afundo no Smith'), hinge('Stiff com barra'), hip('Ponte de glúteos'), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
  ],
};

const upperBodySessions: Record<number, SessionSeed[]> = {
  3: [
    { title: 'Treino A · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Pernas e estabilidade', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino C · Superiores', focus: 'Costas, ombros e braços', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPull('Puxada com pegada neutra'), verticalPush('Elevação lateral'), { name: 'Tríceps na polia', focus: 'Tríceps' }, core()] },
  ],
  4: [
    { title: 'Treino A · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Pernas e estabilidade', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino C · Superiores', focus: 'Costas, ombros e braços', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPull('Puxada com pegada neutra'), verticalPush('Elevação lateral'), { name: 'Tríceps na polia', focus: 'Tríceps' }, core()] },
    { title: 'Treino D · Superiores', focus: 'Peito, ombros e braços', exercises: [push('Supino máquina'), { name: 'Crucifixo na máquina', focus: 'Peito' }, verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Pernas e estabilidade', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino C · Superiores', focus: 'Costas, ombros e braços', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPull('Puxada com pegada neutra'), verticalPush('Elevação lateral'), { name: 'Tríceps na polia', focus: 'Tríceps' }, core()] },
    { title: 'Treino D · Inferiores', focus: 'Quadríceps e posterior', exercises: [squat('Leg press horizontal'), hinge('Stiff com barra'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, hip('Ponte de glúteos'), core('Prancha lateral')] },
    { title: 'Treino E · Superiores', focus: 'Peito, ombros e braços', exercises: [push('Supino máquina'), { name: 'Crucifixo na máquina', focus: 'Peito' }, verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core()] },
  ],
  6: [
    { title: 'Treino A · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Pernas e estabilidade', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino C · Superiores', focus: 'Costas, ombros e braços', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPull('Puxada com pegada neutra'), verticalPush('Elevação lateral'), { name: 'Tríceps na polia', focus: 'Tríceps' }, core()] },
    { title: 'Treino D · Inferiores', focus: 'Quadríceps e posterior', exercises: [squat('Leg press horizontal'), hinge('Stiff com barra'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, hip('Ponte de glúteos'), core('Prancha lateral')] },
    { title: 'Treino E · Superiores', focus: 'Peito, ombros e braços', exercises: [push('Supino máquina'), { name: 'Crucifixo na máquina', focus: 'Peito' }, verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core()] },
    { title: 'Treino F · Superiores', focus: 'Costas e braços', exercises: [verticalPull('Puxada neutra'), pull('Remada baixa com pegada fechada'), { name: 'Pulldown com corda', focus: 'Costas · extensão do ombro' }, { name: 'Rosca alternada', focus: 'Bíceps' }, { name: 'Tríceps na polia', focus: 'Tríceps' }, core('Prancha lateral')] },
  ],
};

function getSetsForExercise(exercise: ExerciseSeed) {
  const focus = exercise.focus.trim().toLocaleLowerCase('pt-BR');
  const isSmallMuscleFocus = /^(?:ombros?|parte posterior dos ombros|bíceps|tríceps|trapézio|antebraços?|adutores?|panturrilhas?|lombar)\b/.test(focus);
  return isSmallMuscleFocus ? 2 : 3;
}

export function buildTrainingProgram(profile: TrainingProfile): TrainingProgram {
  const days = Math.max(2, Math.min(6, profile.training_days || 3));
  const goal = profile.goal || 'Ganhar massa muscular';
  const reps = goal === 'Melhorar condicionamento' ? '10–15' : '8–12';
  const requestedEmphasis = profile.training_emphasis || 'automatic';
  // This is a product default requested by ScholzFit, not a physiological rule; users can override it.
  const automaticEmphasis = profile.energy_equation_profile === 'female'
    ? 'lower_body'
    : profile.energy_equation_profile === 'male'
      ? 'upper_body'
      : 'balanced';
  const emphasis = requestedEmphasis === 'automatic' ? automaticEmphasis : requestedEmphasis;
  const templates = days >= 3 && emphasis === 'lower_body'
    ? lowerBodySessions[days]
    : days >= 3 && emphasis === 'upper_body'
      ? upperBodySessions[days]
      : templatesByDays[days];
  const sessions = templates.map((session, index) => {
    const twoDayFocusExercise: ExerciseSeed | undefined = days === 2 && emphasis === 'lower_body'
      ? (index === 0 ? { name: 'Cadeira extensora', focus: 'Quadríceps' } : { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' })
      : days === 2 && emphasis === 'upper_body'
        ? (index === 0 ? { name: 'Elevação lateral', focus: 'Ombros' } : { name: 'Rosca alternada', focus: 'Bíceps' })
        : undefined;
    const sessionExercises = uniqueExercises(twoDayFocusExercise ? [...session.exercises, twoDayFocusExercise] : session.exercises);
    return {
    id: `workout-${index + 1}`,
    title: session.title,
    focus: session.focus,
    duration: sessionExercises.length >= 6 ? 55 : sessionExercises.length >= 5 ? 45 : 40,
    exercises: sessionExercises.map((exercise) => ({
      ...exercise,
      sets: getSetsForExercise(exercise),
      reps: exercise.reps || reps,
      rest: exercise.rest || '90–120 s',
      demoVideoId: demoVideoFor(exercise.name),
      alternatives: getExerciseAlternatives(exercise),
    })),
  };
  });

  const title = emphasis === 'lower_body'
    ? 'Força · foco em pernas e glúteos'
    : emphasis === 'upper_body'
      ? 'Força · foco em tronco e braços'
      : goal === 'Perder gordura'
    ? 'Força para todo objetivo'
    : goal === 'Melhorar condicionamento'
      ? 'Força + condicionamento'
      : 'Plano de força progressiva';
  const subtitle = emphasis === 'lower_body'
    ? days >= 6
      ? 'Quatro sessões de inferiores na semana, com superiores também no plano.'
      : days >= 3
        ? 'Três sessões de inferiores na semana, com superiores também no plano.'
        : 'Duas sessões de corpo todo com foco adicional em pernas e glúteos.'
    : emphasis === 'upper_body'
      ? days >= 4
        ? `${days === 6 ? 4 : 3} sessões de superiores na semana, com pernas também no plano.`
        : 'Duas sessões com foco em superiores, mantendo pernas no plano.'
      : goal === 'Ganhar massa muscular'
    ? 'Foco em hipertrofia, técnica estável e progressão gradual.'
    : goal === 'Perder gordura'
      ? 'Treino de força para manter desempenho e construir consistência.'
      : goal === 'Recomposição corporal'
        ? 'Força progressiva e estímulos equilibrados ao longo da semana.'
        : 'Movimentos de força combinados com atividade aeróbica gradual.';

  return {
    title,
    subtitle,
    sessions,
    method: `Use 3 séries nos grupos grandes e 2 para ombros, braços e outros grupos menores. Faça ${reps} repetições controladas, sem precisar chegar à falha em todas as séries. Ao atingir o topo da faixa com técnica estável, aumente a carga aos poucos. Descanse 90 s entre as séries.`,
    cardio: profile.age && profile.age < 18
      ? 'Menores de 18 anos precisam de atividades e progressão adequadas à idade, com supervisão. Este plano foi pensado como referência para adultos.'
      : 'Para adultos, a OMS recomenda acumular 150–300 min de atividade moderada (ou 75–150 min vigorosa) por semana e fortalecer os principais grupos musculares em 2 ou mais dias. Comece de onde está; ganhar massa não exige zerar o cardio.',
  };
}


export type TrainingProfile = {
  age?: number | null;
  goal?: string | null;
  experience_level?: string | null;
  training_days?: number | null;
  training_emphasis?: 'automatic' | 'balanced' | 'lower_body' | 'upper_body' | null;
  energy_equation_profile?: 'female' | 'male' | null;
};

export type Exercise = { name: string; focus: string; sets: number; reps: string; rest: string };
export type TrainingSession = { id: string; title: string; focus: string; exercises: Exercise[]; duration: number };
export type TrainingProgram = { title: string; subtitle: string; sessions: TrainingSession[]; method: string; cardio: string };

type ExerciseSeed = { name: string; focus: string; reps?: string; rest?: string };
type SessionSeed = { title: string; focus: string; exercises: ExerciseSeed[] };

const squat = (name = 'Agachamento goblet ou leg press'): ExerciseSeed => ({ name, focus: 'Quadríceps e glúteos' });
const hinge = (name = 'Levantamento romeno com halteres'): ExerciseSeed => ({ name, focus: 'Posterior de coxa e glúteos' });
const push = (name = 'Supino com halteres ou máquina'): ExerciseSeed => ({ name, focus: 'Peito e tríceps' });
const pull = (name = 'Remada sentada ou com halteres'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const verticalPush = (name = 'Desenvolvimento sentado'): ExerciseSeed => ({ name, focus: 'Ombros e tríceps' });
const verticalPull = (name = 'Puxada na frente'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const hip = (name = 'Elevação pélvica'): ExerciseSeed => ({ name, focus: 'Glúteos' });
const core = (name = 'Prancha ou dead bug'): ExerciseSeed => ({ name, focus: 'Estabilidade do tronco', reps: '20–40 s', rest: '45–60 s' });

const templatesByDays: Record<number, SessionSeed[]> = {
  2: [
    { title: 'Treino A · Corpo todo', focus: 'Base de força', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Variação e equilíbrio', exercises: [squat('Afundo apoiado'), verticalPush(), verticalPull(), hip(), core('Prancha lateral')] },
  ],
  3: [
    { title: 'Treino A · Corpo todo', focus: 'Agachar e empurrar', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Unilateral e puxadas', exercises: [squat('Afundo apoiado'), verticalPush(), verticalPull(), hip(), core('Dead bug')] },
    { title: 'Treino C · Corpo todo', focus: 'Variação e estabilidade', exercises: [squat('Leg press ou sentar e levantar'), push('Supino inclinado com halteres'), pull('Remada unilateral'), hinge('Mesa flexora ou ponte de glúteos'), core('Prancha lateral')] },
  ],
  4: [
    { title: 'Treino A · Superior', focus: 'Empurrar e puxar', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Superior', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), pull('Remada unilateral'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), core('Dead bug')] },
    { title: 'Treino D · Inferior', focus: 'Unilateral e glúteos', exercises: [squat('Afundo apoiado'), hinge('Levantamento romeno leve'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Superior', focus: 'Peito e costas', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Base de pernas', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Empurrar', focus: 'Peito, ombros e tríceps', exercises: [push('Supino inclinado com halteres'), verticalPush(), { name: 'Flexão inclinada', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino D · Puxar', focus: 'Costas e bíceps', exercises: [verticalPull(), pull('Remada baixa'), { name: 'Face pull ou crucifixo inverso', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Dead bug')] },
    { title: 'Treino E · Inferior', focus: 'Variação de pernas', exercises: [squat('Leg press'), hinge('Levantamento romeno'), hip('Elevação pélvica'), { name: 'Afundo apoiado', focus: 'Quadríceps e glúteos' }, core('Prancha lateral')] },
  ],
  6: [
    { title: 'Treino A · Empurrar', focus: 'Peito e ombros', exercises: [push(), verticalPush(), { name: 'Flexão inclinada', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino B · Puxar', focus: 'Costas', exercises: [verticalPull(), pull(), { name: 'Face pull ou crucifixo inverso', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Dead bug')] },
    { title: 'Treino C · Pernas', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino D · Empurrar', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo na máquina', focus: 'Peito' }, { name: 'Tríceps na polia', focus: 'Tríceps' }, core('Prancha lateral')] },
    { title: 'Treino E · Puxar', focus: 'Remadas e braços', exercises: [verticalPull('Puxada neutra'), pull('Remada unilateral'), { name: 'Pullover na polia', focus: 'Costas' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core('Dead bug')] },
    { title: 'Treino F · Pernas', focus: 'Unilateral e estabilidade', exercises: [squat('Afundo apoiado'), hinge('Levantamento romeno leve'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
};

export function buildTrainingProgram(profile: TrainingProfile): TrainingProgram {
  const days = Math.max(2, Math.min(6, profile.training_days || 3));
  const goal = profile.goal || 'Ganhar massa muscular';
  const beginner = profile.experience_level === 'Estou começando';
  const sets = beginner ? 2 : 3;
  const reps = goal === 'Melhorar condicionamento' ? '10–15' : '8–12';
  const requestedEmphasis = profile.training_emphasis || 'automatic';
  const emphasis = requestedEmphasis === 'automatic'
    ? profile.energy_equation_profile === 'female' ? 'lower_body' : profile.energy_equation_profile === 'male' ? 'upper_body' : 'balanced'
    : requestedEmphasis;
  const lowerFocus = /quadríceps|glúteos|coxa|panturrilha|posterior/i;
  const upperFocus = /peito|tríceps|costas|bíceps|ombros|ombro/i;
  const templates = templatesByDays[days];
  const sessions = templates.map((session, index) => ({
    id: `workout-${index + 1}`,
    title: session.title,
    focus: session.focus,
    duration: session.exercises.length >= 5 ? 45 : 40,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      sets: Math.min(4, sets + (emphasis === 'lower_body' && lowerFocus.test(exercise.focus) ? 1 : 0) + (emphasis === 'upper_body' && upperFocus.test(exercise.focus) ? 1 : 0)),
      reps: exercise.reps || reps,
      rest: exercise.rest || '90–120 s',
    })),
  }));

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
    ? 'Mais séries para membros inferiores, mantendo o corpo todo no plano.'
    : emphasis === 'upper_body'
      ? 'Mais séries para tronco e braços, com pernas também presentes na rotina.'
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
    method: `${sets} séries por exercício · ${reps} repetições · termine cada série sentindo que ainda conseguiria fazer 2 ou 3 repetições com boa técnica. Quando alcançar o topo da faixa com controle em todas as séries, aumente a carga um pouco. Descanse 90–120 s nos movimentos principais.`,
    cardio: profile.age && profile.age < 18
      ? 'Menores de 18 anos precisam de atividades e progressão adequadas à idade, com supervisão. Este plano foi pensado como referência para adultos.'
      : 'Para adultos, a OMS recomenda acumular 150–300 min de atividade moderada (ou 75–150 min vigorosa) por semana e fortalecer os principais grupos musculares em 2 ou mais dias. Comece de onde está; ganhar massa não exige zerar o cardio.',
  };
}

export type TrainingProfile = {
  age?: number | null;
  goal?: string | null;
  experience_level?: string | null;
  training_days?: number | null;
  training_emphasis?: 'automatic' | 'balanced' | 'lower_body' | 'upper_body' | null;
  energy_equation_profile?: 'female' | 'male' | null;
};

export type ExerciseVariation = { name: string; focus: string; demoVideoId: string };
export type Exercise = { name: string; focus: string; sets: number; reps: string; rest: string; demoVideoId: string; alternatives?: ExerciseVariation[] };
export type TrainingSession = { id: string; title: string; focus: string; exercises: Exercise[]; duration: number };
export type TrainingProgram = { title: string; subtitle: string; sessions: TrainingSession[]; method: string; cardio: string };

type ExerciseSeed = { name: string; focus: string; reps?: string; rest?: string; priority?: boolean };
type SessionSeed = { title: string; focus: string; exercises: ExerciseSeed[] };
type DemoEntry = { id: string; aliases: string[] };

// IDs do YouTube — todos verificados como vídeos de demonstração do músculo trabalhado (canal Muscle & Motion / tutoriais de execução)
const demoEntries: DemoEntry[] = [
  // MEMBROS INFERIORES
  { id: 'OwWCkwdATnE', aliases: ['Agachamento com halteres', 'Agachamento goblet'] },
  { id: 'F8m05d2upOA', aliases: ['Leg press', 'Leg press horizontal'] },
  { id: 'UORBklZn76k', aliases: ['Afundo apoiado', 'Passada apoiada', 'Afundo', 'Avanço'] },
  { id: 'bW9nLPZebdI', aliases: ['Agachamento búlgaro'] },
  { id: 'I1C3BxSQRb0', aliases: ['Levantamento romeno com halteres', 'Levantamento romeno leve', 'Levantamento romeno'] },
  { id: 'ZPsUi8zwCQ8', aliases: ['Levantamento terra romeno com barra'] },
  { id: 'cOvGedlKlD4', aliases: ['Elevação pélvica', 'Hip thrust', 'Elevação pélvica na máquina'] },
  { id: 'uhGWSh09z9Q', aliases: ['Ponte de glúteos'] },
  { id: 'PzIfB9MiiX8', aliases: ['Cadeira extensora'] },
  { id: 'IXg1PQ_5gmw', aliases: ['Mesa flexora'] },
  { id: 'nabhYLtz8Gg', aliases: ['Cadeira abdutora'] },
  { id: 'Wf602gn_9zU', aliases: ['Cadeira adutora'] },
  { id: 'Zss6E3VU6X0', aliases: ['Cadeira flexora'] },
  { id: 'xiC7SP9ZimY', aliases: ['Coice na polia'] },
  { id: '5Jq-RlfsoCw', aliases: ['Panturrilha em pé', 'Panturrilha no degrau'] },
  { id: '824pMjvGXgc', aliases: ['Panturrilha em pé na máquina'] },
  { id: 'jMWs_p-W9gY', aliases: ['Panturrilha sentado na máquina'] },
  // PEITO
  { id: 'UHa9U-O09_U', aliases: ['Supino reto com barra'] },
  { id: 'hlV6f0kHmeo', aliases: ['Supino reto com halteres'] },
  { id: 'ZaNyRjpoki8', aliases: ['Supino inclinado com halteres'] },
  { id: 'RILogqbMVzQ', aliases: ['Supino máquina', 'Supino na máquina', 'Supino reto na máquina'] },
  { id: 'hV21YJFt6MI', aliases: ['Crucifixo inclinado com halteres'] },
  { id: 'MENdoLpyj7c', aliases: ['Crucifixo na máquina'] },
  { id: 'hV21YJFt6MI', aliases: ['Crucifixo com halteres deitado'] },
  // COSTAS
  { id: 'GDhW19yQrJI', aliases: ['Puxada na frente', 'Puxada com pegada neutra'] },
  { id: 'CAwf7n6Luuc', aliases: ['Puxada neutra', 'Puxada supinada'] },
  { id: 'r4EmE8I74BQ', aliases: ['Remada baixa na polia', 'Remada baixa', 'Remada sentada', 'Remada baixa com pegada fechada'] },
  { id: '2tO6szRdfKQ', aliases: ['Pullover na polia', 'Pullover na máquina'] },
  { id: 'GZbfZ033f74', aliases: ['Remada curvada com barra'] },
  { id: 'pYcpY20QaE8', aliases: ['Remada unilateral com halter'] },
  // OMBROS
  { id: '5I7ogOjvdnc', aliases: ['Desenvolvimento sentado', 'Desenvolvimento com halteres'] },
  { id: 'uh0oZorifmM', aliases: ['Desenvolvimento na máquina'] },
  { id: 'ot9nwSC1JnA', aliases: ['Elevação lateral'] },
  { id: 'wUT3hmnzq3c', aliases: ['Crucifixo inverso na máquina'] },
  { id: 'v_ZkxWykLYE', aliases: ['Elevação frontal com halteres'] },
  { id: 'X5DZcNIrJBo', aliases: ['Crucifixo inverso com halteres', 'Peck deck inverso'] },
  // BÍCEPS
  { id: 'MfsDC0ymFm8', aliases: ['Rosca com halteres', 'Rosca alternada'] },
  { id: '0rRpv6o140o', aliases: ['Rosca martelo'] },
  { id: 'ykJmrZ5v0Oo', aliases: ['Rosca direta com barra'] },
  { id: 'NFzTWp2qpiE', aliases: ['Rosca concentrada'] },
  { id: 'av7-8CzC8Ho', aliases: ['Rosca Scott com barra'] },
  // TRÍCEPS
  { id: 'M88Bt4MMpkI', aliases: ['Tríceps na polia'] },
  { id: 'YJ4kGE3eemY', aliases: ['Tríceps francês com halteres'] },
  { id: 'nTTTjbA0TSU', aliases: ['Tríceps unilateral na polia'] },
  { id: '6SS6K3lAwZ8', aliases: ['Tríceps testa com halteres'] },
  { id: 'kiuVA0gs3EI', aliases: ['Mergulho entre bancos'] },
  // TRAPÉZIO
  { id: 'RhGjwIUe16E', aliases: ['Encolhimento com halteres'] },
  { id: 'tm0IywBhIYM', aliases: ['Remada alta na polia'] },
  { id: 'kVJuikBuI6s', aliases: ['Encolhimento com barra'] },
  // ANTEBRAÇOS
  { id: '3PDPiCoWF-Y', aliases: ['Flexão de punho com barra'] },
  { id: 'Kx8rg0MJX_c', aliases: ['Extensão de punho com barra'] },
  // CORE
  { id: 'z0rx9swRDR0', aliases: ['Extensão lombar'] },
  { id: 'uxPlAbWFUDs', aliases: ['Prancha'] },
  { id: 'x2gzR9zzSCw', aliases: ['Prancha lateral'] },
  { id: 'uAe1Uj3Y05k', aliases: ['Abdominal na máquina'] },
  { id: 'DYNewranZWc', aliases: ['Twist russo pernas levantadas', 'Abdominal russo'] },
  { id: 'iP2fjvG0g3w', aliases: ['Elevação de pernas deitado'] },
  { id: 'XydnEdKATTI', aliases: ['Crunch abdominal'] },
];
const demoVideoFor = (name: string) => demoEntries.find((entry) => entry.aliases.includes(name))?.id || '';

export const trainingMuscleGroups = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Trapézio', 'Antebraços',
  'Quadríceps', 'Posterior de coxa', 'Glúteos', 'Adutores', 'Panturrilhas', 'Abdômen', 'Lombar',
] as const;
export type TrainingMuscleGroup = (typeof trainingMuscleGroups)[number];

// Variações por exercício — mesmo grupo muscular, pelo menos 2 opções de troca
const exerciseAlternatives: Record<string, Array<{ name: string; focus: string }>> = {
  // PEITO
  'Supino reto com halteres': [
    { name: 'Supino reto com barra', focus: 'Peitoral' },
    { name: 'Supino máquina', focus: 'Peitoral' },
  ],
  'Supino inclinado com halteres': [
    { name: 'Crucifixo inclinado com halteres', focus: 'Peitoral superior' },
    { name: 'Supino reto com halteres', focus: 'Peitoral' },
  ],
  'Supino máquina': [
    { name: 'Supino reto com halteres', focus: 'Peitoral' },
    { name: 'Crucifixo na máquina', focus: 'Peitoral' },
  ],
  'Crucifixo na máquina': [
    { name: 'Crucifixo inclinado com halteres', focus: 'Peitoral superior' },
    { name: 'Crucifixo com halteres deitado', focus: 'Peitoral' },
  ],
  // COSTAS
  'Puxada na frente': [
    { name: 'Puxada neutra', focus: 'Dorsais — pegada neutra' },
    { name: 'Puxada com pegada neutra', focus: 'Dorsais' },
  ],
  'Remada baixa na polia': [
    { name: 'Remada unilateral com halter', focus: 'Costas médias e dorsais' },
    { name: 'Remada curvada com barra', focus: 'Costas médias' },
  ],
  'Remada baixa com pegada fechada': [
    { name: 'Remada baixa na polia', focus: 'Costas médias' },
    { name: 'Remada unilateral com halter', focus: 'Costas médias e dorsais' },
  ],
  'Pullover na polia': [
    { name: 'Puxada na frente', focus: 'Dorsais' },
    { name: 'Puxada neutra', focus: 'Dorsais — pegada neutra' },
  ],
  // OMBROS
  'Desenvolvimento sentado': [
    { name: 'Desenvolvimento na máquina', focus: 'Ombros' },
    { name: 'Desenvolvimento com halteres', focus: 'Ombros' },
  ],
  'Desenvolvimento na máquina': [
    { name: 'Desenvolvimento sentado', focus: 'Ombros' },
    { name: 'Elevação lateral', focus: 'Deltoide lateral' },
  ],
  'Elevação lateral': [
    { name: 'Elevação frontal com halteres', focus: 'Deltoide anterior' },
    { name: 'Crucifixo inverso na máquina', focus: 'Deltoide posterior' },
  ],
  'Crucifixo inverso na máquina': [
    { name: 'Crucifixo inverso com halteres', focus: 'Deltoide posterior' },
    { name: 'Elevação lateral', focus: 'Deltoide lateral' },
  ],
  // BÍCEPS
  'Rosca alternada': [
    { name: 'Rosca direta com barra', focus: 'Bíceps — cabeça longa e curta' },
    { name: 'Rosca Scott com barra', focus: 'Bíceps — ênfase na cabeça curta' },
  ],
  'Rosca com halteres': [
    { name: 'Rosca direta com barra', focus: 'Bíceps' },
    { name: 'Rosca concentrada', focus: 'Bíceps — pico muscular' },
  ],
  'Rosca martelo': [
    { name: 'Rosca com halteres', focus: 'Bíceps' },
    { name: 'Rosca concentrada', focus: 'Bíceps — pico muscular' },
  ],
  // TRÍCEPS
  'Tríceps na polia': [
    { name: 'Tríceps unilateral na polia', focus: 'Tríceps — unilateral' },
    { name: 'Mergulho entre bancos', focus: 'Tríceps e peitoral inferior' },
  ],
  'Tríceps francês com halteres': [
    { name: 'Tríceps testa com halteres', focus: 'Tríceps — cabeça longa' },
    { name: 'Tríceps na polia', focus: 'Tríceps' },
  ],
  'Tríceps unilateral na polia': [
    { name: 'Tríceps na polia', focus: 'Tríceps' },
    { name: 'Tríceps francês com halteres', focus: 'Tríceps — cabeça longa' },
  ],
  // TRAPÉZIO
  'Encolhimento com halteres': [
    { name: 'Encolhimento com barra', focus: 'Trapézio superior' },
    { name: 'Remada alta na polia', focus: 'Trapézio e ombros' },
  ],
  'Remada alta na polia': [
    { name: 'Encolhimento com halteres', focus: 'Trapézio superior' },
    { name: 'Encolhimento com barra', focus: 'Trapézio superior' },
  ],
  // QUADRÍCEPS
  'Agachamento com halteres': [
    { name: 'Leg press horizontal', focus: 'Quadríceps e glúteos' },
    { name: 'Agachamento búlgaro', focus: 'Quadríceps e glúteos — unilateral' },
  ],
  'Leg press horizontal': [
    { name: 'Agachamento com halteres', focus: 'Quadríceps e glúteos' },
    { name: 'Cadeira extensora', focus: 'Quadríceps — isolamento' },
  ],
  'Cadeira extensora': [
    { name: 'Agachamento com halteres', focus: 'Quadríceps e glúteos' },
    { name: 'Afundo apoiado', focus: 'Quadríceps e glúteos' },
  ],
  'Afundo apoiado': [
    { name: 'Agachamento búlgaro', focus: 'Quadríceps e glúteos — unilateral' },
    { name: 'Leg press horizontal', focus: 'Quadríceps e glúteos' },
  ],
  'Agachamento búlgaro': [
    { name: 'Afundo apoiado', focus: 'Quadríceps e glúteos' },
    { name: 'Leg press horizontal', focus: 'Quadríceps e glúteos' },
  ],
  // POSTERIOR DE COXA
  'Levantamento romeno com halteres': [
    { name: 'Levantamento terra romeno com barra', focus: 'Posterior de coxa e glúteos — barra' },
    { name: 'Cadeira flexora', focus: 'Posterior de coxa — isolamento' },
  ],
  'Mesa flexora': [
    { name: 'Cadeira flexora', focus: 'Posterior de coxa' },
    { name: 'Levantamento romeno com halteres', focus: 'Posterior de coxa e glúteos' },
  ],
  'Cadeira flexora': [
    { name: 'Mesa flexora', focus: 'Posterior de coxa' },
    { name: 'Levantamento romeno com halteres', focus: 'Posterior de coxa e glúteos' },
  ],
  'Levantamento terra romeno com barra': [
    { name: 'Levantamento romeno com halteres', focus: 'Posterior de coxa e glúteos' },
    { name: 'Mesa flexora', focus: 'Posterior de coxa — isolamento' },
  ],
  // GLÚTEOS
  'Elevação pélvica': [
    { name: 'Ponte de glúteos', focus: 'Glúteos' },
    { name: 'Coice na polia', focus: 'Glúteos — isolamento' },
  ],
  'Ponte de glúteos': [
    { name: 'Elevação pélvica', focus: 'Glúteo máximo' },
    { name: 'Cadeira abdutora', focus: 'Glúteo médio e abdutores' },
  ],
  'Coice na polia': [
    { name: 'Elevação pélvica', focus: 'Glúteo máximo' },
    { name: 'Cadeira abdutora', focus: 'Glúteo médio' },
  ],
  'Cadeira abdutora': [
    { name: 'Coice na polia', focus: 'Glúteos' },
    { name: 'Ponte de glúteos', focus: 'Glúteos' },
  ],
  // ADUTORES
  'Cadeira adutora': [
    { name: 'Afundo apoiado', focus: 'Adutores e quadríceps' },
    { name: 'Agachamento com halteres', focus: 'Adutores e quadríceps' },
  ],
  // PANTURRILHAS
  'Panturrilha em pé na máquina': [
    { name: 'Panturrilha sentado na máquina', focus: 'Sóleo e panturrilhas' },
    { name: 'Panturrilha em pé', focus: 'Panturrilhas' },
  ],
  'Panturrilha sentado na máquina': [
    { name: 'Panturrilha em pé na máquina', focus: 'Panturrilhas' },
    { name: 'Panturrilha em pé', focus: 'Panturrilhas' },
  ],
  // ABDÔMEN
  'Abdominal na máquina': [
    { name: 'Crunch abdominal', focus: 'Abdômen — reto abdominal' },
    { name: 'Elevação de pernas deitado', focus: 'Abdômen inferior' },
  ],
  'Prancha': [
    { name: 'Prancha lateral', focus: 'Oblíquos e estabilidade' },
    { name: 'Abdominal na máquina', focus: 'Abdômen' },
  ],
  'Prancha lateral': [
    { name: 'Prancha', focus: 'Estabilidade do tronco' },
    { name: 'Abdominal russo', focus: 'Oblíquos' },
  ],
  'Abdominal russo': [
    { name: 'Prancha lateral', focus: 'Oblíquos e estabilidade' },
    { name: 'Abdominal na máquina', focus: 'Abdômen' },
  ],
  // LOMBAR
  'Extensão lombar': [
    { name: 'Levantamento romeno com halteres', focus: 'Cadeia posterior e lombar' },
    { name: 'Prancha', focus: 'Estabilidade do tronco e lombar' },
  ],
};

const getAlternatives = (name: string): ExerciseVariation[] =>
  (exerciseAlternatives[name] || []).map((alt) => ({
    ...alt,
    demoVideoId: demoVideoFor(alt.name),
  }));

const exercisesByMuscleGroup: Record<TrainingMuscleGroup, ExerciseSeed[]> = {
  Peito: [
    { name: 'Supino reto com halteres', focus: 'Peitoral' },
    { name: 'Supino inclinado com halteres', focus: 'Peitoral superior' },
    { name: 'Supino máquina', focus: 'Peitoral' },
    { name: 'Crucifixo na máquina', focus: 'Peitoral' },
  ],
  Costas: [
    { name: 'Puxada na frente', focus: 'Dorsais' },
    { name: 'Remada baixa na polia', focus: 'Costas médias' },
    { name: 'Pullover na polia', focus: 'Dorsais' },
    { name: 'Remada baixa com pegada fechada', focus: 'Costas médias' },
  ],
  Ombros: [
    { name: 'Desenvolvimento sentado', focus: 'Ombros' },
    { name: 'Elevação lateral', focus: 'Deltoide lateral', reps: '10–15' },
    { name: 'Desenvolvimento na máquina', focus: 'Ombros' },
    { name: 'Crucifixo inverso na máquina', focus: 'Deltoide posterior', reps: '10–15' },
  ],
  Bíceps: [
    { name: 'Rosca alternada', focus: 'Bíceps', reps: '10–15' },
    { name: 'Rosca martelo', focus: 'Bíceps e braquial', reps: '10–15' },
  ],
  Tríceps: [
    { name: 'Tríceps na polia', focus: 'Tríceps', reps: '10–15' },
    { name: 'Tríceps francês com halteres', focus: 'Tríceps', reps: '10–15' },
  ],
  Trapézio: [
    { name: 'Encolhimento com halteres', focus: 'Trapézio', reps: '10–15' },
    { name: 'Remada alta na polia', focus: 'Trapézio e ombros', reps: '10–15' },
  ],
  Antebraços: [
    { name: 'Flexão de punho com barra', focus: 'Flexores do antebraço', reps: '12–15' },
    { name: 'Extensão de punho com barra', focus: 'Extensores do antebraço', reps: '12–15' },
  ],
  Quadríceps: [
    { name: 'Agachamento com halteres', focus: 'Quadríceps e glúteos' },
    { name: 'Leg press horizontal', focus: 'Quadríceps e glúteos' },
    { name: 'Cadeira extensora', focus: 'Quadríceps', reps: '10–15' },
    { name: 'Afundo apoiado', focus: 'Quadríceps e glúteos' },
  ],
  'Posterior de coxa': [
    { name: 'Levantamento romeno com halteres', focus: 'Posterior de coxa e glúteos' },
    { name: 'Mesa flexora', focus: 'Posterior de coxa', reps: '10–15' },
    { name: 'Cadeira flexora', focus: 'Posterior de coxa', reps: '10–15' },
    { name: 'Levantamento terra romeno com barra', focus: 'Posterior de coxa e glúteos' },
  ],
  Glúteos: [
    { name: 'Elevação pélvica', focus: 'Glúteo máximo' },
    { name: 'Ponte de glúteos', focus: 'Glúteos' },
    { name: 'Coice na polia', focus: 'Glúteos', reps: '10–15' },
    { name: 'Cadeira abdutora', focus: 'Glúteo médio e abdutores', reps: '10–15' },
  ],
  Adutores: [
    { name: 'Cadeira adutora', focus: 'Adutores do quadril', reps: '10–15' },
  ],
  Panturrilhas: [
    { name: 'Panturrilha em pé na máquina', focus: 'Panturrilhas', reps: '10–15' },
    { name: 'Panturrilha sentado na máquina', focus: 'Sóleo e panturrilhas', reps: '10–15' },
  ],
  Abdômen: [
    { name: 'Abdominal na máquina', focus: 'Abdômen', reps: '10–15' },
    { name: 'Prancha', focus: 'Estabilidade do tronco', reps: '20–40 s', rest: '45–60 s' },
    { name: 'Prancha lateral', focus: 'Oblíquos e estabilidade do tronco', reps: '20–40 s', rest: '45–60 s' },
    { name: 'Abdominal russo', focus: 'Oblíquos', reps: '10–15' },
  ],
  Lombar: [
    { name: 'Extensão lombar', focus: 'Eretores da coluna', reps: '10–15' },
    { name: 'Levantamento romeno com halteres', focus: 'Cadeia posterior e estabilização lombar' },
  ],
};

export function buildCustomTrainingExercises(groups: TrainingMuscleGroup[], experienceLevel?: string | null): Exercise[] {
  const beginner = experienceLevel === 'Estou começando';
  const seeds = uniqueExercises(groups.flatMap((group) => exercisesByMuscleGroup[group] || []));
  return seeds.map((exercise) => ({
    ...exercise,
    sets: beginner ? 2 : 3,
    reps: exercise.reps || '8–12',
    rest: exercise.rest || '90–120 s',
    demoVideoId: demoVideoFor(exercise.name),
    alternatives: getAlternatives(exercise.name),
  }));
}

function uniqueExercises(exercises: ExerciseSeed[]) {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    const key = exercise.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const squat = (name = 'Agachamento com halteres'): ExerciseSeed => ({ name, focus: 'Quadríceps e glúteos' });
const hinge = (name = 'Levantamento romeno com halteres'): ExerciseSeed => ({ name, focus: 'Posterior de coxa e glúteos' });
const push = (name = 'Supino reto com halteres'): ExerciseSeed => ({ name, focus: 'Peito e tríceps' });
const pull = (name = 'Remada baixa na polia'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const verticalPush = (name = 'Desenvolvimento sentado'): ExerciseSeed => ({ name, focus: 'Ombros e tríceps' });
const verticalPull = (name = 'Puxada na frente'): ExerciseSeed => ({ name, focus: 'Costas e bíceps' });
const hip = (name = 'Elevação pélvica'): ExerciseSeed => ({ name, focus: 'Glúteos' });
const core = (name = 'Prancha'): ExerciseSeed => ({ name, focus: 'Estabilidade do tronco', reps: '20–40 s', rest: '45–60 s' });

const templatesByDays: Record<number, SessionSeed[]> = {
  2: [
    { title: 'Treino A · Corpo todo', focus: 'Base de força', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Variação e equilíbrio', exercises: [squat('Afundo apoiado'), verticalPush(), verticalPull(), hip(), core('Prancha lateral')] },
  ],
  3: [
    { title: 'Treino A · Corpo todo', focus: 'Agachar e empurrar', exercises: [squat(), push(), pull(), hinge(), core()] },
    { title: 'Treino B · Corpo todo', focus: 'Unilateral e puxadas', exercises: [squat('Afundo apoiado'), verticalPush(), verticalPull(), hip(), core('Prancha lateral')] },
    { title: 'Treino C · Corpo todo', focus: 'Variação e estabilidade', exercises: [squat('Leg press horizontal'), push('Supino inclinado com halteres'), pull('Remada baixa na polia'), hinge('Mesa flexora'), core('Prancha lateral')] },
  ],
  4: [
    { title: 'Treino A · Superior', focus: 'Empurrar e puxar', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Superior', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa na polia'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), core('Prancha lateral')] },
    { title: 'Treino D · Inferior', focus: 'Unilateral e glúteos', exercises: [squat('Afundo apoiado'), hinge('Levantamento romeno leve'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Superior', focus: 'Peito e costas', exercises: [push(), pull(), verticalPush(), verticalPull(), core()] },
    { title: 'Treino B · Inferior', focus: 'Base de pernas', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino C · Empurrar', focus: 'Peito, ombros e tríceps', exercises: [push('Supino inclinado com halteres'), verticalPush(), { name: 'Supino máquina', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino D · Puxar', focus: 'Costas e bíceps', exercises: [verticalPull(), pull('Remada baixa'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Prancha lateral')] },
    { title: 'Treino E · Inferior', focus: 'Variação de pernas', exercises: [squat('Leg press'), hinge('Levantamento romeno'), hip('Elevação pélvica'), { name: 'Afundo apoiado', focus: 'Quadríceps e glúteos' }, core('Prancha lateral')] },
  ],
  6: [
    { title: 'Treino A · Empurrar', focus: 'Peito e ombros', exercises: [push(), verticalPush(), { name: 'Supino máquina', focus: 'Peito e tríceps' }, { name: 'Elevação lateral', focus: 'Ombros' }, core()] },
    { title: 'Treino B · Puxar', focus: 'Costas', exercises: [verticalPull(), pull(), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca com halteres', focus: 'Bíceps' }, core('Prancha lateral')] },
    { title: 'Treino C · Pernas', focus: 'Agachar e dobrar o quadril', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core()] },
    { title: 'Treino D · Empurrar', focus: 'Ângulos diferentes', exercises: [push('Supino inclinado com halteres'), verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo na máquina', focus: 'Peito' }, { name: 'Tríceps na polia', focus: 'Tríceps' }, core('Prancha lateral')] },
    { title: 'Treino E · Puxar', focus: 'Remadas e braços', exercises: [verticalPull('Puxada neutra'), pull('Remada baixa na polia'), { name: 'Pullover na polia', focus: 'Costas' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core('Prancha lateral')] },
    { title: 'Treino F · Pernas', focus: 'Unilateral e estabilidade', exercises: [squat('Afundo apoiado'), hinge('Levantamento romeno leve'), hip('Ponte de glúteos'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, core('Prancha lateral')] },
  ],
};

const lowerBodySessions: Record<number, SessionSeed[]> = {
  3: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Posterior de coxa e glúteos, com manutenção de superiores', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, pull(), push(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Unilateral, quadríceps e glúteo médio', exercises: [squat('Leg press'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteo médio e abdutores' }, { name: 'Coice na polia', focus: 'Glúteos' }, core('Prancha lateral')] },
  ],
  4: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press'), squat('Afundo apoiado'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
  ],
  5: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Superiores', focus: 'Ombros, peito e costas', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino E · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
  ],
  6: [
    { title: 'Treino A · Inferiores', focus: 'Quadríceps e glúteos', exercises: [squat(), hip(), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core()] },
    { title: 'Treino B · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), core('Prancha lateral')] },
    { title: 'Treino C · Inferiores', focus: 'Posterior de coxa e glúteos', exercises: [hinge(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Ponte de glúteos', focus: 'Glúteos' }, { name: 'Coice na polia', focus: 'Glúteos' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
    { title: 'Treino D · Superiores', focus: 'Ombros, peito e costas', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPush('Elevação lateral'), verticalPull('Puxada com pegada neutra'), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino E · Inferiores', focus: 'Unilateral e estabilidade', exercises: [squat('Leg press'), squat('Agachamento búlgaro'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Cadeira abdutora', focus: 'Glúteos e abdutores' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino F · Inferiores', focus: 'Posterior, glúteos e panturrilhas', exercises: [squat('Afundo apoiado'), hinge('Levantamento romeno leve'), hip('Ponte de glúteos'), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, { name: 'Panturrilha em pé', focus: 'Panturrilhas' }, core('Prancha lateral')] },
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
    { title: 'Treino D · Inferiores', focus: 'Quadríceps e posterior', exercises: [squat('Leg press'), hinge('Levantamento romeno leve'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, hip('Ponte de glúteos'), core('Prancha lateral')] },
    { title: 'Treino E · Superiores', focus: 'Peito, ombros e braços', exercises: [push('Supino máquina'), { name: 'Crucifixo na máquina', focus: 'Peito' }, verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core()] },
  ],
  6: [
    { title: 'Treino A · Superiores', focus: 'Peito, costas e braços', exercises: [push(), pull(), verticalPush(), verticalPull(), { name: 'Rosca com halteres', focus: 'Bíceps' }, core()] },
    { title: 'Treino B · Inferiores', focus: 'Pernas e estabilidade', exercises: [squat(), hinge(), hip(), { name: 'Mesa flexora', focus: 'Posterior de coxa' }, core('Prancha lateral')] },
    { title: 'Treino C · Superiores', focus: 'Costas, ombros e braços', exercises: [push('Supino inclinado com halteres'), pull('Remada baixa'), verticalPull('Puxada com pegada neutra'), verticalPush('Elevação lateral'), { name: 'Tríceps na polia', focus: 'Tríceps' }, core()] },
    { title: 'Treino D · Inferiores', focus: 'Quadríceps e posterior', exercises: [squat('Leg press'), hinge('Levantamento romeno leve'), { name: 'Cadeira extensora', focus: 'Quadríceps' }, { name: 'Mesa flexora', focus: 'Posterior de coxa' }, hip('Ponte de glúteos'), core('Prancha lateral')] },
    { title: 'Treino E · Superiores', focus: 'Peito, ombros e braços', exercises: [push('Supino máquina'), { name: 'Crucifixo na máquina', focus: 'Peito' }, verticalPush('Desenvolvimento com halteres'), { name: 'Crucifixo inverso na máquina', focus: 'Parte posterior dos ombros' }, { name: 'Rosca martelo', focus: 'Bíceps e antebraço' }, core()] },
    { title: 'Treino F · Superiores', focus: 'Costas e braços', exercises: [verticalPull('Puxada neutra'), pull('Remada baixa com pegada fechada'), { name: 'Pullover na polia', focus: 'Costas' }, { name: 'Rosca alternada', focus: 'Bíceps' }, { name: 'Tríceps na polia', focus: 'Tríceps' }, core('Prancha lateral')] },
  ],
};

export function buildTrainingProgram(profile: TrainingProfile): TrainingProgram {
  const days = Math.max(2, Math.min(6, profile.training_days || 3));
  const goal = profile.goal || 'Ganhar massa muscular';
  const beginner = profile.experience_level === 'Estou começando';
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
    const twoDayFocusExercise = days === 2 && emphasis === 'lower_body'
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
      sets: exercise.priority ? (beginner ? 3 : 4) : 3,
      reps: exercise.reps || reps,
      rest: exercise.rest || '90–120 s',
      demoVideoId: demoVideoFor(exercise.name),
      alternatives: getAlternatives(exercise.name),
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
    method: `Comece com 3 séries por exercício. Se já treina há algum tempo e mantém boa técnica, os movimentos principais podem ter 4 séries. Faça ${reps} repetições controladas, sem precisar chegar à falha em todas as séries. Ao atingir o topo da faixa com técnica estável, aumente a carga aos poucos. Descanse 90–120 s nos movimentos principais.`,
    cardio: profile.age && profile.age < 18
      ? 'Menores de 18 anos precisam de atividades e progressão adequadas à idade, com supervisão. Este plano foi pensado como referência para adultos.'
      : 'Para adultos, a OMS recomenda acumular 150–300 min de atividade moderada (ou 75–150 min vigorosa) por semana e fortalecer os principais grupos musculares em 2 ou mais dias. Comece de onde está; ganhar massa não exige zerar o cardio.',
  };
}





export type FitnessProfile = {
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
  activity_level?: 'low' | 'light' | 'moderate' | 'high' | null;
  energy_equation_profile?: 'female' | 'male' | null;
};

export type EnergyEstimate = { restingKcal: number; maintenanceLow: number; maintenanceHigh: number; proteinReferenceG: number };

/** Mifflin-St Jeor + a self-reported activity factor: educational adult estimate only. */
export function estimateAdultEnergy(profile: FitnessProfile): EnergyEstimate | null {
  const { age, height_cm: height, weight_kg: weight, energy_equation_profile: equationProfile, activity_level: activity } = profile;
  if (!age || age < 18 || age > 75 || !height || !weight || !equationProfile || !activity) return null;
  const bmi = weight / ((height / 100) ** 2);
  if (bmi < 18.5 || bmi >= 30) return null;
  const restingKcal = 10 * weight + 6.25 * height - 5 * age + (equationProfile === 'male' ? 5 : -161);
  const activityFactors = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
  const maintenance = restingKcal * activityFactors[activity];
  const round50 = (value: number) => Math.round(value / 50) * 50;
  return {
    restingKcal: round50(restingKcal),
    maintenanceLow: round50(maintenance * 0.9),
    maintenanceHigh: round50(maintenance * 1.1),
    proteinReferenceG: Math.round(weight * 1.6),
  };
}

export type BmiScreening = {
  value: number;
  label: string;
  note: string;
  belowAdultRange: boolean;
};

export function calculateAdultBmi(profile: FitnessProfile): BmiScreening | null {
  const { age, height_cm: heightCm, weight_kg: weightKg } = profile;
  if (!age || age < 18 || !heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const value = weightKg / ((heightCm / 100) ** 2);

  if (value < 18.5) {
    return { value, label: 'Abaixo da faixa de referência adulta', note: 'Se seu objetivo for perder peso, não siga uma estratégia de restrição baseada neste app; converse com um profissional de saúde.', belowAdultRange: true };
  }
  if (value < 25) {
    return { value, label: 'Dentro da faixa de referência adulta', note: 'O IMC é apenas um indicador de triagem; ele não avalia composição corporal nem metabolismo.', belowAdultRange: false };
  }
  if (value < 30) {
    return { value, label: 'Acima da faixa de referência adulta', note: 'IMC não distingue gordura de massa muscular. Considere medidas e avaliação individual, especialmente se você treina força.', belowAdultRange: false };
  }
  return { value, label: 'IMC em faixa que merece avaliação individual', note: 'IMC não diagnostica gordura corporal nem saúde. Use-o como triagem e procure orientação individual para metas de peso.', belowAdultRange: false };
}

/** Optional first milestone for motivation, not a clinical target or rate of change. */
export function suggestWeightMilestone(profile: FitnessProfile): number | null {
  const { age, height_cm: heightCm, weight_kg: weightKg, goal } = profile;
  if (!age || age < 18 || !weightKg || weightKg < 20 || !heightCm || heightCm < 80) return null;
  if (goal === 'Ganhar massa muscular') return Math.round((weightKg + 2) * 10) / 10;
  if (goal === 'Perder gordura') {
    const bmi = weightKg / ((heightCm / 100) ** 2);
    if (bmi < 18.5) return null;
    const step = Math.min(5, Math.max(2, Math.round(weightKg * 0.05)));
    return Math.round((weightKg - step) * 10) / 10;
  }
  return null;
}

export type NutritionGuidance = {
  title: string;
  intro: string;
  tips: string[];
  ageNote?: string;
  bmi: BmiScreening | null;
};

export function getNutritionGuidance(profile: FitnessProfile): NutritionGuidance {
  const bmi = calculateAdultBmi(profile);
  const ageNote = profile.age && profile.age < 18
    ? 'As faixas de IMC e metas de energia para adultos não se aplicam a menores de 18 anos. O ScholzFit não calcula dieta para perda ou ganho de peso nesse caso; procure orientação de profissional com um responsável.'
    : !profile.age || !profile.height_cm || !profile.weight_kg
      ? 'Preencha idade, altura e peso no perfil para ver a faixa de IMC adulto. Sem esses dados, não dá para personalizar uma estimativa.'
      : undefined;

  if (profile.age && profile.age < 18) {
    return {
      title: 'Alimentação para apoiar sua rotina',
      intro: 'Priorize refeições variadas e regulares. O app não vai sugerir restrição calórica nem metas de peso para menores.',
      tips: ['Monte refeições com arroz, feijão ou outras leguminosas, verduras, frutas e uma fonte de proteína.', 'Treine com supervisão adequada à sua idade e converse com um profissional de saúde sobre mudanças de peso.'],
      ageNote,
      bmi: null,
    };
  }

  if (profile.goal === 'Perder gordura' && bmi?.belowAdultRange) {
    return {
      title: 'Priorize segurança e saúde',
      intro: 'Seu IMC estimado está abaixo da faixa de referência adulta. Não vou montar uma estratégia para perder peso com esses dados.',
      tips: ['Converse com médico ou nutricionista antes de tentar mudar o peso.', 'Mantenha refeições regulares e treino de força adequado ao seu nível, sem metas agressivas.'],
      ageNote,
      bmi,
    };
  }

  switch (profile.goal) {
    case 'Ganhar massa muscular':
      return {
        title: 'Estratégia para ganhar massa',
        intro: 'Combine treino de força progressivo com refeições suficientes e consistentes. Altura e peso sozinhos não revelam “metabolismo acelerado” nem determinam calorias.',
        tips: ['Aumente porções aos poucos se o peso médio não subir ao longo de algumas semanas; não há um superávit único validado para todo mundo.', 'Inclua fontes de proteína ao longo do dia: feijão, lentilha, ovos, leite/iogurte, peixe, carnes ou tofu.', 'Uma meta-análise em adultos saudáveis que treinam encontrou pouco benefício médio adicional acima de cerca de 1,6 g de proteína/kg/dia; isso é referência de pesquisa, não uma prescrição individual nem exigência de suplemento.'],
        ageNote,
        bmi,
      };
    case 'Perder gordura':
      return {
        title: 'Estratégia gradual para reduzir gordura',
        intro: 'Priorize hábitos que você consiga sustentar. O ScholzFit não fixa calorias com base apenas em altura e peso.',
        tips: ['Faça a base das refeições com alimentos in natura ou minimamente processados, incluindo feijão, verduras, frutas e uma fonte de proteína.', 'Mantenha treino de força para preservar capacidade e massa muscular; cardio pode ser somado gradualmente.', 'Acompanhe a tendência do peso por semanas, junto de medidas, energia e desempenho — não só uma pesagem isolada.'],
        ageNote,
        bmi,
      };
    case 'Recomposição corporal':
      return {
        title: 'Estratégia para recomposição',
        intro: 'Busque evolução de força e consistência alimentar. O peso sozinho não mostra mudanças de músculo e gordura.',
        tips: ['Inclua proteína nas refeições e alimentos variados, como arroz, feijão, legumes, frutas, ovos, laticínios, carnes ou alternativas vegetais.', 'Progrida no treino com técnica e recuperação; registre força, medidas e tendência de peso ao longo do tempo.'],
        ageNote,
        bmi,
      };
    default:
      return {
        title: 'Alimentação para seu ritmo',
        intro: 'Uma base simples ajuda a sustentar seus treinos e sua rotina.',
        tips: ['Varie alimentos in natura ou minimamente processados, com frutas, verduras, leguminosas, cereais e fontes de proteína.', 'Ajuste horários e porções à sua fome, rotina e resposta ao treino; o ScholzFit não substitui avaliação nutricional.'],
        ageNote,
        bmi,
      };
  }
}

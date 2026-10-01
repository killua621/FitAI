import { StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { estimateAdultEnergy, getNutritionGuidance } from '@/features/health/fitnessGuidance';
import { WaterTracker } from '@/features/nutrition/WaterTracker';
import { theme } from '@/theme';

const mealsByGoal: Record<string, { time: string; name: string; detail: string }[]> = {
  'Ganhar massa muscular': [
    { time: 'CAFÉ DA MANHÃ', name: 'Aveia, banana e iogurte', detail: 'Some leite ou ovos se fizer sentido para sua rotina.' },
    { time: 'ALMOÇO', name: 'Arroz, feijão e proteína', detail: 'Frango, peixe, ovos ou tofu com legumes e um fio de azeite.' },
    { time: 'LANCHE', name: 'Pão com ovos e fruta', detail: 'Uma opção prática para acrescentar energia e proteína.' },
    { time: 'JANTAR', name: 'Batata, feijão e carne ou tofu', detail: 'Complete com verduras ou legumes que você gosta.' },
  ],
  'Perder gordura': [
    { time: 'CAFÉ DA MANHÃ', name: 'Iogurte natural, aveia e fruta', detail: 'Uma combinação simples com fruta e fonte de proteína.' },
    { time: 'ALMOÇO', name: 'Arroz, feijão e prato colorido', detail: 'Inclua verduras e uma fonte de proteína; ajuste porções sem cortar grupos inteiros.' },
    { time: 'LANCHE', name: 'Fruta e uma fonte de proteína', detail: 'Iogurte, leite ou ovos são opções conforme suas preferências.' },
    { time: 'JANTAR', name: 'Omelete ou tofu com legumes', detail: 'Se tiver fome, inclua arroz, mandioca, batata ou pão.' },
  ],
  'Recomposição corporal': [
    { time: 'CAFÉ DA MANHÃ', name: 'Ovos, pão e fruta', detail: 'Troque os alimentos conforme gosto e disponibilidade.' },
    { time: 'ALMOÇO', name: 'Arroz, feijão, proteína e legumes', detail: 'Uma refeição brasileira variada, sem necessidade de excluir carboidratos.' },
    { time: 'LANCHE', name: 'Iogurte natural com fruta', detail: 'Acrescente aveia ou castanhas se isso combinar com sua rotina.' },
    { time: 'JANTAR', name: 'Peixe, ovos ou leguminosas', detail: 'Sirva com cereais ou tubérculos e vegetais.' },
  ],
};

const defaultMeals = [
  { time: 'CAFÉ DA MANHÃ', name: 'Aveia com banana', detail: 'Aveia, iogurte e fruta da estação' },
  { time: 'ALMOÇO', name: 'Prato equilibrado', detail: 'Arroz, feijão, proteína e vegetais' },
  { time: 'LANCHE', name: 'Fruta e iogurte', detail: 'Uma opção simples para o meio do dia' },
  { time: 'JANTAR', name: 'Refeição variada', detail: 'Proteína, legumes e um acompanhamento' },
];

export default function NutritionScreen() {
  const { profile } = useAuth();
  const guidance = getNutritionGuidance(profile || {});
  const energyEstimate = estimateAdultEnergy(profile || {});
  const hasAdultBodyData = Boolean(profile?.age && profile.age >= 18 && profile.age <= 75 && profile.height_cm && profile.weight_kg);
  const bmi = hasAdultBodyData ? Number(profile!.weight_kg) / ((Number(profile!.height_cm) / 100) ** 2) : null;
  const eligibleForEquation = bmi !== null && bmi >= 18.5 && bmi < 30;
  const meals = mealsByGoal[profile?.goal || ''] || defaultMeals;

  return (
    <Screen scroll footer={<AppTabBar active="/nutrition" />} style={styles.screen}>
      <PageIntro eyebrow="ALIMENTAÇÃO COM CONTEXTO" title="Sua alimentação" description="Ideias e princípios que acompanham seu objetivo, sem transformar estimativas em diagnóstico ou dieta clínica." />
      <View style={styles.waterSection}><View style={styles.sectionTitleRow}><View><Text style={styles.sectionEyebrow}>HÁBITO DO DIA</Text><Text style={styles.sectionTitle}>Sua hidratação</Text></View></View><WaterTracker /></View>

      <View style={styles.guidanceCard}>
        <Text style={styles.sectionEyebrow}>SEU OBJETIVO</Text>
        <Text style={styles.guidanceTitle}>{guidance.title}</Text>
        <Text style={styles.guidanceIntro}>{guidance.intro}</Text>
        {guidance.bmi && <View style={styles.bmiPanel}><View><Text style={styles.bmiEyebrow}>IMC ADULTO ESTIMADO · TRIAGEM</Text><Text style={styles.bmiValue}>{guidance.bmi.value.toFixed(1).replace('.', ',')}</Text><Text style={styles.bmiLabel}>{guidance.bmi.label}</Text></View><Text style={styles.bmiMark}>↗</Text></View>}
        {guidance.ageNote && <Text style={styles.guidanceNotice}>{guidance.ageNote}</Text>}
        {guidance.bmi && <Text style={styles.bmiNote}>{guidance.bmi.note} O IMC não identifica “metabolismo acelerado”.</Text>}
        {energyEstimate && <View style={styles.energyPanel}><Text style={styles.bmiEyebrow}>REFERÊNCIA ENERGÉTICA · ESTIMATIVA</Text><Text style={styles.energyValue}>{energyEstimate.maintenanceLow.toLocaleString('pt-BR')}–{energyEstimate.maintenanceHigh.toLocaleString('pt-BR')} kcal/dia</Text><Text style={styles.energyNote}>Faixa aproximada de manutenção calculada com idade, altura, peso, parâmetro fisiológico e atividade informada. A margem de exibição do FitAI não é um intervalo estatístico: a equação pode errar mais para uma pessoa. Não use como prescrição; acompanhe tendências com nutricionista.</Text><Text style={styles.proteinNote}>Em adultos saudáveis que treinam força, pesquisas encontraram cerca de {energyEstimate.proteinReferenceG} g/dia como referência de proteína (1,6 g/kg). Não é meta clínica nem requisito universal.</Text></View>}
        {!energyEstimate && hasAdultBodyData && eligibleForEquation && <Text style={styles.guidanceNotice}>Para mostrar uma faixa energética estimada, complete atividade diária e parâmetro da equação no onboarding. Se preferir não informar, as orientações por objetivo continuam disponíveis.</Text>}
        {!energyEstimate && hasAdultBodyData && !eligibleForEquation && <Text style={styles.guidanceNotice}>Com esses dados, uma fórmula automática pode não ser adequada. O FitAI mantém as sugestões gerais e recomenda avaliação individual para metas energéticas.</Text>}
        <View style={styles.tips}>{guidance.tips.map((tip, index) => <View key={tip} style={styles.tipRow}><Text style={styles.tipNumber}>0{index + 1}</Text><Text style={styles.tipText}>{tip}</Text></View>)}</View>
      </View>

      <View style={styles.section}><View><Text style={styles.sectionEyebrow}>IDEIAS FLEXÍVEIS</Text><Text style={styles.sectionTitle}>Refeições para inspirar</Text></View><Text style={styles.sectionNote}>EXEMPLOS</Text></View>
      <View style={styles.mealList}>{meals.map((meal, index) => <View key={meal.time} style={styles.mealCard}><View style={styles.mealMark}><Text style={styles.mealMarkText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.mealCopy}><Text style={styles.mealTime}>{meal.time}</Text><Text style={styles.mealName}>{meal.name}</Text><Text style={styles.mealDetail}>{meal.detail}</Text></View></View>)}</View>
      <View style={styles.note}><Text style={styles.noteIcon}>✳</Text><Text style={styles.noteText}>Sugestões baseadas no Guia Alimentar brasileiro. Preferências, alergias, condições de saúde e necessidades clínicas precisam de avaliação individual.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, waterSection: { marginBottom: 27 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 13 }, section: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26, marginBottom: 13 }, sectionEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 5 }, sectionTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '900' }, sectionNote: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: '800', marginBottom: 3 }, guidanceCard: { borderRadius: 23, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 20, marginBottom: 5 }, guidanceTitle: { color: theme.colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '900', marginTop: 2 }, guidanceIntro: { color: theme.colors.muted, fontSize: 12, lineHeight: 19, marginTop: 8 }, bmiPanel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.darkSoft, borderRadius: 16, padding: 15, marginTop: 15 }, bmiEyebrow: { color: theme.colors.orangeDeep, fontSize: 8, letterSpacing: 1, fontWeight: '900' }, bmiValue: { color: theme.colors.ink, fontSize: 25, fontWeight: '900', marginTop: 4 }, bmiLabel: { color: theme.colors.muted, fontSize: 10, marginTop: 2 }, bmiMark: { color: theme.colors.orange, fontSize: 24 }, bmiNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 9 }, energyPanel: { borderRadius: 16, backgroundColor: theme.colors.darkSoft, padding: 15, marginTop: 15 }, energyValue: { color: theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 6 }, energyNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 7 }, proteinNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 9, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 9 }, guidanceNotice: { color: theme.colors.orangeDeep, backgroundColor: theme.colors.orangeSoft, padding: 12, borderRadius: 13, fontSize: 11, lineHeight: 17, marginTop: 13 }, tips: { gap: 13, marginTop: 16 }, tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, tipNumber: { color: theme.colors.orangeDeep, fontSize: 9, fontWeight: '900', marginTop: 2 }, tipText: { flex: 1, color: theme.colors.ink, fontSize: 11, lineHeight: 17 }, mealList: { gap: 10 }, mealCard: { minHeight: 88, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 13 }, mealMark: { width: 43, height: 43, borderRadius: 14, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, mealMarkText: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900' }, mealCopy: { flex: 1 }, mealTime: { color: theme.colors.orangeDeep, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' }, mealName: { color: theme.colors.ink, fontSize: 14, fontWeight: '800', marginTop: 4 }, mealDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, note: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderRadius: 17, backgroundColor: theme.colors.darkSoft, marginTop: 17, marginBottom: 15 }, noteIcon: { color: theme.colors.orangeDeep, fontSize: 20 }, noteText: { flex: 1, color: theme.colors.muted, fontSize: 10, lineHeight: 16, fontWeight: '600' } });

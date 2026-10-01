import { StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { WaterTracker } from '@/features/nutrition/WaterTracker';
import { theme } from '@/theme';

const meals = [
  { time: 'CAFÉ DA MANHÃ', name: 'Aveia com banana', detail: 'Aveia, iogurte e fruta da estação', mark: '01' },
  { time: 'ALMOÇO', name: 'Prato equilibrado', detail: 'Arroz, feijão, proteína e vegetais', mark: '02' },
  { time: 'LANCHE', name: 'Fruta e iogurte', detail: 'Uma opção simples para o meio do dia', mark: '03' },
  { time: 'JANTAR', name: 'Refeição leve', detail: 'Proteína, legumes e um acompanhamento', mark: '04' },
];

export default function NutritionScreen() {
  return (
    <Screen scroll footer={<AppTabBar active="/nutrition" />} style={styles.screen}>
      <PageIntro eyebrow="ALIMENTAÇÃO SEM COMPLICAÇÃO" title="Sua alimentação" description="Ideias simples para organizar o dia, com espaço para adaptar ao que você gosta." />
      <View style={styles.waterSection}><View style={styles.sectionTitleRow}><View><Text style={styles.sectionEyebrow}>HÁBITO DO DIA</Text><Text style={styles.sectionTitle}>Sua hidratação</Text></View><Text style={styles.todayPill}>META · 2 L</Text></View><WaterTracker /></View>
      <View style={styles.section}><View><Text style={styles.sectionEyebrow}>SUGESTÕES SIMPLES</Text><Text style={styles.sectionTitle}>Ideias para o seu dia</Text></View><Text style={styles.sectionNote}>EXEMPLOS</Text></View>
      <View style={styles.mealList}>{meals.map((meal) => <View key={meal.mark} style={styles.mealCard}><View style={styles.mealMark}><Text style={styles.mealMarkText}>{meal.mark}</Text></View><View style={styles.mealCopy}><Text style={styles.mealTime}>{meal.time}</Text><Text style={styles.mealName}>{meal.name}</Text><Text style={styles.mealDetail}>{meal.detail}</Text></View><View style={styles.mealArrowWrap}><Text style={styles.mealArrow}>↗</Text></View></View>)}</View>
      <View style={styles.note}><Text style={styles.noteIcon}>✳</Text><Text style={styles.noteText}>Essas sugestões são exemplos para o MVP. Seu plano ainda não está conectado a um profissional ou serviço de nutrição.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, waterSection: { marginBottom: 33 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 13 }, todayPill: { color: theme.colors.brown, backgroundColor: theme.colors.brownLight, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, fontSize: 8, letterSpacing: 0.7, fontWeight: '900', marginBottom: 3 }, section: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 13 }, sectionEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 5 }, sectionTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '900' }, sectionNote: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: '800', marginBottom: 3 }, mealList: { gap: 11 }, mealCard: { minHeight: 94, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }, mealMark: { width: 47, height: 47, borderRadius: 16, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, mealMarkText: { color: theme.colors.orangeDeep, fontSize: 11, fontWeight: '900' }, mealCopy: { flex: 1 }, mealTime: { color: theme.colors.orangeDeep, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' }, mealName: { color: theme.colors.ink, fontSize: 15, fontWeight: '800', marginTop: 4 }, mealDetail: { color: theme.colors.muted, fontSize: 11, marginTop: 3 }, mealArrowWrap: { width: 31, height: 31, borderRadius: 11, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }, mealArrow: { color: theme.colors.brown, fontSize: 15 }, note: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderRadius: 17, backgroundColor: theme.colors.brownLight, marginTop: 18 }, noteIcon: { color: theme.colors.orangeDeep, fontSize: 20 }, noteText: { flex: 1, color: theme.colors.brown, fontSize: 11, lineHeight: 17, fontWeight: '600' } });



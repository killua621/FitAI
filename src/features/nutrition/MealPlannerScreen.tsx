import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { FoodPlanner } from '@/features/nutrition/FoodPlanner';
import { MealIdea, mealIdeas, nutritionSources } from '@/features/nutrition/nutritionContent';
import { theme } from '@/theme';

const categories = Object.keys(mealIdeas);

export default function MealPlannerScreen() {
  const [category, setCategory] = useState('Almoço');
  const ideas: MealIdea[] = mealIdeas[category] || [];

  return (
    <Screen scroll footer={<AppTabBar active="/nutrition" />} style={styles.screen}>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/nutrition')} style={styles.back}><Text style={styles.backArrow}>←</Text><Text style={styles.backText}>Voltar para alimentação</Text></Pressable>
      <PageIntro eyebrow="SEU PLANEJADOR" title="Monte sua alimentação" description="Pesquise alimentos na TACO, escolha a versão, informe a porção e veja os nutrientes calculados para o que consumiu." />

      <View style={styles.safetyCard}><Text style={styles.safetyIcon}>!</Text><Text style={styles.safetyCopy}><Text style={styles.safetyTitle}>Alergia alimentar? </Text>Não consuma alimentos que causem alergia. Confira os rótulos e ingredientes; o planejador não detecta contaminação cruzada.</Text></View>

      <FoodPlanner />

      <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>IDEIAS FLEXÍVEIS</Text><Text style={styles.sectionTitle}>Inspire-se para a refeição</Text></View></View>
      <View style={styles.categoryRow}>{categories.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[styles.categoryPill, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</View>
      <View style={styles.mealList}>{ideas.map((meal, index) => <View key={meal.id} style={styles.mealCard}><View style={styles.mealTop}><View style={styles.mealNumber}><Text style={styles.mealNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><Text style={styles.mealBadge}>IDEIA FLEXÍVEL</Text></View><Text style={styles.mealTitle}>{meal.name}</Text><Text style={styles.mealIngredients}>{meal.ingredients}</Text><Text style={styles.mealNote}>{meal.note}</Text></View>)}</View>

      <View style={styles.sourcesCard}><Text style={styles.eyebrow}>FONTES DAS INFORMAÇÕES</Text><Text style={styles.sourcesCopy}>O planejador usa os alimentos e valores nutricionais da TACO. Ideias de refeições são educativas, flexíveis e não substituem acompanhamento individual.</Text>{nutritionSources.map((source) => <Text key={source.url} style={styles.sourceLabel}>{source.label}</Text>)}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, marginBottom: 9 }, backArrow: { color: theme.colors.orange, fontSize: 18, fontWeight: '900' }, backText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '800' },
  safetyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 16, backgroundColor: theme.colors.orangeSoft, padding: 12, marginBottom: 13 }, safetyIcon: { color: theme.colors.dark, backgroundColor: theme.colors.orange, width: 23, height: 23, textAlign: 'center', textAlignVertical: 'center', borderRadius: 8, fontSize: 13, fontWeight: '900', overflow: 'hidden' }, safetyCopy: { flex: 1, color: theme.colors.ink, fontSize: 9, lineHeight: 14 }, safetyTitle: { fontWeight: '900' },
  sectionHeading: { marginTop: 22, marginBottom: 12 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' }, sectionTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '900', marginTop: 5 }, categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }, categoryPill: { minHeight: 37, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, categoryActive: { backgroundColor: theme.colors.orange, borderColor: theme.colors.orange }, categoryText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, categoryTextActive: { color: theme.colors.dark }, mealList: { gap: 9 }, mealCard: { borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15 }, mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, mealNumber: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, mealNumberText: { color: theme.colors.orange, fontSize: 10, fontWeight: '900' }, mealBadge: { color: theme.colors.purpleMuted, fontSize: 7, letterSpacing: .7, fontWeight: '900' }, mealTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 10 }, mealIngredients: { color: theme.colors.ink, fontSize: 11, lineHeight: 17, marginTop: 5 }, mealNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 6 }, sourcesCard: { borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15, marginTop: 18, marginBottom: 12 }, sourcesCopy: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 7 }, sourceLabel: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '700', marginTop: 7 },
});

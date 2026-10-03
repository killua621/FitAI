import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { MealIdea, mealIdeas, nutritionSources } from '@/features/nutrition/nutritionContent';
import { theme } from '@/theme';

const categories = Object.keys(mealIdeas);
const focusByGoal: Record<string, { title: string; body: string; ideas: string[] }> = {
  'Ganhar massa muscular': { title: 'Apoie seus treinos com refeições consistentes', body: 'Para ganhar massa, a alimentação precisa acompanhar o treino e a recuperação. Use refeições variadas e inclua uma fonte de proteína ao longo do dia; as quantidades individuais devem ser definidas com nutricionista.', ideas: ['Arroz, feijão e frango ou tofu', 'Batata, ovos e legumes', 'Fruta com iogurte ou grão-de-bico'] },
  'Perder gordura': { title: 'Busque mudanças graduais e sustentáveis', body: 'Priorize refeições que saciam, com verduras, legumes, frutas, feijões e uma fonte de proteína. Não é necessário excluir grupos inteiros de alimentos.', ideas: ['Feijão e vegetais no almoço', 'Fruta como lanche', 'Mantenha alimentos de que gosta em porções adequadas'] },
  'Recomposição corporal': { title: 'Equilibre variedade, treino e rotina', body: 'Uma rotina sustentável combina alimentos variados com treino de força e recuperação. O progresso não depende de um único alimento ou de cortar carboidratos.', ideas: ['Combine arroz e feijão com vegetais', 'Alterne ovos, peixe, frango e leguminosas', 'Acompanhe também força e medidas'] },
  'Melhorar condicionamento': { title: 'Tenha energia para a sua rotina', body: 'Cereais, tubérculos, frutas e leguminosas ajudam a compor refeições com energia. Combine com vegetais e uma fonte de proteína conforme sua preferência.', ideas: ['Arroz, feijão e legumes', 'Banana ou outra fruta', 'Mandioca, batata ou milho'] },
};

export default function NutritionScreen() {
  const { profile } = useAuth();
  const [category, setCategory] = useState('Almoço');
  const goal = profile?.goal || 'Ganhar massa muscular';
  const focus = focusByGoal[goal] || focusByGoal['Ganhar massa muscular'];
  const selectedAllergies = profile?.food_allergies || [];
  const extraRestriction = profile?.food_allergy_notes?.trim() || '';
  const ideas: MealIdea[] = mealIdeas[category] || [];
  const compatibleIdeas = ideas.filter((meal) => !meal.avoids.some((item) => selectedAllergies.includes(item)));

  const openSource = async (url: string) => {
    try { await Linking.openURL(url); }
    catch { Alert.alert('Não foi possível abrir a fonte', 'Confira sua conexão e tente novamente.'); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/nutrition" />} style={styles.screen}>
      <PageIntro eyebrow="COMER BEM, DO SEU JEITO" title="Alimentação" description="Ideias simples de refeições para sua meta, preferências e rotina. Sem dieta rígida ou promessa milagrosa." />

      <View style={styles.goalCard}>
        <Text style={styles.eyebrow}>SUA META · {goal.toUpperCase()}</Text>
        <Text style={styles.goalTitle}>{focus.title}</Text>
        <Text style={styles.copy}>{focus.body}</Text>
        <View style={styles.focusList}>{focus.ideas.map((item, index) => <View key={item} style={styles.focusItem}><Text style={styles.focusNumber}>0{index + 1}</Text><Text style={styles.focusText}>{item}</Text></View>)}</View>
      </View>

      <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>IDEIAS PARA O DIA</Text><Text style={styles.sectionTitle}>Monte uma refeição</Text></View><Text style={styles.sectionHint}>ESCOLHA UM MOMENTO</Text></View>
      <View style={styles.categoryRow}>{categories.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[styles.categoryPill, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</View>

      {extraRestriction ? (
        <View style={styles.safetyCard}><Text style={styles.safetyTitle}>Vamos cuidar dessa informação</Text><Text style={styles.safetyCopy}>Como você cadastrou outra alergia ou restrição no perfil, as sugestões ficam ocultas. Confira ingredientes e rótulos com atenção e converse com um nutricionista para receber opções seguras para você.</Text><Pressable onPress={() => router.push('/profile')} accessibilityRole="button" style={styles.profileLink}><Text style={styles.profileLinkText}>Rever meu perfil  ↗</Text></Pressable></View>
      ) : compatibleIdeas.length ? (
        <View style={styles.mealList}>{compatibleIdeas.map((meal, index) => <View key={meal.id} style={styles.mealCard}><View style={styles.mealTop}><View style={styles.mealNumber}><Text style={styles.mealNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><Text style={styles.mealBadge}>{selectedAllergies.length ? 'FILTRADA PELO SEU PERFIL' : 'IDEIA FLEXÍVEL'}</Text></View><Text style={styles.mealTitle}>{meal.name}</Text><Text style={styles.mealIngredients}>{meal.ingredients}</Text><Text style={styles.mealNote}>{meal.note}</Text></View>)}</View>
      ) : (
        <View style={styles.safetyCard}><Text style={styles.safetyTitle}>Sem sugestões para este momento</Text><Text style={styles.safetyCopy}>As opções desta refeição contêm itens marcados no seu perfil. Escolha outro momento ou revise suas restrições com cuidado.</Text></View>
      )}

      <View style={styles.safetyCard}><Text style={styles.safetyTitle}>{selectedAllergies.length ? 'Atenção às alergias' : 'Precisa ajustar as opções?'}</Text><Text style={styles.safetyCopy}>{selectedAllergies.length ? `Filtramos ingredientes principais com base em: ${selectedAllergies.join(', ')}. Isso não detecta traços, contaminação cruzada, marcas ou todos os ingredientes. Leia sempre o rótulo, inclusive “pode conter”.` : 'Cadastre alergias e restrições no Perfil para filtrar estas ideias. Intolerância à lactose não é o mesmo que alergia ao leite.'}</Text><Pressable onPress={() => router.push('/profile')} accessibilityRole="button" style={styles.profileLink}><Text style={styles.profileLinkText}>Ajustar alergias no perfil  ↗</Text></Pressable></View>

      <View style={styles.sourcesCard}><Text style={styles.eyebrow}>BASEADO EM ORIENTAÇÕES PÚBLICAS</Text><Text style={styles.sourcesTitle}>Como escolhemos as ideias</Text><Text style={styles.sourcesCopy}>Priorizamos variedade e alimentos in natura ou minimamente processados, como recomenda o Guia Alimentar brasileiro. As sugestões são educativas e não substituem um plano individual.</Text>{nutritionSources.map((source) => <Pressable key={source.url} accessibilityRole="link" onPress={() => void openSource(source.url)} style={styles.sourceLink}><Text style={styles.sourceText}>{source.label}  ↗</Text></Pressable>)}</View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, goalCard: { borderRadius: 23, backgroundColor: theme.colors.dark, padding: 20, marginBottom: 26 }, eyebrow: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, goalTitle: { color: theme.colors.white, fontSize: 20, lineHeight: 26, fontWeight: '900', marginTop: 8 }, copy: { color: '#C5B9CB', fontSize: 12, lineHeight: 19, marginTop: 7 }, focusList: { gap: 9, marginTop: 15 }, focusItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#392D43', paddingTop: 10 }, focusNumber: { color: theme.colors.orange, fontSize: 9, fontWeight: '900' }, focusText: { flex: 1, color: theme.colors.white, fontSize: 11, fontWeight: '700' }, sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginBottom: 13 }, sectionTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 5 }, sectionHint: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: '800', marginBottom: 3 }, categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }, categoryPill: { minHeight: 37, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, categoryActive: { backgroundColor: theme.colors.orange, borderColor: theme.colors.orange }, categoryText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, categoryTextActive: { color: theme.colors.dark }, mealList: { gap: 9 }, mealCard: { borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15 }, mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, mealNumber: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }, mealNumberText: { color: theme.colors.orange, fontSize: 10, fontWeight: '900' }, mealBadge: { color: theme.colors.purpleMuted, fontSize: 7, letterSpacing: 0.7, fontWeight: '900' }, mealTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 10 }, mealIngredients: { color: theme.colors.ink, fontSize: 11, lineHeight: 17, marginTop: 5 }, mealNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 6 }, safetyCard: { borderRadius: 18, backgroundColor: theme.colors.orangeSoft, padding: 16, marginTop: 13 }, safetyTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' }, safetyCopy: { color: theme.colors.ink, fontSize: 10, lineHeight: 16, marginTop: 6 }, profileLink: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 5 }, profileLinkText: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900' }, sourcesCard: { borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 17, marginTop: 22 }, sourcesTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 7 }, sourcesCopy: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 6 }, sourceLink: { borderTopWidth: 1, borderTopColor: theme.colors.line, marginTop: 10, paddingTop: 10 }, sourceText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '800' },
});

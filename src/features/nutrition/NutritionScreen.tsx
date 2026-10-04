import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { nutritionSources } from '@/features/nutrition/nutritionContent';
import { theme } from '@/theme';

const focusByGoal: Record<string, { title: string; body: string }> = {
  'Ganhar massa muscular': { title: 'Comer bem também faz parte do treino', body: 'Uma rotina consistente combina refeições variadas, energia suficiente e fontes de proteína ao longo do dia. Ajustes individuais ficam melhores com acompanhamento profissional.' },
  'Perder gordura': { title: 'Mudanças graduais duram mais', body: 'Priorize verduras, legumes, frutas, feijões e uma fonte de proteína. Não é necessário excluir grupos inteiros de alimentos.' },
  'Recomposição corporal': { title: 'Variedade, treino e rotina', body: 'Uma rotina sustentável combina alimentos variados com treino de força e recuperação. O progresso não depende de um único alimento ou de cortar carboidratos.' },
  'Melhorar condicionamento': { title: 'Tenha energia para se movimentar', body: 'Cereais, tubérculos, frutas e leguminosas ajudam a compor refeições com energia. Combine com vegetais e uma fonte de proteína conforme sua preferência.' },
};

export default function NutritionScreen() {
  const { profile } = useAuth();
  const [sourceOpen, setSourceOpen] = useState(false);
  const goal = profile?.goal || 'Ganhar massa muscular';
  const focus = focusByGoal[goal] || focusByGoal['Ganhar massa muscular'];

  const openProfessionalWhatsApp = async () => {
    try { await Linking.openURL('https://wa.me/5521980147390'); }
    catch { Alert.alert('Não foi possível abrir o WhatsApp', 'Tente novamente ou salve +55 21 98014-7390 nos seus contatos.'); }
  };
  const openSource = async (url: string) => {
    try { await Linking.openURL(url); }
    catch { Alert.alert('Não foi possível abrir a fonte', 'Confira sua conexão e tente novamente.'); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/nutrition" />} style={styles.screen}>
      <PageIntro eyebrow="COMER BEM, DO SEU JEITO" title="Alimentação" description="Acompanhe suas escolhas e monte refeições sem deixar a tela carregada." />

      <View style={styles.goalCard}>
        <View style={styles.goalTop}><Text style={styles.eyebrow}>SUA META</Text><View style={styles.goalBadge}><Text style={styles.goalBadgeText}>{goal}</Text></View></View>
        <Text style={styles.goalTitle}>{focus.title}</Text>
        <Text style={styles.copy}>{focus.body}</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/meal-planner' as Href)} style={({ pressed }) => [styles.plannerCard, pressed && styles.plannerPressed]}>
        <View style={styles.plannerIcon}><Text style={styles.plannerGlyph}>＋</Text></View>
        <View style={styles.plannerCopy}><Text style={styles.eyebrow}>PLANEJE SUAS REFEIÇÕES</Text><Text style={styles.plannerTitle}>Montar alimentação</Text><Text style={styles.plannerHint}>Pesquise alimentos na TACO, ajuste as porções e acompanhe os nutrientes.</Text></View>
        <View style={styles.plannerArrow}><Text style={styles.plannerArrowText}>↗</Text></View>
      </Pressable>

      <View style={styles.safetyCard}>
        <View style={styles.safetyIcon}><Text style={styles.safetyIconText}>!</Text></View>
        <View style={styles.safetyCopy}><Text style={styles.safetyTitle}>Ponto de atenção</Text><Text style={styles.safetyText}>Se você tem alergia a algum alimento, não o consuma. Confira sempre os ingredientes e os rótulos; sugestões do app não substituem orientação profissional.</Text></View>
      </View>

      <Pressable accessibilityRole="link" accessibilityLabel="Conversar com a nutricionista Cinthia Firmino pelo WhatsApp" onPress={() => void openProfessionalWhatsApp()} style={styles.expertCard}>
        <View style={styles.expertIcon}><Text style={styles.expertIconText}>◉</Text></View><View style={styles.expertCopy}><Text style={styles.eyebrow}>ACOMPANHAMENTO PROFISSIONAL</Text><Text style={styles.expertTitle}>Cinthia Firmino</Text><Text style={styles.expertSubtitle}>Nutricionista · +55 21 98014-7390</Text></View><Text style={styles.expertArrow}>↗</Text>
      </Pressable>

      <View style={styles.sourcesCard}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: sourceOpen }} onPress={() => setSourceOpen((open) => !open)} style={styles.sourcesToggle}><View><Text style={styles.eyebrow}>NOSSOS PRINCÍPIOS</Text><Text style={styles.sourcesTitle}>Sugestões simples e flexíveis</Text></View><Text style={styles.sourcesArrow}>{sourceOpen ? '−' : '+'}</Text></Pressable>
        {sourceOpen ? <><Text style={styles.sourcesCopy}>Priorizamos variedade e alimentos in natura ou minimamente processados, como recomenda o Guia Alimentar brasileiro. As sugestões são educativas e não substituem um plano individual.</Text>{nutritionSources.map((source) => <Pressable key={source.url} accessibilityRole="link" onPress={() => void openSource(source.url)} style={styles.sourceLink}><Text style={styles.sourceText}>{source.label}  ↗</Text></Pressable>)}</> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 },
  goalCard: { borderRadius: 23, backgroundColor: theme.colors.dark, padding: 19, marginBottom: 13 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' },
  goalBadge: { maxWidth: '68%', borderRadius: 10, backgroundColor: '#392842', paddingHorizontal: 9, paddingVertical: 6 },
  goalBadgeText: { color: theme.colors.orange, fontSize: 8, fontWeight: '900' },
  goalTitle: { color: theme.colors.white, fontSize: 19, lineHeight: 25, fontWeight: '900', marginTop: 11 },
  copy: { color: '#C5B9CB', fontSize: 11, lineHeight: 17, marginTop: 6 },
  plannerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.purple, backgroundColor: theme.colors.purpleSurface, padding: 16, marginBottom: 13 }, plannerPressed: { opacity: .86, transform: [{ scale: .99 }] },
  plannerIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: theme.colors.purple, alignItems: 'center', justifyContent: 'center' }, plannerGlyph: { color: theme.colors.white, fontSize: 24, fontWeight: '400' }, plannerCopy: { flex: 1 }, plannerTitle: { color: theme.colors.white, fontSize: 17, fontWeight: '900', marginTop: 5 }, plannerHint: { color: '#C9BBD2', fontSize: 9, lineHeight: 14, marginTop: 4 }, plannerArrow: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#171019', alignItems: 'center', justifyContent: 'center' }, plannerArrowText: { color: theme.colors.orange, fontSize: 17, fontWeight: '900' },
  safetyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, borderRadius: 19, backgroundColor: theme.colors.orangeSoft, padding: 15, marginBottom: 13 }, safetyIcon: { width: 30, height: 30, borderRadius: 11, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' }, safetyIconText: { color: theme.colors.dark, fontWeight: '900', fontSize: 15 }, safetyCopy: { flex: 1 }, safetyTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' }, safetyText: { color: theme.colors.ink, fontSize: 9, lineHeight: 14, marginTop: 4 },
  expertCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 19, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15, marginBottom: 13 }, expertIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }, expertIconText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' }, expertCopy: { flex: 1 }, expertTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 5 }, expertSubtitle: { color: theme.colors.muted, fontSize: 9, marginTop: 3 }, expertArrow: { color: theme.colors.orange, fontSize: 18, fontWeight: '900' },
  sourcesCard: { borderRadius: 19, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15, marginBottom: 14 }, sourcesToggle: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sourcesTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900', marginTop: 5 }, sourcesArrow: { color: theme.colors.orange, fontSize: 22, fontWeight: '700', paddingHorizontal: 5 }, sourcesCopy: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 8 }, sourceLink: { borderTopWidth: 1, borderTopColor: theme.colors.line, marginTop: 9, paddingTop: 9 }, sourceText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '800' },
});

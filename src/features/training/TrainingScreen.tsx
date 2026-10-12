import { useMemo } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { TrainingWeekBuilder } from '@/features/training/TrainingWeekBuilder';
import { buildTrainingProgram } from '@/features/training/programGenerator';
import { theme } from '@/theme';

export default function TrainingScreen() {
  const { profile } = useAuth();
  const program = useMemo(() => buildTrainingProgram(profile || {}), [profile]);

  const contactTrainer = async () => {
    try { await Linking.openURL('https://wa.me/5521969682162'); }
    catch { Alert.alert('Não foi possível abrir o WhatsApp', 'Tente novamente ou salve o número +55 21 96968-2162 nos seus contatos.'); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/workout" />} style={styles.screen}>
      <PageIntro eyebrow="TREINO GUIADO" title="Seu treino, dia a dia" description="Monte sua semana, explore a biblioteca por músculo e confira demonstrações 3D nos exercícios com vídeo verificado." />

      <TrainingWeekBuilder />

      <View style={styles.guidanceCard}><View style={styles.cardIcon}><Text style={styles.cardIconText}>↗</Text></View><Text style={styles.eyebrow}>COMO PROGREDIR</Text><Text style={styles.cardTitle}>Técnica primeiro, carga aos poucos</Text><Text style={styles.cardCopy}>{program.method}</Text></View>
      <View style={styles.guidanceCard}><View style={styles.cardIcon}><Text style={styles.cardIconText}>⌁</Text></View><Text style={styles.eyebrow}>MOVIMENTO AERÓBICO</Text><Text style={styles.cardTitle}>Força e condicionamento podem andar juntos</Text><Text style={styles.cardCopy}>{program.cardio}</Text></View>

      <View style={styles.trainerCard}>
        <View><Text style={styles.eyebrow}>ACOMPANHAMENTO PROFISSIONAL</Text><Text style={styles.trainerTitle}>Fale com seu personal trainer</Text><Text style={styles.trainerName}>Marcos Paulo · Personal trainer</Text><Text style={styles.trainerPhone}>+55 21 96968-2162</Text></View>
        <Pressable accessibilityRole="link" accessibilityLabel="Conversar com Marcos Paulo pelo WhatsApp" onPress={() => void contactTrainer()} style={styles.whatsappButton}><Text style={styles.whatsappGlyph}>◉</Text><Text style={styles.whatsappText}>Chamar no WhatsApp</Text><Text style={styles.whatsappArrow}>↗</Text></Pressable>
      </View>
      <Text style={styles.safety}>Treino educativo. Ajuste cargas à sua experiência, use os vídeos para revisar a execução e interrompa se sentir dor. Se tiver lesão ou condição de saúde, converse com um profissional.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 },
  workoutHero: { overflow: 'hidden', borderRadius: 24, backgroundColor: '#25112F', borderWidth: 1, borderColor: theme.colors.pink, padding: 18, marginBottom: 18 },
  heroGlow: { position: 'absolute', top: -44, right: -34, width: 160, height: 160, borderRadius: 80, backgroundColor: theme.colors.pinkSurface, opacity: 0.85 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: theme.colors.pink, alignItems: 'center', justifyContent: 'center' },
  heroIconText: { color: '#27101F', fontSize: 20, fontWeight: '900' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, backgroundColor: '#3D1D3B', paddingHorizontal: 9, paddingVertical: 7 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.orange },
  heroBadgeText: { color: theme.colors.pinkMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  heroKicker: { color: theme.colors.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 17 },
  heroCopy: { color: '#E0D3E6', fontSize: 11, lineHeight: 17, marginTop: 6 },
  heroSteps: { flexDirection: 'row', gap: 6, marginTop: 15 },
  heroStep: { flex: 1, minHeight: 62, justifyContent: 'center', borderRadius: 13, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: 'rgba(255,93,187,0.10)', borderWidth: 1, borderColor: 'rgba(255,93,187,0.35)' },
  heroStepNumber: { color: theme.colors.pink, fontSize: 9, fontWeight: '900' },
  heroStepLabel: { color: theme.colors.white, fontSize: 8, lineHeight: 12, fontWeight: '800', marginTop: 4 },
  heroFinish: { color: theme.colors.pinkMuted, fontSize: 9, lineHeight: 14, fontWeight: '700', marginTop: 10 },
  heroTargets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  heroTargetLarge: { borderRadius: 9, backgroundColor: '#3B2132', paddingHorizontal: 8, paddingVertical: 6 },
  heroTargetSmall: { borderRadius: 9, backgroundColor: '#30203E', paddingHorizontal: 8, paddingVertical: 6 },
  heroTargetText: { color: theme.colors.orangeDeep, fontSize: 7, fontWeight: '900', letterSpacing: 0.4 },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' },
  guidanceCard: { borderRadius: 21, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 17, marginBottom: 11 },
  cardIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: theme.colors.purpleSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  cardIconText: { color: theme.colors.orange, fontSize: 19, fontWeight: '900' },
  cardTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900', lineHeight: 21, marginTop: 6 },
  cardCopy: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 6 },
  trainerCard: { borderRadius: 21, backgroundColor: theme.colors.dark, borderWidth: 1, borderColor: theme.colors.line, padding: 18, marginTop: 7 },
  trainerTitle: { color: theme.colors.white, fontSize: 17, fontWeight: '900', marginTop: 7 },
  trainerName: { color: '#E0D3E6', fontSize: 11, fontWeight: '800', marginTop: 7 },
  trainerPhone: { color: '#B5A6C0', fontSize: 10, marginTop: 4 },
  whatsappButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 13, borderRadius: 13, backgroundColor: '#25D366', marginTop: 14 },
  whatsappGlyph: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }, whatsappText: { color: '#092313', fontSize: 10, fontWeight: '900' }, whatsappArrow: { color: '#092313', fontSize: 14, fontWeight: '900' },
  safety: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 14, marginBottom: 12 },
});



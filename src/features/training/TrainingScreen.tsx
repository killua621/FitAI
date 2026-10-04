import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { getCurrentWeekCheckins } from '@/features/training/checkins';
import { TrainingWeekBuilder } from '@/features/training/TrainingWeekBuilder';
import { buildTrainingProgram } from '@/features/training/programGenerator';
import { theme } from '@/theme';

export default function TrainingScreen() {
  const { profile, workoutCheckinDates } = useAuth();
  const program = buildTrainingProgram(profile || {});
  const week = getCurrentWeekCheckins(workoutCheckinDates);
  const goalDays = Math.max(1, profile?.training_days || 3);
  const weeklyProgress = Math.min(100, Math.round((week.count / goalDays) * 100));

  const contactTrainer = async () => {
    try { await Linking.openURL('https://wa.me/5521969682162'); }
    catch { Alert.alert('Não foi possível abrir o WhatsApp', 'Tente novamente ou salve o número +55 21 96968-2162 nos seus contatos.'); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/workout" />} style={styles.screen}>
      <PageIntro eyebrow="MOVIMENTO NO SEU RITMO" title="Seu treino, dia a dia" description="Monte sua semana escolhendo os grupos que quer trabalhar em cada dia. A série aparece na hora, com vídeos de cada exercício." />

      <View style={styles.weekSummary}>
        <View style={styles.summaryTop}><View><Text style={styles.eyebrow}>SEU RITMO NESTA SEMANA</Text><Text style={styles.summaryTitle}>{week.count} de {goalDays} treinos</Text></View><View style={styles.summaryIcon}><Text style={styles.summaryIconText}>✦</Text></View></View>
        <Text style={styles.summaryCopy}>Cada dia ganha sua própria combinação de músculos e exercícios.</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${weeklyProgress}%` }]} /></View>
        <Text style={styles.summaryFoot}>Comece por hoje; sua divisão pode mudar ao longo da semana.</Text>
      </View>

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
  weekSummary: { borderRadius: 24, backgroundColor: theme.colors.dark, padding: 20, marginBottom: 17 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' },
  summaryTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '900', marginTop: 6 },
  summaryIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: '#362342', alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { color: theme.colors.orange, fontSize: 22 },
  summaryCopy: { color: '#C3B7CC', fontSize: 11, lineHeight: 17, marginTop: 8 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#392C43', marginTop: 15, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.orange },
  summaryFoot: { color: '#A999B1', fontSize: 9, marginTop: 8 },
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

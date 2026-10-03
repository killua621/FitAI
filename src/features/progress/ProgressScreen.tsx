import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { PageIntro } from '@/components/PageIntro';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { suggestWeightMilestone } from '@/features/health/fitnessGuidance';
import { getCurrentWeekCheckins } from '@/features/training/checkins';
import { theme } from '@/theme';
const num = (value: string) => Number(value.replace(',', '.'));

export default function ProgressScreen() {
  const { profile, saveProfile, addWeighIn, weightHistory, workoutCheckinDates } = useAuth();
  const [weightInput, setWeightInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [savingTarget, setSavingTarget] = useState(false);
  const currentWeight = profile?.weight_kg ? Number(profile.weight_kg) : null;
  const targetWeight = profile?.weight_goal_kg ? Number(profile.weight_goal_kg) : null;
  const startWeight = profile?.weight_goal_start_kg ? Number(profile.weight_goal_start_kg) : currentWeight;
  const progress = targetWeight && currentWeight && startWeight && targetWeight !== startWeight
    ? Math.max(0, Math.min(100, Math.round(((currentWeight - startWeight) / (targetWeight - startWeight)) * 100)))
    : targetWeight && currentWeight && currentWeight === targetWeight ? 100 : 0;
  const reachedGoal = Boolean(targetWeight && currentWeight && (targetWeight > (startWeight || currentWeight) ? currentWeight >= targetWeight : targetWeight < (startWeight || currentWeight) ? currentWeight <= targetWeight : currentWeight === targetWeight));
  const week = getCurrentWeekCheckins(workoutCheckinDates);
  const isFriday = new Date().getDay() === 5;
  const chartWeights = useMemo(() => [...weightHistory].slice(0, 7).reverse(), [weightHistory]);

  useEffect(() => { setTargetInput(profile?.weight_goal_kg ? String(profile.weight_goal_kg) : ''); }, [profile?.id, profile?.weight_goal_kg]);

  const saveTarget = async () => {
    if (!profile) return Alert.alert('Perfil carregando', 'Tente novamente em instantes.');
    const value = num(targetInput);
    if (!Number.isFinite(value) || value < 20 || value > 500) return Alert.alert('Confira o marco', 'Informe um peso entre 20 e 500 kg.');
    if (currentWeight === null || value === currentWeight) return Alert.alert('Escolha outra etapa', 'O marco precisa ser diferente do seu peso atual.');
    setSavingTarget(true);
    try {
      await saveProfile({ ...profile, weight_goal_kg: value, weight_goal_start_kg: currentWeight });
      Alert.alert('Marco atualizado', 'Sua próxima etapa de peso foi salva.');
    } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setSavingTarget(false); }
  };

  const registerWeight = async () => {
    const value = num(weightInput);
    if (!weightInput || !Number.isFinite(value) || value < 20 || value > 500) return Alert.alert('Confira o peso', 'Informe um valor entre 20 e 500 kg.');
    if (!profile) return Alert.alert('Perfil carregando', 'Tente novamente em instantes.');
    setSavingWeight(true);
    try {
      await addWeighIn(value);
      setWeightInput('');
      const reached = targetWeight && (targetWeight > (startWeight || value) ? value >= targetWeight : targetWeight < (startWeight || value) ? value <= targetWeight : value === targetWeight);
      if (reached) {
        const nextTarget = suggestWeightMilestone({ ...profile, weight_kg: value });
        await saveProfile({ ...profile, weight_kg: value, weight_goal_kg: nextTarget, weight_goal_start_kg: nextTarget ? value : null });
        setTargetInput(nextTarget ? String(nextTarget) : '');
        Alert.alert('Etapa concluída! 🎉', nextTarget ? `Parabéns! Seu próximo marco foi ajustado para ${nextTarget.toLocaleString('pt-BR')} kg.` : 'Parabéns! Para este objetivo, acompanhe também força e medidas.');
      } else Alert.alert('Pesagem registrada', 'Seu peso atual e a evolução foram atualizados.');
    } catch (error) { Alert.alert('Não foi possível registrar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setSavingWeight(false); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/progress" />} style={styles.screen}>
      <PageIntro eyebrow="CADA PASSO CONTA" title="Sua evolução" description="Acompanhe seus treinos e o peso por etapas realistas, sem comparação." />
      <View style={styles.stats}><View style={styles.statCard}><Text style={styles.statValue}>{week.count}</Text><Text style={styles.statLabel}>treinos nesta semana</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{profile?.training_days || '—'}</Text><Text style={styles.statLabel}>dias planejados por semana</Text></View></View>
      <View style={styles.weightCard}>
        <Text style={styles.sectionEyebrow}>ACOMPANHAMENTO DE PESO</Text><Text style={styles.sectionTitle}>Seu peso, ao seu ritmo</Text>
        <View style={styles.metrics}><View><Text style={styles.metricLabel}>PESO ATUAL</Text><Text style={styles.metricValue}>{currentWeight ? `${currentWeight.toLocaleString('pt-BR')} kg` : 'Registre uma pesagem'}</Text></View><View style={styles.targetMetric}><Text style={styles.metricLabel}>PRÓXIMO MARCO</Text><Text style={styles.metricValue}>{targetWeight ? `${targetWeight.toLocaleString('pt-BR')} kg` : 'A definir'}</Text></View></View>
        {targetWeight && <><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.helper}>{reachedGoal ? 'Etapa concluída! Defina seu próximo marco abaixo.' : `${progress}% desta etapa · a tendência ao longo das semanas é mais útil do que uma pesagem isolada.`}</Text></>}
        <Text style={styles.fieldLabel}>Defina seu próximo marco (kg)</Text><View style={styles.entryRow}><TextInput value={targetInput} onChangeText={setTargetInput} keyboardType="decimal-pad" placeholder={profile?.goal === 'Ganhar massa muscular' ? 'Ex.: 64' : 'Ex.: 60'} placeholderTextColor={theme.colors.muted} style={styles.input} /><Pressable disabled={savingTarget} onPress={() => void saveTarget()} style={styles.actionButton}><Text style={styles.actionText}>{savingTarget ? 'Salvando…' : 'Salvar marco'}</Text></Pressable></View>
        <Text style={styles.fieldLabel}>Registre sua pesagem</Text><View style={styles.entryRow}><TextInput value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder="Peso de hoje, ex.: 62,4" placeholderTextColor={theme.colors.muted} style={styles.input} /><Pressable disabled={savingWeight} onPress={() => void registerWeight()} style={styles.actionButton}><Text style={styles.actionText}>{savingWeight ? 'Salvando…' : 'Registrar'}</Text></Pressable></View>
        <Text style={styles.helper}>{isFriday ? 'Hoje é sexta: se fizer sentido para você, registre sua pesagem semanal.' : 'Sugestão: pese-se na sexta, em condições parecidas. O dia é uma referência flexível.'}</Text>
      </View>
      <View style={styles.chartCard}><Text style={styles.sectionEyebrow}>HISTÓRICO</Text><Text style={styles.chartTitle}>Suas pesagens</Text>
        {chartWeights.length ? chartWeights.map((entry, index) => <View key={`${entry.measured_at}-${index}`} style={styles.historyRow}><Text style={styles.historyDate}>{new Date(entry.measured_at).toLocaleDateString('pt-BR')}</Text><Text style={styles.historyValue}>{Number(entry.weight_kg).toLocaleString('pt-BR')} kg</Text></View>) : <Text style={styles.helper}>Suas pesagens registradas aparecerão aqui. Comece com uma medição de referência.</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, stats: { flexDirection: 'row', gap: 11, marginTop: 5, marginBottom: 18 }, statCard: { flex: 1, minHeight: 85, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 15, justifyContent: 'center' }, statValue: { color: theme.colors.orange, fontSize: 25, fontWeight: '900' }, statLabel: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 }, weightCard: { borderRadius: 23, backgroundColor: theme.colors.dark, padding: 20, marginBottom: 17 }, sectionEyebrow: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' }, sectionTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '900', marginTop: 6 }, metrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20, marginBottom: 12 }, targetMetric: { alignItems: 'flex-end' }, metricLabel: { color: '#B5A6BC', fontSize: 8, letterSpacing: 1, fontWeight: '800' }, metricValue: { color: theme.colors.white, fontSize: 18, fontWeight: '900', marginTop: 5 }, progressTrack: { height: 8, borderRadius: 8, backgroundColor: '#403249', overflow: 'hidden', marginTop: 3 }, progressFill: { height: 8, borderRadius: 8, backgroundColor: theme.colors.orange }, helper: { color: '#C6B8CC', fontSize: 10, lineHeight: 15, marginTop: 8 }, fieldLabel: { color: theme.colors.white, fontSize: 11, fontWeight: '800', marginTop: 17, marginBottom: 7 }, entryRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, input: { flex: 1, minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: '#49345E', backgroundColor: '#211A28', paddingHorizontal: 12, fontSize: 12, color: theme.colors.white, outlineStyle: 'none' } as never, actionButton: { minHeight: 46, borderRadius: 13, paddingHorizontal: 13, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' }, actionText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900' }, chartCard: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 18, marginBottom: 20 }, chartTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 9 }, historyRow: { minHeight: 39, borderTopWidth: 1, borderTopColor: theme.colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, historyDate: { color: theme.colors.muted, fontSize: 10 }, historyValue: { color: theme.colors.ink, fontWeight: '900', fontSize: 11 } });



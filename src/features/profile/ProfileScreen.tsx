import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { suggestWeightMilestone } from '@/features/health/fitnessGuidance';
import { theme } from '@/theme';
import { allergyOptions } from '@/features/nutrition/nutritionContent';

const goals = ['Ganhar massa muscular', 'Perder gordura', 'Recomposição corporal'];
const num = (value: string) => Number(value.replace(',', '.'));

export default function ProfileScreen() {
  const { profile, session, signOut, saveProfile, addWeighIn, weightHistory } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState(goals[0]);
  const [trainingEmphasis, setTrainingEmphasis] = useState<'automatic' | 'balanced' | 'lower_body' | 'upper_body'>('automatic');
  const [target, setTarget] = useState('');
  const [foodAllergies, setFoodAllergies] = useState<string[]>([]);
  const [foodAllergyNotes, setFoodAllergyNotes] = useState('');
  const [weighIn, setWeighIn] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name || ''); setAge(profile.age ? String(profile.age) : '');
    setHeight(profile.height_cm ? String(profile.height_cm) : ''); setGoal(profile.goal || goals[0]);
    setTrainingEmphasis(profile.training_emphasis || 'automatic');
    setFoodAllergies(profile.food_allergies || []);
    setFoodAllergyNotes(profile.food_allergy_notes || '');
    const suggested = suggestWeightMilestone(profile);
    setTarget(profile.weight_goal_kg ? String(profile.weight_goal_kg) : suggested ? String(suggested) : '');
  }, [profile?.id]);

  const currentWeight = profile?.weight_kg ? Number(profile.weight_kg) : null;
  const targetWeight = profile?.weight_goal_kg ? Number(profile.weight_goal_kg) : null;
  const startWeight = profile?.weight_goal_start_kg ? Number(profile.weight_goal_start_kg) : currentWeight;
  const direction = targetWeight && currentWeight ? Math.sign(targetWeight - (startWeight || currentWeight)) : 0;
  const progress = targetWeight && currentWeight && startWeight && direction
    ? Math.max(0, Math.min(100, Math.round(((currentWeight - startWeight) / (targetWeight - startWeight)) * 100)))
    : targetWeight && currentWeight && currentWeight === targetWeight ? 100 : 0;
  const reachedGoal = Boolean(targetWeight && currentWeight && (targetWeight > (startWeight || currentWeight) ? currentWeight >= targetWeight : targetWeight < (startWeight || currentWeight) ? currentWeight <= targetWeight : currentWeight === targetWeight));
  const isFriday = new Date().getDay() === 5;

  const save = async () => {
    if (age && (num(age) < 1 || num(age) > 120)) return Alert.alert('Confira a idade', 'Informe uma idade válida.');
    if (height && (num(height) < 80 || num(height) > 250)) return Alert.alert('Confira a altura', 'Informe a altura em centímetros.');
    if (target && (num(target) < 20 || num(target) > 500)) return Alert.alert('Confira a meta', 'Informe um peso entre 20 e 500 kg.');
    if (!profile) return Alert.alert('Perfil ainda carregando', 'Tente novamente em alguns segundos.');
    setSaving(true);
    try {
      const newTarget = target ? num(target) : null;
      await saveProfile({ ...profile, display_name: name.trim() || 'Atleta', age: age ? num(age) : null,
        height_cm: height ? num(height) : null, goal, training_emphasis: trainingEmphasis, weight_goal_kg: newTarget,
        weight_goal_start_kg: newTarget === profile.weight_goal_kg && goal === profile.goal ? profile.weight_goal_start_kg : currentWeight, food_allergies: foodAllergies, food_allergy_notes: foodAllergyNotes.trim() });
      Alert.alert('Perfil atualizado', 'Suas informações e recomendações já foram atualizadas.');
    } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setSaving(false); }
  };

  const recordWeight = async () => {
    const value = num(weighIn);
    if (!weighIn || !Number.isFinite(value) || value < 20 || value > 500) return Alert.alert('Confira o peso', 'Informe um valor entre 20 e 500 kg.');
    setSavingWeight(true);
    try {
      await addWeighIn(value);
      setWeighIn('');
      if (targetWeight && (targetWeight > (startWeight || value) ? value >= targetWeight : value <= targetWeight)) {
        if (profile) {
          const nextTarget = suggestWeightMilestone({ ...profile, weight_kg: value });
          await saveProfile({ ...profile, weight_kg: value, weight_goal_kg: nextTarget, weight_goal_start_kg: nextTarget ? value : null });
          Alert.alert('Etapa alcançada! 🎉', nextTarget
            ? `Parabéns! Sua próxima etapa foi ajustada para ${nextTarget.toLocaleString('pt-BR')} kg. Você pode editar esse marco no perfil.`
            : 'Parabéns! Para este objetivo, acompanhar força e medidas pode ser mais útil do que definir outro alvo de peso.');
        } else Alert.alert('Etapa alcançada! 🎉', 'Seu peso foi atualizado.');
      } else Alert.alert('Pesagem registrada', 'Seu peso atual e seu progresso já foram atualizados.');
    } catch (error) { Alert.alert('Não foi possível registrar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setSavingWeight(false); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/profile" />} style={styles.screen}>
      <View style={styles.top}><Brand /><Text style={styles.topLabel}>SEU PERFIL</Text></View>
      <View style={styles.profileIntro}><View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.display_name || 'A')[0].toUpperCase()}</Text></View><Text style={styles.eyebrow}>SEU ESPAÇO, SEU RITMO</Text><Text style={styles.title}>{profile?.display_name || 'Seu perfil'}</Text><Text style={styles.description}>Atualize seus dados. O plano acompanha as mudanças.</Text></View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>INFORMAÇÕES PESSOAIS</Text>
        <Text style={styles.label}>Nome</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <View style={styles.row}><View style={styles.field}><Text style={styles.label}>Idade</Text><TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Anos" placeholderTextColor={theme.colors.muted} style={styles.input} /></View><View style={styles.field}><Text style={styles.label}>Altura</Text><TextInput value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="cm" placeholderTextColor={theme.colors.muted} style={styles.input} /></View></View>
        <Text style={styles.label}>Objetivo principal</Text><View style={styles.choices}>{goals.map((item) => <Pressable key={item} onPress={() => { setGoal(item); if (item !== goal) { const suggested = suggestWeightMilestone({ age: profile?.age ?? null, height_cm: profile?.height_cm ?? null, weight_kg: currentWeight, goal: item }); setTarget(suggested ? String(suggested) : ''); } }} style={[styles.choice, goal === item && styles.choiceActive]}><Text style={[styles.choiceText, goal === item && styles.choiceTextActive]}>{item}</Text></Pressable>)}</View>
        <Text style={styles.label}>Ênfase do treino</Text><Text style={styles.helper}>Escolha os grupos que quer priorizar. Ao salvar, os exercícios e acessórios do plano mudam junto.</Text><View style={styles.choices}>{[
          ['automatic', 'Automático equilibrado'], ['balanced', 'Corpo todo equilibrado'], ['lower_body', 'Mais pernas e glúteos'], ['upper_body', 'Mais tronco e braços'],
        ].map(([value, label]) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: trainingEmphasis === value }} onPress={() => setTrainingEmphasis(value as typeof trainingEmphasis)} style={[styles.choice, trainingEmphasis === value && styles.choiceActive]}><Text style={[styles.choiceText, trainingEmphasis === value && styles.choiceTextActive]}>{label}</Text></Pressable>)}</View>
        <Text style={styles.label}>Próximo marco de peso · kg</Text><TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder={goal === goals[0] ? 'Ex.: 64' : 'Ex.: 91'} placeholderTextColor={theme.colors.muted} style={styles.input} />
        <Text style={styles.helper}>{goal === 'Recomposição corporal' ? 'A meta considera sua faixa de IMC adulta apenas como referência; acompanhe também força, medidas e como as roupas vestem.' : 'Etapa sugerida a partir do seu peso atual. Você pode ajustar e definir o próximo marco ao alcançar este.'}</Text>

      </View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>ALERGIAS E RESTRIÇÕES</Text>
        <Text style={styles.helper}>Marque alergias e restrições. Lactose é intolerância, não alergia; opções comuns não cobrem todas as reações possíveis.</Text>
        <View style={styles.allergyGrid}>{allergyOptions.map((item) => { const selected = foodAllergies.includes(item); return <Pressable key={item} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setFoodAllergies((current) => selected ? current.filter((value) => value !== item) : [...current, item])} style={[styles.allergyPill, selected && styles.allergyPillActive]}><Text style={[styles.allergyText, selected && styles.allergyTextActive]}>{selected ? '✓  ' : '+  '}{item}</Text></Pressable>; })}</View>
        <Text style={styles.label}>Outra alergia ou restrição</Text>
        <TextInput value={foodAllergyNotes} onChangeText={setFoodAllergyNotes} placeholder="Escreva aqui, se houver" placeholderTextColor={theme.colors.muted} multiline numberOfLines={3} textAlignVertical="top" style={[styles.input, styles.allergyNotesInput]} />
        <Text style={styles.helper}>Se registrar outra condição, as sugestões automáticas de refeições ficam ocultas por segurança.</Text>
      </View>
      <Button title={saving ? 'Salvando…' : 'Salvar perfil e preferências'} onPress={save} disabled={saving} style={styles.saveButton} />

      <View style={styles.weightCard}>
        <View style={styles.weightTop}><View><Text style={styles.cardEyebrow}>ACOMPANHAMENTO SEMANAL</Text><Text style={styles.weightTitle}>Seu peso, ao seu ritmo</Text></View><Text style={styles.weightIcon}>↗</Text></View>
        <View style={styles.metrics}><View><Text style={styles.metricLabel}>PESO ATUAL</Text><Text style={styles.metricValue}>{currentWeight ? `${currentWeight.toLocaleString('pt-BR')} kg` : '—'}</Text></View><View><Text style={styles.metricLabel}>PRÓXIMO MARCO</Text><Text style={styles.metricValue}>{targetWeight ? `${targetWeight.toLocaleString('pt-BR')} kg` : 'Defina no perfil'}</Text></View></View>
        {targetWeight ? <><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.progressLabel}>{reachedGoal ? 'Etapa concluída! Escolha um novo marco acima.' : `${progress}% desta etapa · pesagens semanais ajudam a ver a tendência`}</Text></> : <Text style={styles.helper}>Ex.: 62 → 64 kg para ganhar massa, ou 95 → 91 kg para reduzir gradualmente.</Text>}
        <View style={styles.weighRow}><TextInput value={weighIn} onChangeText={setWeighIn} keyboardType="decimal-pad" placeholder="Peso de hoje, ex.: 62,4" placeholderTextColor={theme.colors.muted} style={[styles.input, styles.weighInput]} /><Pressable disabled={savingWeight} onPress={recordWeight} style={styles.weighButton}><Text style={styles.weighButtonText}>{savingWeight ? 'Salvando…' : 'Registrar pesagem'}</Text></Pressable></View>
        <Text style={styles.helper}>{isFriday ? 'Hoje é sexta: se fizer sentido para você, registre sua pesagem semanal.' : 'Sugestão: pese-se na sexta, em condições parecidas. Uma medida isolada oscila; observe a tendência.'}</Text>
        {weightHistory.slice(0, 4).map((entry, index) => <View key={`${entry.measured_at}-${index}`} style={styles.historyRow}><Text style={styles.historyDate}>{new Date(entry.measured_at).toLocaleDateString('pt-BR')}</Text><Text style={styles.historyValue}>{Number(entry.weight_kg).toLocaleString('pt-BR')} kg</Text></View>)}
      </View>

      <Text style={styles.email}>{session?.user.email}</Text>
      <Button title="Sair da conta" variant="outline" onPress={async () => { try { await signOut(); router.replace('/'); } catch (error) { Alert.alert('Não foi possível sair', error instanceof Error ? error.message : 'Tente novamente.'); } }} style={styles.signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, top: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line, marginBottom: 28 }, topLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '800' }, profileIntro: { alignItems: 'center', paddingVertical: 10, marginBottom: 22 }, avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.purpleSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }, avatarText: { color: theme.colors.orange, fontSize: 31, fontWeight: '900' }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 5 }, description: { color: theme.colors.muted, fontSize: 13, marginTop: 5, textAlign: 'center' }, card: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 19, marginBottom: 16 }, cardEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 13 }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 7, marginTop: 6 }, input: { minHeight: 47, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 13, fontSize: 14, color: theme.colors.ink, marginBottom: 8, outlineStyle: 'none' } as never, row: { flexDirection: 'row', gap: 12 }, field: { flex: 1 }, choices: { gap: 7, marginBottom: 8 }, allergyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12, marginBottom: 8 }, allergyNotesInput: { minHeight: 82, paddingTop: 12 }, allergyPill: { minHeight: 37, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' }, allergyPillActive: { backgroundColor: theme.colors.orangeSoft, borderColor: theme.colors.orange }, allergyText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, allergyTextActive: { color: theme.colors.orange }, choice: { minHeight: 39, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, choiceActive: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, choiceText: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' }, choiceTextActive: { color: theme.colors.orange }, helper: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, saveButton: { marginTop: 14 }, weightCard: { borderRadius: 22, backgroundColor: theme.colors.dark, padding: 20, marginBottom: 15 }, weightTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, weightTitle: { color: theme.colors.white, fontSize: 19, fontWeight: '900' }, weightIcon: { color: theme.colors.orange, fontSize: 25 }, metrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 19, marginBottom: 11 }, metricLabel: { color: '#B5A6BC', fontSize: 8, letterSpacing: 1, fontWeight: '800' }, metricValue: { color: theme.colors.white, fontSize: 19, fontWeight: '900', marginTop: 4 }, progressTrack: { height: 8, borderRadius: 8, backgroundColor: '#403249', overflow: 'hidden', marginTop: 3 }, progressFill: { height: 8, borderRadius: 8, backgroundColor: theme.colors.orange }, progressLabel: { color: '#D6C7DE', fontSize: 10, marginTop: 7, marginBottom: 9 }, weighRow: { flexDirection: 'row', gap: 9, marginTop: 12, alignItems: 'center' }, weighInput: { flex: 1, color: theme.colors.white, backgroundColor: '#211A28', borderColor: '#49345E', marginBottom: 0 }, weighButton: { minHeight: 47, borderRadius: 13, backgroundColor: theme.colors.orange, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }, weighButtonText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900' }, historyRow: { minHeight: 35, borderTopWidth: 1, borderTopColor: '#403249', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }, historyDate: { color: '#B5A6BC', fontSize: 10 }, historyValue: { color: theme.colors.white, fontWeight: '800', fontSize: 11 }, email: { color: theme.colors.muted, textAlign: 'center', fontSize: 11, marginTop: 7 }, signOut: { marginTop: 12, marginBottom: 25 } });

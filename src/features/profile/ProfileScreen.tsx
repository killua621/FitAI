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
import { calculateAge, formatBrazilianDate, parseBrazilianDate } from '@/features/profile/dateOfBirth';

const goals = ['Ganhar massa muscular', 'Perder gordura', 'Recomposição corporal'];

export default function ProfileScreen() {
  const { profile, session, signOut, saveProfile } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [goal, setGoal] = useState(goals[0]);
  const [trainingEmphasis, setTrainingEmphasis] = useState<'automatic' | 'balanced' | 'lower_body' | 'upper_body'>('automatic');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDateOfBirth(formatBrazilianDate(profile.date_of_birth));
    setGoal(profile.goal || goals[0]);
    setTrainingEmphasis(profile.training_emphasis || 'automatic');
  }, [profile?.id]);

  const save = async () => {
    if (!profile) return Alert.alert('Perfil ainda carregando', 'Tente novamente em alguns segundos.');
    const parsedDate = dateOfBirth ? parseBrazilianDate(dateOfBirth) : profile.date_of_birth;
    if (!profile.date_of_birth && dateOfBirth && !parsedDate) return Alert.alert('Confira a data', 'Use o formato DD/MM/AAAA e informe uma data válida.');
    setSaving(true);
    try {
      const goalChanged = goal !== profile.goal;
      const nextMilestone = goalChanged ? suggestWeightMilestone({ ...profile, goal }) : profile.weight_goal_kg;
      await saveProfile({ ...profile, date_of_birth: parsedDate, age: calculateAge(parsedDate) ?? profile.age, goal, training_emphasis: trainingEmphasis,
        weight_goal_kg: nextMilestone, weight_goal_start_kg: goalChanged && nextMilestone ? profile.weight_kg : profile.weight_goal_start_kg });
      Alert.alert('Perfil atualizado', 'Seu objetivo e a ênfase do treino foram salvos.');
    } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setSaving(false); }
  };

  return (
    <Screen scroll footer={<AppTabBar active="/profile" />} style={styles.screen}>
      <View style={styles.top}><Brand /><Text style={styles.topLabel}>SEU PERFIL</Text></View>
      <View style={styles.profileIntro}><View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.display_name || 'A')[0].toUpperCase()}</Text></View><Text style={styles.eyebrow}>SEU ESPAÇO, SEU RITMO</Text><Text style={styles.title}>{profile?.display_name || 'Seu perfil'}</Text><Text style={styles.description}>Seus dados pessoais ficam aqui para consulta. Objetivo e ênfase de treino podem ser ajustados abaixo.</Text></View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>INFORMAÇÕES PESSOAIS</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>NOME</Text><Text style={styles.infoValue}>{profile?.display_name || '—'}</Text></View>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>IDADE</Text><Text style={styles.infoValue}>{profile?.age ? `${profile.age} anos` : '—'}</Text></View>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>ALTURA</Text><Text style={styles.infoValue}>{profile?.height_cm ? `${profile.height_cm} cm` : '—'}</Text></View>
        </View>
        {profile?.date_of_birth ? <Text style={styles.helper}>Data de nascimento: {formatBrazilianDate(profile.date_of_birth)} · idade atualizada automaticamente a cada aniversário.</Text> : <>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="DD/MM/AAAA" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
          <Text style={styles.helper}>Informe uma vez para sua idade acompanhar seus aniversários.</Text>
        </>}
        <Text style={styles.label}>Objetivo principal</Text><View style={styles.choices}>{goals.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: goal === item }} onPress={() => setGoal(item)} style={[styles.choice, goal === item && styles.choiceActive]}><Text style={[styles.choiceText, goal === item && styles.choiceTextActive]}>{item}</Text></Pressable>)}</View>
        <Text style={styles.label}>Ênfase do treino</Text><Text style={styles.helper}>Escolha os grupos que quer priorizar. Ao salvar, os exercícios e acessórios do plano mudam junto.</Text><View style={styles.choices}>{[
          ['automatic', 'Automático equilibrado'], ['balanced', 'Corpo todo equilibrado'], ['lower_body', 'Mais pernas e glúteos'], ['upper_body', 'Mais tronco e braços'],
        ].map(([value, label]) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: trainingEmphasis === value }} onPress={() => setTrainingEmphasis(value as typeof trainingEmphasis)} style={[styles.choice, trainingEmphasis === value && styles.choiceActive]}><Text style={[styles.choiceText, trainingEmphasis === value && styles.choiceTextActive]}>{label}</Text></Pressable>)}</View>
      </View>
      <Button title={saving ? 'Salvando…' : 'Salvar objetivo e ênfase'} onPress={save} disabled={saving} style={styles.saveButton} />

      <Text style={styles.email}>{session?.user.email}</Text>
      <Button title="Sair da conta" variant="outline" onPress={async () => { try { await signOut(); router.replace('/'); } catch (error) { Alert.alert('Não foi possível sair', error instanceof Error ? error.message : 'Tente novamente.'); } }} style={styles.signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, top: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line, marginBottom: 28 }, topLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '800' }, profileIntro: { alignItems: 'center', paddingVertical: 10, marginBottom: 22 }, avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.purpleSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }, avatarText: { color: theme.colors.orange, fontSize: 31, fontWeight: '900' }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 5 }, description: { color: theme.colors.muted, fontSize: 13, marginTop: 5, textAlign: 'center' }, infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 12 }, infoItem: { flexGrow: 1, flexBasis: '30%', minHeight: 68, borderRadius: 14, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line, padding: 12, justifyContent: 'center' }, infoLabel: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: '900' }, infoValue: { color: theme.colors.ink, fontSize: 13, fontWeight: '900', marginTop: 5 }, card: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 19, marginBottom: 16 }, cardEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 13 }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 7, marginTop: 6 }, input: { minHeight: 47, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 13, fontSize: 14, color: theme.colors.ink, marginBottom: 8, outlineStyle: 'none' } as never, choices: { gap: 7, marginBottom: 8 }, choice: { minHeight: 39, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line }, choiceActive: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple }, choiceText: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' }, choiceTextActive: { color: theme.colors.orange }, helper: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, saveButton: { marginTop: 14 }, email: { color: theme.colors.muted, textAlign: 'center', fontSize: 11, marginTop: 7 }, signOut: { marginTop: 12, marginBottom: 25 } });

import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTabBar } from '@/components/AppTabBar';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { Alert } from 'react-native';

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuth();
  const { name, goal, experience, trainingDays } = useLocalSearchParams<{ name?: string; goal?: string; experience?: string; trainingDays?: string }>();
  const profileName = profile?.display_name || name || 'Atleta';
  const profileGoal = profile?.goal || goal || 'Ganhar massa muscular';
  const profileExperience = profile?.experience_level || experience || 'Estou começando';
  const daysPerWeek = String(profile?.training_days || trainingDays || '3');
  const activityLabels: Record<string, string> = { low: 'Baixa', light: 'Leve', moderate: 'Moderada', high: 'Alta' };
  const preferences = [
    { label: 'Objetivo', value: profileGoal },
    { label: 'Experiência', value: profileExperience },
    { label: 'Frequência', value: daysPerWeek + ' dias por semana' },
    ...(profile?.activity_level ? [{ label: 'Atividade diária', value: activityLabels[profile.activity_level] || 'Não informada' }] : []),
    ...(profile?.water_goal_ml ? [{ label: 'Meta de água personalizada', value: profile.water_goal_ml.toLocaleString('pt-BR') + ' ml/dia' }] : []),
  ];
  return (
    <Screen scroll footer={<AppTabBar active="/profile" />} style={styles.screen}>
      <View style={styles.top}><Brand /><Text style={styles.topLabel}>SEU PERFIL</Text></View>
      <View style={styles.profileIntro}><View style={styles.avatar}><Text style={styles.avatarText}>G</Text></View><Text style={styles.eyebrow}>BEM-VINDO AO FITAI</Text><Text style={styles.title}>{profileName}</Text><Text style={styles.description}>Seu espaço, seu ritmo, sua evolução.</Text></View>
      <View style={styles.card}><Text style={styles.cardEyebrow}>SUAS PREFERÊNCIAS</Text>{preferences.map((item, index) => <View key={item.label} style={[styles.preference, index === preferences.length - 1 && styles.last]}><View><Text style={styles.preferenceLabel}>{item.label}</Text><Text style={styles.preferenceValue}>{item.value}</Text></View><Text style={styles.chevron}>›</Text></View>)}</View>
      <View style={styles.note}><Text style={styles.noteMark}>✳</Text><Text style={styles.noteText}>Seu perfil é salvo na sua conta. As regras do banco impedem que outros usuários acessem esses dados.</Text></View>
      <Button title="Rever meu onboarding" variant="dark" onPress={() => router.replace({ pathname: '/onboarding', params: { name: profileName, goal: profileGoal, experience: profileExperience, trainingDays: daysPerWeek } })} style={styles.editButton} />
      <Text style={styles.email}>{session?.user.email}</Text>
      <Button title="Sair da conta" variant="outline" onPress={async () => { try { await signOut(); router.replace('/'); } catch (error) { Alert.alert('Não foi possível sair', error instanceof Error ? error.message : 'Tente novamente.'); } }} style={styles.signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 7 }, top: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line, marginBottom: 34 }, topLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '800' }, profileIntro: { alignItems: 'center', paddingVertical: 20, marginBottom: 22 }, avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.colors.brownSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }, avatarText: { color: theme.colors.orange, fontSize: 34, fontWeight: '900' }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 29, fontWeight: '900', marginTop: 6 }, description: { color: theme.colors.muted, fontSize: 13, marginTop: 5 }, card: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 19 }, cardEyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.3, fontWeight: '900', marginBottom: 5 }, preference: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.line }, last: { borderBottomWidth: 0 }, preferenceLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '600' }, preferenceValue: { color: theme.colors.ink, fontSize: 14, fontWeight: '800', marginTop: 4 }, chevron: { color: theme.colors.brown, fontSize: 24 }, note: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderRadius: 17, backgroundColor: theme.colors.brownLight, marginTop: 14 }, noteMark: { color: theme.colors.orangeDeep, fontSize: 20 }, noteText: { flex: 1, color: theme.colors.brown, fontSize: 11, lineHeight: 17, fontWeight: '600' }, editButton: { marginTop: 17, marginBottom: 17 }, email: { color: theme.colors.muted, textAlign: 'center', fontSize: 11, marginTop: 3 }, signOut: { marginTop: 12, marginBottom: 25 } });





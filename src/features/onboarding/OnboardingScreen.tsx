import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Button } from '@/components/Button';
import { ChoiceCard } from '@/components/ChoiceCard';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';
import { experienceOptions, goalOptions, onboardingHeadings, trainingDays } from '@/features/onboarding/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { suggestWeightMilestone } from '@/features/health/fitnessGuidance';


function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
      <View style={styles.progressTrack}>{[0, 1, 2, 3].map((index) => <View key={index} style={[styles.progressSegment, index <= step && styles.progressDone]} />)}</View>
      <Text style={styles.stepCount}>0{step + 1} <Text style={styles.stepTotal}>/ 04</Text></Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const { session, saveProfile } = useAuth();
  const params = useLocalSearchParams<{ name?: string; goal?: string; experience?: string; trainingDays?: string }>();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(profile?.goal || params.goal || 'Ganhar massa muscular');
  const [experience, setExperience] = useState(profile?.experience_level || params.experience || 'Estou começando');
  const [name, setName] = useState(profile?.display_name || params.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [height, setHeight] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [weight, setWeight] = useState(profile?.weight_kg ? String(profile.weight_kg) : '');
  const [energyProfile, setEnergyProfile] = useState(profile?.energy_equation_profile || null);
  const [activity, setActivity] = useState(profile?.activity_level || null);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(profile?.training_weekdays || trainingDays.slice(0, Math.max(2, Math.min(6, profile?.training_days || Number(params.trainingDays) || 3))));

  const back = () => step > 0 ? setStep(step - 1) : router.back();
  const next = async () => {
    if (step < 3) return setStep(step + 1);
    if (selectedWeekdays.length < 2) {
      Alert.alert('Escolha sua rotina', 'Selecione pelo menos dois dias de treino para montar seu plano semanal.');
      return;
    }
    try {
      const weightKg = weight ? Number(weight.replace(',', '.')) : null;
      const weightGoal = profile?.weight_goal_kg ?? suggestWeightMilestone({ goal, age: age ? Number(age) : null, height_cm: height ? Number(height) : null, weight_kg: weightKg });
      await saveProfile({
        display_name: name.trim() || session?.user.email?.split('@')[0] || 'Atleta',
        goal,
        experience_level: experience,
        training_days: selectedWeekdays.length,
        age: age ? Number(age) : null,
        height_cm: height ? Number(height) : null,
        weight_kg: weightKg,
        weight_goal_kg: weightGoal,
        weight_goal_start_kg: profile?.weight_goal_start_kg ?? (weightGoal ? weightKg : null),
        water_goal_ml: profile?.water_goal_ml ?? null,
        training_weekdays: selectedWeekdays,
        activity_level: activity,
        energy_equation_profile: energyProfile,
      });
      router.replace('/home');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.shell}>
        <StepHeader step={step} onBack={back} />
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>PASSO {step + 1} DE 4</Text>
          <Text style={styles.title}>{onboardingHeadings[step][0]}</Text>
          <Text style={styles.subtitle}>{onboardingHeadings[step][1]}</Text>
        </View>
        {step === 0 && <View style={styles.options}>{goalOptions.map((item) => <ChoiceCard key={item.title} {...item} selected={goal === item.title} onPress={() => setGoal(item.title)} />)}</View>}
        {step === 1 && (
          <View style={[styles.form, wide && styles.formWide]}>
            <Text style={styles.label}>Como podemos te chamar?</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#A08F83" autoCapitalize="words" style={styles.input} />
            <Text style={styles.label}>Qual é a sua idade?</Text>
            <TextInput value={age} onChangeText={setAge} placeholder="Ex.: 28 anos" placeholderTextColor="#A08F83" keyboardType="number-pad" style={styles.input} />
            <View style={styles.fieldRow}>
              <View style={styles.field}><Text style={styles.label}>Altura</Text><TextInput value={height} onChangeText={setHeight} placeholder="170 cm" placeholderTextColor="#A08F83" keyboardType="number-pad" style={styles.input} /></View>
              <View style={styles.field}><Text style={styles.label}>Peso</Text><TextInput value={weight} onChangeText={setWeight} placeholder="70 kg" placeholderTextColor="#A08F83" keyboardType="decimal-pad" style={styles.input} /></View>
            </View>
            <Text style={styles.label}>Atividade no dia a dia</Text>
            <Text style={styles.helperTop}>Baixa: passa a maior parte do dia sentado. Leve: caminha um pouco. Moderada/alta: trabalho ativo ou bastante movimento diário.</Text>
            <View style={styles.activityRow}>{[
              ['low', 'Baixa'], ['light', 'Leve'], ['moderate', 'Moderada'], ['high', 'Alta'],
            ].map(([value, label]) => <Pressable key={value} onPress={() => setActivity(value as NonNullable<typeof activity>)} style={[styles.activityPill, activity === value && styles.activityPillActive]}><Text style={[styles.activityText, activity === value && styles.activityTextActive]}>{label}</Text></Pressable>)}</View>
            <Text style={styles.label}>Parâmetro opcional para estimativa de energia</Text>
            <Text style={styles.helperTop}>A equação considera uma categoria fisiológica. Se preferir, deixe sem resposta.</Text>
            <View style={styles.activityRow}>{[['female', 'Feminino'], ['male', 'Masculino']].map(([value, label]) => <Pressable key={value} onPress={() => setEnergyProfile(value as 'female' | 'male')} style={[styles.activityPill, energyProfile === value && styles.activityPillActive]}><Text style={[styles.activityText, energyProfile === value && styles.activityTextActive]}>{label}</Text></Pressable>)}</View>
            <Text style={styles.helper}>Essas informações ficam no seu perfil, protegido pela sua conta.</Text>
          </View>
        )}
        {step === 2 && <View style={styles.options}>{experienceOptions.map((item) => <ChoiceCard key={item.title} {...item} selected={experience === item.title} onPress={() => setExperience(item.title)} />)}</View>}
        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.label}>Quantos dias por semana?</Text>
            <View style={styles.countRow}>{[2, 3, 4, 5, 6].map((count) => <Pressable key={count} accessibilityRole="button" onPress={() => setSelectedWeekdays(trainingDays.slice(0, count))} style={[styles.countPill, selectedWeekdays.length === count && styles.countActive]}><Text style={[styles.countText, selectedWeekdays.length === count && styles.countTextActive]}>{count}</Text></Pressable>)}</View>
            <View style={styles.dayTitleRow}><Text style={styles.label}>Escolha seus dias</Text><Text style={styles.dayHint}>{selectedWeekdays.length} dias selecionados</Text></View>
            <View style={styles.dayRow}>{trainingDays.map((day) => <Pressable key={day} accessibilityRole="checkbox" accessibilityState={{ checked: selectedWeekdays.includes(day) }} onPress={() => setSelectedWeekdays((current) => trainingDays.filter((candidate) => candidate === day ? !current.includes(candidate) : current.includes(candidate)))} style={[styles.dayPill, selectedWeekdays.includes(day) && styles.dayActive]}><Text style={[styles.dayText, selectedWeekdays.includes(day) && styles.dayTextActive]}>{day}</Text></Pressable>)}</View>
            <View style={styles.note}><View style={styles.noteMark}><Text style={styles.noteIcon}>✳</Text></View><Text style={styles.noteText}>Sua rotina pode mudar. A gente se adapta junto.</Text></View>
          </View>
        )}
        <View style={styles.footer}><Button title={step === 3 ? 'Ver meu plano' : 'Continuar'} onPress={next} /><Text style={styles.privacy}>LEVA MENOS DE 1 MINUTO</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 8 }, shell: { width: '100%', maxWidth: 650, alignSelf: 'center' }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: 37 }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, alignItems: 'center', justifyContent: 'center' }, backText: { color: theme.colors.ink, fontSize: 28, marginTop: -4 }, progressTrack: { flex: 1, flexDirection: 'row', gap: 6, marginHorizontal: 15 }, progressSegment: { height: 5, flex: 1, borderRadius: 5, backgroundColor: theme.colors.line }, progressDone: { backgroundColor: theme.colors.orange }, stepCount: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' }, stepTotal: { color: theme.colors.muted, fontWeight: '500' }, intro: { marginBottom: 25 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginBottom: 10 }, title: { color: theme.colors.ink, fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: -0.8 }, subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7 }, options: { marginTop: 1 }, form: { marginTop: 1 }, formWide: { maxWidth: 580 }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 13, marginBottom: 9 }, input: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 16, fontSize: 15, color: theme.colors.ink, marginBottom: 19 }, fieldRow: { flexDirection: 'row', gap: 12 }, field: { flex: 1 }, helper: { color: theme.colors.muted, fontSize: 12, marginTop: -6 }, helperTop: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: -5, marginBottom: 10 }, activityRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginBottom: 18 }, activityPill: { minHeight: 38, paddingHorizontal: 11, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, justifyContent: 'center' }, activityPillActive: { backgroundColor: theme.colors.brownSurface, borderColor: theme.colors.brownSurface }, activityText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' }, activityTextActive: { color: theme.colors.white }, countRow: { flexDirection: 'row', gap: 10, marginTop: 4 }, countPill: { width: 49, height: 49, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, countActive: { backgroundColor: theme.colors.dark, borderColor: theme.colors.dark }, countText: { fontSize: 16, fontWeight: '700', color: theme.colors.muted }, countTextActive: { color: theme.colors.orange }, dayTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 29 }, dayHint: { fontSize: 11, color: theme.colors.muted, marginBottom: 9 }, dayRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 }, dayPill: { flex: 1, height: 43, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, alignItems: 'center', justifyContent: 'center' }, dayActive: { backgroundColor: theme.colors.brownSurface, borderColor: theme.colors.brownSurface }, dayText: { fontSize: 11, color: theme.colors.muted, fontWeight: '700' }, dayTextActive: { color: theme.colors.white }, note: { backgroundColor: theme.colors.brownLight, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', marginTop: 27, gap: 11 }, noteMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, noteIcon: { fontSize: 19, color: theme.colors.orangeDeep }, noteText: { flex: 1, fontSize: 13, lineHeight: 19, color: theme.colors.ink, fontWeight: '600' }, footer: { marginTop: 30, marginBottom: 10 }, privacy: { textAlign: 'center', color: theme.colors.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: '700', marginTop: 14 },
});




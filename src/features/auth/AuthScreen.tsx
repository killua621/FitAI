import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 8) {
      Alert.alert('Confira seus dados', 'Informe seu e-mail e uma senha com pelo menos 8 caracteres.');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      Alert.alert('As senhas não coincidem', 'Digite a mesma senha nos dois campos.');
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
        if (error) throw error;
        if (!data.session) {
          Alert.alert('Confirme seu e-mail', 'Enviamos um link de confirmação. Depois, volte e entre na sua conta.');
          setMode('signin');
          return;
        }
        router.replace('/onboarding');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
        if (profileError) throw profileError;
        router.replace(profile ? '/home' : '/onboarding');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir agora. Tente novamente.';
      Alert.alert(isSignup ? 'Não foi possível criar a conta' : 'Não foi possível entrar', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.shell}>
        <View style={styles.top}><Brand /><Text style={styles.secure}>DADOS PROTEGIDOS POR CONTA</Text></View>
        <View style={styles.hero}><View style={styles.icon}><Text style={styles.iconText}>✳</Text></View><Text style={styles.eyebrow}>SUA JORNADA, SEU ESPAÇO</Text><Text style={styles.title}>{isSignup ? 'Crie sua conta.' : 'Que bom ter você.'}</Text><Text style={styles.subtitle}>{isSignup ? 'Salve seu plano e acompanhe sua evolução em qualquer acesso.' : 'Entre para ver seu plano e continuar de onde parou.'}</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="voce@email.com" placeholderTextColor="#A08F83" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={styles.input} />
          <Text style={styles.label}>Senha</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" placeholderTextColor="#A08F83" secureTextEntry autoComplete={isSignup ? 'new-password' : 'password'} style={styles.input} />
          {isSignup && <><Text style={styles.label}>Confirme sua senha</Text><TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite a senha novamente" placeholderTextColor="#A08F83" secureTextEntry autoComplete="new-password" style={styles.input} /></>}
          <Button title={busy ? 'Aguarde...' : isSignup ? 'Criar minha conta' : 'Entrar na minha conta'} onPress={submit} disabled={busy} style={styles.submit} />
          <Pressable accessibilityRole="button" onPress={() => setMode(isSignup ? 'signin' : 'signup')} style={styles.toggle}><Text style={styles.toggleText}>{isSignup ? 'Já tem conta? ' : 'Ainda não tem conta? '}<Text style={styles.toggleStrong}>{isSignup ? 'Entrar' : 'Criar conta'}</Text></Text></Pressable>
        </View>
        <Text style={styles.privacy}>Cada conta acessa somente os dados associados a ela.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, shell: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1 }, top: { minHeight: 55, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, secure: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: '800' }, hero: { marginTop: 42, marginBottom: 28 }, icon: { width: 54, height: 54, borderRadius: 19, backgroundColor: theme.colors.dark, alignItems: 'center', justifyContent: 'center', marginBottom: 23 }, iconText: { color: theme.colors.orange, fontSize: 29 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 35, lineHeight: 42, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 410 }, form: { padding: 22, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 24, backgroundColor: theme.colors.surface }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 8 }, input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 15, fontSize: 14, color: theme.colors.ink, marginBottom: 17 }, submit: { marginTop: 3 }, toggle: { alignItems: 'center', paddingVertical: 19 }, toggleText: { color: theme.colors.muted, fontSize: 12 }, toggleStrong: { color: theme.colors.brown, fontWeight: '900' }, privacy: { textAlign: 'center', color: theme.colors.muted, fontSize: 10, marginTop: 18, marginBottom: 22 },
});

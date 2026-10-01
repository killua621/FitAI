import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { EmailOtpType } from '@supabase/supabase-js';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';

export default function AuthScreen() {
  const { session, profile, loading } = useAuth();
  const { code: rawCode, token_hash: rawTokenHash, type: rawType } = useLocalSearchParams<{ code?: string | string[]; token_hash?: string | string[]; type?: string | string[] }>();
  const callbackProcessed = useRef(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationSentTo, setConfirmationSentTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success' | 'info'; message: string } | null>(null);
  const isSignup = mode === 'signup';

  const describeAuthError = (error: unknown) => {
    const authError = error as { code?: string; status?: number; message?: string };
    const code = authError?.code?.toLowerCase() || '';
    const message = authError?.message?.toLowerCase() || '';
    if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
      return 'Seu e-mail ainda não foi confirmado. Reenvie o link de confirmação abaixo e confira também spam e promoções.';
    }
    if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
      return 'E-mail ou senha incorretos. Confira os dados. Se você ainda não confirmou o e-mail, use “Reenviar confirmação”.';
    }
    if (code === 'user_already_exists' || message.includes('user already registered')) {
      return 'Já existe uma conta com esse e-mail. Entre ou solicite a confirmação novamente.';
    }
    if (code === 'over_email_send_rate_limit' || code === 'email_rate_limit_exceeded' || authError?.status === 429 || message.includes('rate limit')) {
      return 'O serviço de e-mail atingiu o limite temporário de envios. Aguarde um pouco antes de tentar novamente.';
    }
    if (message.includes('email address not authorized')) {
      return 'O serviço de e-mail do Supabase ainda está em modo de teste e bloqueou este endereço. O administrador precisa configurar um SMTP para liberar o envio a todos.';
    }
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to')) {
      return 'Não conseguimos conectar agora. Verifique sua internet e tente novamente.';
    }
    return authError?.message || 'Não foi possível concluir agora. Tente novamente em instantes.';
  };

  const resendConfirmation = async (targetEmail: string) => {
    setBusy(true);
    setNotice(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail, options: { emailRedirectTo: 'https://fitai-4unn.onrender.com/auth' } });
      if (error) throw error;
      setConfirmationSentTo(targetEmail);
      setNotice({ kind: 'success', message: 'Pronto! Se essa conta estiver aguardando confirmação, um novo link foi enviado. Confira a caixa de entrada, spam e promoções.' });
    } catch (error) {
      setNotice({ kind: 'error', message: describeAuthError(error) });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!loading && session) router.replace(profile ? '/home' : '/onboarding');
  }, [loading, session, profile]);

  useEffect(() => {
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    const tokenHash = Array.isArray(rawTokenHash) ? rawTokenHash[0] : rawTokenHash;
    const type = Array.isArray(rawType) ? rawType[0] : rawType;
    if (callbackProcessed.current || (!code && !tokenHash)) return;
    callbackProcessed.current = true;
    void (async () => {
      setBusy(true);
      try {
        const result = code
          ? await supabase.auth.exchangeCodeForSession(code)
          : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: (type || 'signup') as EmailOtpType });
        if (result.error) throw result.error;
      } catch (error) {
        setNotice({ kind: 'error', message: `Não conseguimos confirmar esse link. ${describeAuthError(error)}` });
      } finally { setBusy(false); }
    })();
  }, [rawCode, rawTokenHash, rawType]);

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length < 8) {
      setNotice({ kind: 'error', message: 'Informe um e-mail válido e uma senha com pelo menos 8 caracteres.' });
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setNotice({ kind: 'error', message: 'As senhas não coincidem. Confira os dois campos.' });
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: 'https://fitai-4unn.onrender.com/auth' } });
        if (error) throw error;
        if (!data.session) {
          setConfirmationSentTo(normalizedEmail);
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
      const authError = error as { code?: string };
      if (!isSignup && authError?.code === 'email_not_confirmed') {
        setConfirmationSentTo(normalizedEmail);
        setNotice({ kind: 'info', message: 'Seu e-mail ainda não foi confirmado. Você pode reenviar o link nesta tela.' });
      } else {
        setNotice({ kind: 'error', message: describeAuthError(error) });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.shell}>
        <View style={styles.top}><Brand /><Text style={styles.secure}>DADOS PROTEGIDOS POR CONTA</Text></View>
        {confirmationSentTo ? (
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationIcon}><Text style={styles.confirmationIconText}>✉</Text></View>
            <Text style={styles.eyebrow}>SÓ FALTA UM PASSO</Text>
            <Text style={styles.title}>Sua jornada já está quase começando.</Text>
            <Text style={styles.subtitle}>Se sua conta ainda estiver aguardando confirmação, enviamos um link para <Text style={styles.emailHighlight}>{confirmationSentTo}</Text>. Abra a mensagem da ScholzFit e toque em “Confirmar meu e-mail” para começar.</Text>
            {notice && <View accessibilityRole="alert" style={[styles.notice, notice.kind === 'error' ? styles.noticeError : notice.kind === 'success' ? styles.noticeSuccess : styles.noticeInfo]}><Text style={styles.noticeText}>{notice.message}</Text></View>}
            <View style={styles.mailTip}><Text style={styles.mailTipIcon}>✳</Text><Text style={styles.mailTipText}>Não encontrou? Dê uma olhadinha na pasta de spam ou promoções.</Text></View>
            <Button title={busy ? 'Enviando...' : 'Reenviar link de confirmação'} onPress={() => void resendConfirmation(confirmationSentTo)} disabled={busy} style={styles.submit} />
            <Pressable accessibilityRole="button" onPress={() => { setConfirmationSentTo(''); setMode('signin'); setPassword(''); setConfirmPassword(''); }} style={styles.toggle}><Text style={styles.toggleText}>Voltar para entrar na minha conta</Text></Pressable>
          </View>
        ) : <>
        <View style={styles.hero}><View style={styles.icon}><Text style={styles.iconText}>✳</Text></View><Text style={styles.eyebrow}>SUA JORNADA, SEU ESPAÇO</Text><Text style={styles.title}>{isSignup ? 'Crie sua conta.' : 'Que bom ter você.'}</Text><Text style={styles.subtitle}>{isSignup ? 'Salve seu plano e acompanhe sua evolução em qualquer acesso.' : 'Entre para ver seu plano e continuar de onde parou.'}</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="voce@email.com" placeholderTextColor="#A99BB1" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={styles.input} />
          <Text style={styles.label}>Senha</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" placeholderTextColor="#A99BB1" secureTextEntry autoComplete={isSignup ? 'new-password' : 'password'} style={styles.input} />
          {isSignup && <><Text style={styles.label}>Confirme sua senha</Text><TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite a senha novamente" placeholderTextColor="#A99BB1" secureTextEntry autoComplete="new-password" style={styles.input} /></>}
          <Button title={busy ? 'Aguarde...' : isSignup ? 'Criar minha conta' : 'Entrar na minha conta'} onPress={submit} disabled={busy} style={styles.submit} />
          <Pressable accessibilityRole="button" onPress={() => { setMode(isSignup ? 'signin' : 'signup'); setNotice(null); }} style={styles.toggle}><Text style={styles.toggleText}>{isSignup ? 'Já tem conta? ' : 'Ainda não tem conta? '}<Text style={styles.toggleStrong}>{isSignup ? 'Entrar' : 'Criar conta'}</Text></Text></Pressable>
        </View>
        {notice && <View accessibilityRole="alert" style={[styles.notice, notice.kind === 'error' ? styles.noticeError : notice.kind === 'success' ? styles.noticeSuccess : styles.noticeInfo]}><Text style={styles.noticeText}>{notice.message}</Text></View>}
        {!isSignup && email.trim() && <Pressable accessibilityRole="button" onPress={() => void resendConfirmation(email.trim().toLowerCase())} disabled={busy} style={styles.resendLink}><Text style={styles.resendText}>{busy ? 'Enviando...' : 'Não recebeu o e-mail? Reenviar confirmação'}</Text></Pressable>}
        <Text style={styles.privacy}>Cada conta acessa somente os dados associados a ela.</Text>
        </>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, shell: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1 }, top: { minHeight: 55, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, secure: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: '800' }, hero: { marginTop: 42, marginBottom: 28 }, icon: { width: 54, height: 54, borderRadius: 19, backgroundColor: theme.colors.dark, alignItems: 'center', justifyContent: 'center', marginBottom: 23 }, iconText: { color: theme.colors.orange, fontSize: 29 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 35, lineHeight: 42, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 410 }, form: { padding: 22, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 24, backgroundColor: theme.colors.surface }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 8 }, input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 15, fontSize: 14, color: theme.colors.ink, marginBottom: 17 }, submit: { marginTop: 3 }, toggle: { alignItems: 'center', paddingVertical: 19 }, toggleText: { color: theme.colors.muted, fontSize: 12 }, toggleStrong: { color: theme.colors.purpleMuted, fontWeight: '900' }, privacy: { textAlign: 'center', color: theme.colors.muted, fontSize: 10, marginTop: 18, marginBottom: 22 },
  confirmationCard: { marginTop: 45, padding: 25, borderRadius: 28, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, confirmationIcon: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orangeSoft, marginBottom: 25 }, confirmationIconText: { fontSize: 29, color: theme.colors.orange }, emailHighlight: { color: theme.colors.ink, fontWeight: '800' }, mailTip: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: theme.colors.darkSoft, borderRadius: 16, padding: 14, marginTop: 20 }, mailTipIcon: { color: theme.colors.orange, fontSize: 17 }, mailTipText: { flex: 1, color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  notice: { borderRadius: 14, padding: 13, marginTop: 16, borderWidth: 1 }, noticeError: { backgroundColor: '#3A211B', borderColor: '#8B412D' }, noticeSuccess: { backgroundColor: '#203128', borderColor: '#426A4F' }, noticeInfo: { backgroundColor: theme.colors.darkSoft, borderColor: theme.colors.line }, noticeText: { color: theme.colors.ink, fontSize: 12, lineHeight: 18 }, resendLink: { alignSelf: 'center', padding: 14 }, resendText: { color: theme.colors.orange, fontWeight: '800', fontSize: 12 },
});

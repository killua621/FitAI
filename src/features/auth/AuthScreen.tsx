import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { EmailOtpType } from '@supabase/supabase-js';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';

const PASSWORD_SYMBOLS = `!@#$%^&*()_+-=[]{};':"|<>?,./\`~`;

export default function AuthScreen() {
  const { session, profile, loading } = useAuth();
  const { code: rawCode, token_hash: rawTokenHash, type: rawType, mode: rawMode } = useLocalSearchParams<{ code?: string | string[]; token_hash?: string | string[]; type?: string | string[]; mode?: string | string[] }>();
  const callbackProcessed = useRef(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'updatePassword'>(() => rawMode === 'update-password' ? 'updatePassword' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationSentTo, setConfirmationSentTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success' | 'info'; message: string } | null>(null);
  const isSignup = mode === 'signup';
  const isPasswordEntry = isSignup || mode === 'updatePassword';
  const passwordChecks = [
    { label: '12 caracteres', valid: password.length >= 12 },
    { label: 'letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'número', valid: /\d/.test(password) },
    { label: 'símbolo', valid: [...password].some((character) => PASSWORD_SYMBOLS.includes(character)) },
  ];
  const isStrongPassword = passwordChecks.every((check) => check.valid);
  const authRedirect = Platform.OS === 'web' ? 'https://fitai-4unn.onrender.com/auth' : Linking.createURL('auth');

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
    if (message.includes('weak password') || message.includes('password should') || message.includes('password is too')) {
      return 'Essa senha não atende aos requisitos de segurança. Use 12 caracteres, maiúscula, minúscula, número e símbolo.';
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
      const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail, options: { emailRedirectTo: authRedirect } });
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
    if (!loading && session && mode !== 'updatePassword') router.replace(profile ? '/home' : '/onboarding');
  }, [loading, session, profile, mode]);

  useEffect(() => {
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    const tokenHash = Array.isArray(rawTokenHash) ? rawTokenHash[0] : rawTokenHash;
    const type = Array.isArray(rawType) ? rawType[0] : rawType;
    const requestedMode = Array.isArray(rawMode) ? rawMode[0] : rawMode;
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const callbackType = hashParams.get('type') || type;
    if (callbackProcessed.current || (!code && !tokenHash && !(accessToken && refreshToken))) return;
    callbackProcessed.current = true;
    void (async () => {
      setBusy(true);
      try {
        if (callbackType === 'recovery' || requestedMode === 'update-password') setMode('updatePassword');
        const result = accessToken && refreshToken
          ? await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          : code
            ? await supabase.auth.exchangeCodeForSession(code)
            : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: (type || 'signup') as EmailOtpType });
        if (result.error) throw result.error;
        if (typeof window !== 'undefined' && hash) window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      } catch (error) {
        const authError = error as { message?: string };
        const crossDevice = authError?.message?.toLowerCase().includes('code verifier');
        setNotice({ kind: 'error', message: crossDevice
          ? 'Este link foi aberto em outro navegador e não pode concluir a confirmação. Volte à ScholzFit, toque em “Reenviar confirmação” e abra o novo link neste mesmo navegador.'
          : `Não conseguimos confirmar esse link. ${describeAuthError(error)}` });
      } finally { setBusy(false); }
    })();
  }, [rawCode, rawTokenHash, rawType, rawMode]);

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setNotice({ kind: 'error', message: 'Informe um e-mail válido.' });
      return;
    }
    if ((isPasswordEntry && !isStrongPassword) || (mode === 'signin' && !password)) {
      setNotice({ kind: 'error', message: isPasswordEntry ? 'Sua senha precisa ter 12 caracteres, letra maiúscula, minúscula, número e símbolo.' : 'Digite sua senha para entrar.' });
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
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: authRedirect } });
        if (error) throw error;
        if (!data.session) {
          setConfirmationSentTo(normalizedEmail);
          return;
        }
        router.replace('/onboarding');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${authRedirect}?mode=update-password` });
        if (error) throw error;
        setNotice({ kind: 'success', message: 'Se houver uma conta com esse e-mail, enviaremos um link para você criar uma nova senha. Confira também spam e promoções.' });
      } else if (mode === 'updatePassword') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setNotice({ kind: 'success', message: 'Senha atualizada! Você já pode continuar sua jornada.' });
        router.replace(profile ? '/home' : '/onboarding');
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
        <View style={styles.hero}><View style={styles.icon}><Text style={styles.iconText}>✳</Text></View><Text style={styles.eyebrow}>SUA JORNADA, SEU ESPAÇO</Text><Text style={styles.title}>{isSignup ? 'Crie sua conta.' : mode === 'forgot' ? 'Vamos recuperar seu acesso.' : mode === 'updatePassword' ? 'Crie uma nova senha.' : 'Que bom ter você.'}</Text><Text style={styles.subtitle}>{isSignup ? 'Salve seu plano e acompanhe sua evolução em qualquer acesso.' : mode === 'forgot' ? 'Informe seu e-mail e enviaremos um link para redefinir sua senha.' : mode === 'updatePassword' ? 'Escolha uma senha forte para proteger sua conta.' : 'Entre para ver seu plano e continuar de onde parou.'}</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="voce@email.com" placeholderTextColor="#A99BB1" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={styles.input} />
          {mode !== 'forgot' && <><Text style={styles.label}>{mode === 'updatePassword' ? 'Nova senha' : 'Senha'}</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder={isPasswordEntry ? 'Crie uma senha forte' : 'Digite sua senha'} placeholderTextColor="#A99BB1" secureTextEntry autoComplete={isPasswordEntry ? 'new-password' : 'password'} style={styles.input} />
          {isPasswordEntry && <View style={styles.passwordRules}><Text style={styles.passwordRulesTitle}>Sua senha precisa ter:</Text>{passwordChecks.map((check) => <Text key={check.label} style={[styles.passwordRule, check.valid && styles.passwordRuleValid]}>{check.valid ? '✓' : '○'}  {check.label}</Text>)}</View>}</>}
          {isSignup && <><Text style={styles.label}>Confirme sua senha</Text><TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite a senha novamente" placeholderTextColor="#A99BB1" secureTextEntry autoComplete="new-password" style={styles.input} /></>}
          <Button title={busy ? 'Aguarde...' : isSignup ? 'Criar minha conta' : mode === 'forgot' ? 'Enviar link de recuperação' : mode === 'updatePassword' ? 'Salvar nova senha' : 'Entrar na minha conta'} onPress={submit} disabled={busy} style={styles.submit} />
          {mode === 'signin' && <Pressable accessibilityRole="button" onPress={() => { setMode('forgot'); setNotice(null); }} style={styles.resendLink}><Text style={styles.resendText}>Esqueci minha senha</Text></Pressable>}
          {mode !== 'updatePassword' && <Pressable accessibilityRole="button" onPress={() => { setMode(isSignup || mode === 'forgot' ? 'signin' : 'signup'); setNotice(null); }} style={styles.toggle}><Text style={styles.toggleText}>{isSignup ? 'Já tem conta? ' : mode === 'forgot' ? 'Lembrou a senha? ' : 'Ainda não tem conta? '}<Text style={styles.toggleStrong}>{isSignup || mode === 'forgot' ? 'Entrar' : 'Criar conta'}</Text></Text></Pressable>}
        </View>
        {notice && <View accessibilityRole="alert" style={[styles.notice, notice.kind === 'error' ? styles.noticeError : notice.kind === 'success' ? styles.noticeSuccess : styles.noticeInfo]}><Text style={styles.noticeText}>{notice.message}</Text></View>}
        {mode === 'signin' && email.trim() && <Pressable accessibilityRole="button" onPress={() => void resendConfirmation(email.trim().toLowerCase())} disabled={busy} style={styles.resendLink}><Text style={styles.resendText}>{busy ? 'Enviando...' : 'Não recebeu o e-mail? Reenviar confirmação'}</Text></Pressable>}
        <Text style={styles.privacy}>Cada conta acessa somente os dados associados a ela.</Text>
        </>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 7 }, shell: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1 }, top: { minHeight: 55, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, secure: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: '800' }, hero: { marginTop: 42, marginBottom: 28 }, icon: { width: 54, height: 54, borderRadius: 19, backgroundColor: theme.colors.dark, alignItems: 'center', justifyContent: 'center', marginBottom: 23 }, iconText: { color: theme.colors.orange, fontSize: 29 }, eyebrow: { color: theme.colors.orangeDeep, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, title: { color: theme.colors.ink, fontSize: 35, lineHeight: 42, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 410 }, form: { padding: 22, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 24, backgroundColor: theme.colors.surface }, label: { color: theme.colors.ink, fontWeight: '800', fontSize: 12, marginBottom: 8 }, input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, paddingHorizontal: 15, fontSize: 14, color: theme.colors.ink, marginBottom: 17 }, passwordRules: { marginTop: -8, marginBottom: 17, padding: 14, borderRadius: 14, backgroundColor: theme.colors.darkSoft }, passwordRulesTitle: { color: theme.colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 7 }, passwordRule: { color: theme.colors.muted, fontSize: 11, lineHeight: 19 }, passwordRuleValid: { color: theme.colors.orange }, submit: { marginTop: 3 }, toggle: { alignItems: 'center', paddingVertical: 19 }, toggleText: { color: theme.colors.muted, fontSize: 12 }, toggleStrong: { color: theme.colors.purpleMuted, fontWeight: '900' }, privacy: { textAlign: 'center', color: theme.colors.muted, fontSize: 10, marginTop: 18, marginBottom: 22 },
  confirmationCard: { marginTop: 45, padding: 25, borderRadius: 28, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, confirmationIcon: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orangeSoft, marginBottom: 25 }, confirmationIconText: { fontSize: 29, color: theme.colors.orange }, emailHighlight: { color: theme.colors.ink, fontWeight: '800' }, mailTip: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: theme.colors.darkSoft, borderRadius: 16, padding: 14, marginTop: 20 }, mailTipIcon: { color: theme.colors.orange, fontSize: 17 }, mailTipText: { flex: 1, color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  notice: { borderRadius: 14, padding: 13, marginTop: 16, borderWidth: 1 }, noticeError: { backgroundColor: '#3A211B', borderColor: '#8B412D' }, noticeSuccess: { backgroundColor: '#203128', borderColor: '#426A4F' }, noticeInfo: { backgroundColor: theme.colors.darkSoft, borderColor: theme.colors.line }, noticeText: { color: theme.colors.ink, fontSize: 12, lineHeight: 18 }, resendLink: { alignSelf: 'center', padding: 14 }, resendText: { color: theme.colors.orange, fontWeight: '800', fontSize: 12 },
});

import { Href, router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 800;

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.nav}>
        <Brand />
        <Text style={styles.navCaption}>MOVIMENTO COM INTENÇÃO</Text>
      </View>

      <View style={[styles.hero, wide && styles.heroWide]}>
        <View style={[styles.copy, wide && styles.copyWide]}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>SEU TREINO, DO SEU JEITO</Text>
          </View>

          <Text style={[styles.title, wide ? styles.titleWide : styles.titleNarrow]}>
            Construa sua{'\n'}<Text style={styles.titleAccent}>melhor versão.</Text>
          </Text>
          <Text style={styles.description}>
            Um plano feito para sua rotina, seus objetivos e a pessoa que você quer se tornar.
          </Text>

          <Button
            title="Começar minha jornada"
            onPress={() => router.push('/auth' as Href)}
            style={styles.cta}
          />
          <Text
            accessibilityRole="link"
            onPress={() => router.push('/auth' as Href)}
            style={styles.loginLink}
          >
            Já tem uma conta? <Text style={styles.loginLinkStrong}>Entrar</Text>
          </Text>

          <View style={styles.trustRow}>
            <View style={styles.trustIcon}><Text style={styles.trustIconText}>✓</Text></View>
            <Text style={styles.trustText}>No seu ritmo. Um passo de cada vez.</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>SCHOLZFIT</Text>
        <Text style={styles.footerCopy}>FORÇA, FOCO E EQUILÍBRIO.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 8 },
  nav: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navCaption: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.7, fontWeight: '700' },
  hero: { flexGrow: 1, paddingVertical: 28, justifyContent: 'center', alignItems: 'flex-start' },
  heroWide: { minHeight: 610 },
  copy: { width: '100%', paddingVertical: 18 },
  copyWide: { maxWidth: 570 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 21 },
  eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.orange },
  eyebrowText: { color: theme.colors.purpleMuted, fontWeight: '800', fontSize: 10, letterSpacing: 1.6 },
  title: { color: theme.colors.ink, fontWeight: '900', letterSpacing: -2.2 },
  titleWide: { fontSize: 58, lineHeight: 64 },
  titleNarrow: { fontSize: 43, lineHeight: 48 },
  titleAccent: { color: theme.colors.orangeDeep },
  description: { color: theme.colors.muted, fontSize: 16, lineHeight: 25, marginTop: 19, maxWidth: 440 },
  cta: { marginTop: 27, maxWidth: 360 },
  loginLink: { color: theme.colors.muted, fontSize: 12, marginTop: 15 },
  loginLinkStrong: { color: theme.colors.purpleMuted, fontWeight: '900' },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  trustIcon: { width: 21, height: 21, borderRadius: 11, backgroundColor: theme.colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  trustIconText: { color: theme.colors.purpleMuted, fontWeight: '900', fontSize: 12 },
  trustText: { color: theme.colors.muted, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 17, paddingBottom: 7 },
  footerBrand: { color: theme.colors.purpleMuted, fontSize: 9, letterSpacing: 1.5, fontWeight: '900' },
  footerCopy: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '700' },
});

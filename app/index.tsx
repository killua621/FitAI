import { Href, router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme';


function HeroArtwork() {
  return (
    <View style={styles.artwork}>
      <View style={styles.artTop}><Text style={styles.artKicker}>FITAI / SEU PRÓXIMO NÍVEL</Text><Text style={styles.artIndex}>01 — 03</Text></View>
      <View style={styles.orbitOuter}><View style={styles.orbitInner}><View style={styles.sun}><Text style={styles.sunMark}>✳</Text></View></View></View>
      <View style={styles.verticalLine} />
      <View style={styles.artBottom}><View><Text style={styles.artLabel}>CONSISTÊNCIA</Text><Text style={styles.artMessage}>É assim que{ '\n' }a mudança começa.</Text></View><View style={styles.orangeBadge}><Text style={styles.badgeMark}>↗</Text></View></View>
      <View style={styles.sideLabel}><Text style={styles.sideLabelText}>TREINO • BEM-ESTAR • EVOLUÇÃO</Text></View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.nav}><Brand /><Text style={styles.navCaption}>MOVIMENTO COM INTENÇÃO</Text></View>
      <View style={[styles.hero, wide ? styles.heroWide : styles.heroNarrow]}>
        <View style={[styles.copy, wide && styles.copyWide]}>
          <View style={styles.eyebrow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrowText}>SEU TREINO, DO SEU JEITO</Text></View>
          <Text style={[styles.title, wide ? styles.titleWide : styles.titleNarrow]}>Construa sua{ '\n' }<Text style={styles.titleAccent}>melhor versão.</Text></Text>
          <Text style={styles.description}>Um plano feito para sua rotina, seus objetivos e a pessoa que você quer se tornar.</Text>
          <Button title="Começar minha jornada" onPress={() => router.push('/auth' as Href)} style={styles.cta} />
          <Text accessibilityRole="link" onPress={() => router.push('/auth' as Href)} style={styles.loginLink}>Já tem uma conta? <Text style={styles.loginLinkStrong}>Entrar</Text></Text>
          <View style={styles.trustRow}><View style={styles.trustIcon}><Text style={styles.trustIconText}>✓</Text></View><Text style={styles.trustText}>No seu ritmo. Um passo de cada vez.</Text></View>
        </View>
        <View style={[styles.artWrap, wide && styles.artWrapWide]}><HeroArtwork /></View>
      </View>
      <View style={styles.footer}><Text style={styles.footerBrand}>FITAI</Text><Text style={styles.footerCopy}>FORÇA, FOCO E EQUILÍBRIO.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 8 }, nav: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' }, brandSpark: { color: theme.colors.dark, fontSize: 21, fontWeight: '800' }, brandName: { color: theme.colors.ink, fontSize: 20, letterSpacing: -0.7, fontWeight: '900' }, brandAccent: { color: theme.colors.orangeDeep }, navCaption: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.7, fontWeight: '700' }, hero: { flexGrow: 1, paddingVertical: 28, gap: 35, justifyContent: 'center' }, heroWide: { minHeight: 610, flexDirection: 'row', alignItems: 'center', gap: 56 }, heroNarrow: { flexDirection: 'column', alignItems: 'stretch' }, copy: { width: '100%', paddingVertical: 18 }, copyWide: { flex: 0.9, maxWidth: 450 }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 21 }, eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.orange }, eyebrowText: { color: theme.colors.brown, fontWeight: '800', fontSize: 10, letterSpacing: 1.6 }, title: { color: theme.colors.ink, fontWeight: '900', letterSpacing: -2.2 }, titleWide: { fontSize: 58, lineHeight: 64 }, titleNarrow: { fontSize: 43, lineHeight: 48 }, titleAccent: { color: theme.colors.orangeDeep }, description: { color: theme.colors.muted, fontSize: 16, lineHeight: 25, marginTop: 19, maxWidth: 385 }, cta: { marginTop: 27, maxWidth: 360 }, loginLink: { color: theme.colors.muted, fontSize: 12, marginTop: 15 }, loginLinkStrong: { color: theme.colors.brown, fontWeight: '900' }, trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 }, trustIcon: { width: 21, height: 21, borderRadius: 11, backgroundColor: theme.colors.brownLight, alignItems: 'center', justifyContent: 'center' }, trustIconText: { color: theme.colors.brown, fontWeight: '900', fontSize: 12 }, trustText: { color: theme.colors.muted, fontSize: 12 }, artWrap: { width: '100%' }, artWrapWide: { flex: 1.1 }, artwork: { height: 470, borderRadius: 30, backgroundColor: theme.colors.dark, overflow: 'hidden', padding: 25, justifyContent: 'space-between' }, artTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }, artKicker: { color: '#D7B9A5', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 }, artIndex: { color: '#A88C78', fontSize: 10, fontWeight: '700' }, orbitOuter: { position: 'absolute', width: 292, height: 292, borderRadius: 146, borderWidth: 1, borderColor: '#5B4031', alignSelf: 'center', top: 79, alignItems: 'center', justifyContent: 'center' }, orbitInner: { width: 222, height: 222, borderRadius: 111, borderWidth: 1, borderColor: '#795039', alignItems: 'center', justifyContent: 'center' }, sun: { width: 138, height: 138, borderRadius: 69, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' }, sunMark: { fontSize: 71, color: theme.colors.dark }, verticalLine: { position: 'absolute', width: 1, height: 150, backgroundColor: '#644735', alignSelf: 'center', top: 150 }, artBottom: { zIndex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, artLabel: { color: theme.colors.orange, fontSize: 9, fontWeight: '800', letterSpacing: 1.7, marginBottom: 8 }, artMessage: { color: theme.colors.white, fontSize: 20, lineHeight: 25, fontWeight: '700' }, orangeBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' }, badgeMark: { fontSize: 22, fontWeight: '800', color: theme.colors.dark }, sideLabel: { position: 'absolute', right: 13, top: '43%', transform: [{ rotate: '90deg' }] }, sideLabelText: { color: '#7F6858', fontSize: 8, letterSpacing: 1.4, fontWeight: '700' }, footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 17, paddingBottom: 7 }, footerBrand: { color: theme.colors.brown, fontSize: 9, letterSpacing: 1.5, fontWeight: '900' }, footerCopy: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: '700' },
});


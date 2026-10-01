import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { theme } from '@/theme';

const DAILY_GOAL_ML = 2000;
const QUICK_AMOUNTS = [150, 300, 500];

function formatLiters(amountMl: number) {
  return (amountMl / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function WaterTracker({ compact = false }: { compact?: boolean }) {
  const { session, waterTotalMl, waterLoading, refreshWater, addWater } = useAuth();
  const [amount, setAmount] = useState('300');
  const [saving, setSaving] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(300);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!session?.user.id) return;
    refreshWater().catch(() => setShowError(true));
  }, [session?.user.id]);

  const progress = Math.min(100, Math.round((waterTotalMl / DAILY_GOAL_ML) * 100));
  const remaining = Math.max(0, DAILY_GOAL_ML - waterTotalMl);
  const add = async (amountMl: number) => {
    if (!Number.isFinite(amountMl) || amountMl < 1 || amountMl > 5000) {
      Alert.alert('Quantidade inválida', 'Informe um valor entre 1 e 5.000 ml.');
      return;
    }
    setSaving(true);
    setShowError(false);
    try {
      await addWater(Math.round(amountMl));
      setAmount('300');
      setSelectedAmount(300);
    } catch (error) {
      Alert.alert('Não foi possível registrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <View style={styles.compactTitleRow}><View style={styles.dropBadge}><Text style={styles.dropGlyph}>⌁</Text></View><View><Text style={styles.compactEyebrow}>HÁBITO DO DIA</Text><Text style={styles.compactTitle}>Hidratação</Text></View></View>
          <View style={styles.goalPill}><Text style={styles.goalPillText}>META 2 L</Text></View>
        </View>
        <View style={styles.compactStats}><Text style={styles.compactConsumed}>{formatLiters(waterTotalMl)}<Text style={styles.compactUnit}> L</Text></Text><Text style={styles.compactRemaining}>{remaining > 0 ? `Faltam ${formatLiters(remaining)} L` : 'Meta alcançada 🎉'}</Text></View>
        <View style={styles.compactTrack}><View style={[styles.compactFill, { width: `${progress}%` }]} /></View>
        <View style={styles.compactBottom}><Text style={styles.compactCaption}>{progress}% da sua meta diária</Text><Pressable accessibilityRole="button" disabled={saving || waterLoading} onPress={() => add(300)} style={({ pressed }) => [styles.quickAddButton, pressed && styles.pressed]}><Text style={styles.quickAddText}>{saving ? 'Salvando…' : '+ 300 ml'}</Text></Pressable></View>
        {showError && <Text style={styles.errorNote}>Não foi possível carregar o registro de hoje.</Text>}
      </View>
    );
  }

  return (
    <View style={styles.fullCard}>
      <View style={styles.fullHeader}>
        <View style={styles.fullIntro}><Text style={styles.fullEyebrow}>HIDRATAÇÃO DE HOJE</Text><Text style={styles.fullTitle}>Um copo de cada vez.</Text><Text style={styles.fullSubtitle}>Sua meta diária é 2 litros. Registre cada vez que beber água.</Text></View>
        <View style={styles.fullDrop}><Text style={styles.fullDropGlyph}>⌁</Text><Text style={styles.dropSmall}>HOJE</Text></View>
      </View>
      <View style={styles.progressPanel}>
        <View style={styles.progressHeader}><View><Text style={styles.metricLabel}>VOCÊ BEBEU</Text><Text style={styles.waterValue}>{waterLoading ? '—' : formatLiters(waterTotalMl)}<Text style={styles.liters}> L</Text></Text></View><View style={styles.percentBadge}><Text style={styles.percentText}>{progress}%</Text></View></View>
        <View style={styles.fullTrack}><View style={[styles.fullFill, { width: `${progress}%` }]} /></View>
        <View style={styles.goalLine}><Text style={styles.goalText}>{waterTotalMl.toLocaleString('pt-BR')} ml consumidos</Text><Text style={styles.goalText}>2.000 ml</Text></View>
        <View style={styles.remainingPanel}><View><Text style={styles.remainingLabel}>{remaining > 0 ? 'PARA SUA META' : 'VOCÊ CONSEGUIU!'}</Text><Text style={styles.remainingValue}>{remaining > 0 ? `Faltam ${remaining.toLocaleString('pt-BR')} ml` : 'Meta diária alcançada'}</Text></View><Text style={styles.remainingIcon}>{remaining > 0 ? '↗' : '✓'}</Text></View>
      </View>
      <View style={styles.addSection}>
        <Text style={styles.addTitle}>Quanto você bebeu agora?</Text>
        <View style={styles.amountOptions}>{QUICK_AMOUNTS.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: selectedAmount === item }} onPress={() => { setSelectedAmount(item); setAmount(String(item)); }} style={[styles.amountOption, selectedAmount === item && styles.amountOptionActive]}><Text style={[styles.amountOptionText, selectedAmount === item && styles.amountOptionTextActive]}>+ {item} ml</Text></Pressable>)}</View>
        <View style={styles.entryRow}><View style={styles.inputWrap}><TextInput value={amount} onChangeText={(value) => { setAmount(value.replace(/[^0-9]/g, '')); setSelectedAmount(0); }} keyboardType="number-pad" placeholder="300" placeholderTextColor={theme.colors.muted} style={styles.amountInput} accessibilityLabel="Quantidade de água em mililitros"/><Text style={styles.mlSuffix}>ml</Text></View><Pressable accessibilityRole="button" disabled={saving} onPress={() => add(Number(amount))} style={({ pressed }) => [styles.logButton, saving && styles.disabled, pressed && styles.pressed]}><Text style={styles.logButtonText}>{saving ? 'Salvando…' : 'Registrar água'}</Text><Text style={styles.logArrow}>↗</Text></Pressable></View>
        <Text style={styles.helper}>Você pode registrar de 1 a 5.000 ml por vez.</Text>
        {showError && <Text style={styles.errorNote}>Não foi possível sincronizar. Confira sua conexão e tente novamente.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactCard: { minHeight: 207, borderRadius: 24, backgroundColor: theme.colors.dark, padding: 21, overflow: 'hidden' },
  compactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  dropBadge: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#3A291F', alignItems: 'center', justifyContent: 'center' },
  dropGlyph: { color: theme.colors.orange, fontSize: 27, transform: [{ rotate: '180deg' }] },
  compactEyebrow: { color: '#C2A999', fontSize: 8, letterSpacing: 1.25, fontWeight: '900' },
  compactTitle: { color: theme.colors.white, fontSize: 17, fontWeight: '900', marginTop: 3 },
  goalPill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: '#3A291F' },
  goalPillText: { color: theme.colors.orange, fontSize: 8, letterSpacing: 1, fontWeight: '900' },
  compactStats: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 19 },
  compactConsumed: { color: theme.colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  compactUnit: { color: '#BAA89B', fontSize: 13, fontWeight: '700' },
  compactRemaining: { color: '#E8A17E', fontSize: 11, fontWeight: '700' },
  compactTrack: { height: 7, borderRadius: 5, backgroundColor: '#49372B', overflow: 'hidden', marginTop: 10 },
  compactFill: { height: 7, borderRadius: 5, backgroundColor: theme.colors.orange },
  compactBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  compactCaption: { color: '#A99486', fontSize: 9, fontWeight: '700' },
  quickAddButton: { minHeight: 34, paddingHorizontal: 13, borderRadius: 12, backgroundColor: theme.colors.orange, justifyContent: 'center' },
  quickAddText: { color: theme.colors.dark, fontSize: 10, fontWeight: '900' },
  fullCard: { borderRadius: 28, backgroundColor: theme.colors.dark, padding: 25, overflow: 'hidden' },
  fullHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  fullIntro: { flex: 1 },
  fullEyebrow: { color: theme.colors.orange, fontSize: 9, letterSpacing: 1.5, fontWeight: '900' },
  fullTitle: { color: theme.colors.white, fontSize: 23, fontWeight: '900', letterSpacing: -0.5, marginTop: 7 },
  fullSubtitle: { color: '#B8A89D', fontSize: 12, lineHeight: 18, marginTop: 6, maxWidth: 470 },
  fullDrop: { width: 65, height: 65, borderRadius: 22, backgroundColor: '#3A291F', alignItems: 'center', justifyContent: 'center' },
  fullDropGlyph: { color: theme.colors.orange, fontSize: 36, marginTop: -4, transform: [{ rotate: '180deg' }] },
  dropSmall: { color: '#B99F8E', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  progressPanel: { borderRadius: 21, backgroundColor: '#241B16', borderWidth: 1, borderColor: '#3D2D23', padding: 18, marginTop: 22 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: { color: '#B8A89D', fontSize: 8, letterSpacing: 1.3, fontWeight: '900' },
  waterValue: { color: theme.colors.white, fontSize: 33, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 },
  liters: { color: '#BEA99B', fontSize: 16, fontWeight: '700' },
  percentBadge: { minWidth: 53, height: 36, borderRadius: 13, backgroundColor: '#3B2B21', alignItems: 'center', justifyContent: 'center' },
  percentText: { color: theme.colors.orange, fontSize: 12, fontWeight: '900' },
  fullTrack: { height: 9, borderRadius: 8, backgroundColor: '#49372B', overflow: 'hidden', marginTop: 13 },
  fullFill: { height: 9, borderRadius: 8, backgroundColor: theme.colors.orange },
  goalLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  goalText: { color: '#A99486', fontSize: 9, fontWeight: '700' },
  remainingPanel: { minHeight: 58, borderRadius: 15, backgroundColor: '#35251C', paddingHorizontal: 14, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remainingLabel: { color: '#B99F8E', fontSize: 7, letterSpacing: 1.2, fontWeight: '900' },
  remainingValue: { color: '#F2EAE4', fontSize: 13, fontWeight: '900', marginTop: 3 },
  remainingIcon: { color: theme.colors.orange, fontSize: 20, fontWeight: '900' },
  addSection: { marginTop: 22 },
  addTitle: { color: theme.colors.white, fontSize: 13, fontWeight: '800' },
  amountOptions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  amountOption: { minHeight: 37, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#594435', justifyContent: 'center', backgroundColor: '#2A1F19' },
  amountOptionActive: { backgroundColor: '#4A2F21', borderColor: theme.colors.orange },
  amountOptionText: { color: '#C6B4A8', fontSize: 10, fontWeight: '800' },
  amountOptionTextActive: { color: theme.colors.orange },
  entryRow: { flexDirection: 'row', gap: 10, marginTop: 11 },
  inputWrap: { flex: 1, minHeight: 49, borderRadius: 14, borderWidth: 1, borderColor: '#594435', backgroundColor: '#241B16', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  amountInput: { flex: 1, color: theme.colors.white, fontSize: 14, fontWeight: '800', paddingVertical: 11, outlineStyle: 'none' } as never,
  mlSuffix: { color: '#A99486', fontSize: 11, fontWeight: '800' },
  logButton: { minHeight: 49, borderRadius: 14, paddingHorizontal: 16, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 13 },
  logButtonText: { color: theme.colors.dark, fontSize: 11, fontWeight: '900' },
  logArrow: { color: theme.colors.dark, fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  helper: { color: '#A99486', fontSize: 9, marginTop: 9 },
  errorNote: { color: '#FFB49B', fontSize: 10, marginTop: 8 },
});

import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import tacoFoods from '@/features/nutrition/tacoFoods.json';

type TacoFood = (typeof tacoFoods)[number];
type FoodLog = {
  id: string;
  meal_type: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  logged_at: string;
};

const mealTypes = ['Café', 'Almoço', 'Lanche', 'Jantar'];
const fold = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const number = (value: number | null | undefined) => value == null ? '—' : value > 0 && value < 0.05 ? 'Tr' : value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kcal = (value: number | null | undefined) => value == null ? '—' : Math.round(value).toLocaleString('pt-BR');
const round = (value: number) => Math.round(value * 100) / 100;

export function FoodPlanner() {
  const { profile } = useAuth();
  const [mealType, setMealType] = useState('Café');
  const [search, setSearch] = useState('');
  const [food, setFood] = useState<TacoFood | null>(null);
  const [gramsText, setGramsText] = useState('100');
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!profile?.id) { setLogs([]); return () => { active = false; }; }
    const loadToday = async () => {
      setLoadingLogs(true);
      setError('');
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      try {
        const { data, error: queryError } = await supabase.from('meal_logs').select('id,meal_type,description,calories,protein_g,carbs_g,fat_g,logged_at')
          .eq('user_id', profile.id).gte('logged_at', start.toISOString()).lt('logged_at', end.toISOString()).order('logged_at', { ascending: false });
        if (queryError) throw queryError;
        if (active) setLogs((data || []) as FoodLog[]);
      } catch {
        if (active) setError('Não foi possível carregar os alimentos de hoje. Tente atualizar a tela.');
      } finally {
        if (active) setLoadingLogs(false);
      }
    };
    void loadToday();
    return () => { active = false; };
  }, [profile?.id]);

  const results = useMemo(() => {
    const terms = fold(search.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return tacoFoods.filter((item) => {
      const description = fold(item.description);
      return terms.every((term) => description.includes(term));
    }).sort((a, b) => {
      const query = fold(search.trim());
      const aStarts = fold(a.description).startsWith(query);
      const bStarts = fold(b.description).startsWith(query);
      return aStarts === bStarts ? a.id - b.id : aStarts ? -1 : 1;
    }).slice(0, 12);
  }, [search]);

  const grams = Number.parseFloat(gramsText.replace(',', '.'));
  const scale = Number.isFinite(grams) && grams > 0 ? grams / 100 : 0;
  const calc = (value: number | null) => value == null ? null : round(value * scale);
  const currentLogs = logs.filter((item) => item.meal_type === mealType);
  const totals = logs.reduce((sum, item) => ({
    calories: sum.calories + (item.calories || 0), protein: sum.protein + (item.protein_g || 0),
    carbs: sum.carbs + (item.carbs_g || 0), fat: sum.fat + (item.fat_g || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const addFood = async () => {
    if (!profile?.id) return Alert.alert('Entre na sua conta', 'Faça login para salvar sua alimentação.');
    if (!food) return Alert.alert('Escolha um alimento', 'Pesquise e selecione um item da TACO antes de adicionar.');
    if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) return Alert.alert('Confira a quantidade', 'Informe uma quantidade entre 1 e 5.000 g.');
    setSaving(true);
    try {
      const description = `${food.description} · ${number(grams)} g · TACO #${food.id}`;
      const { data, error: insertError } = await supabase.from('meal_logs').insert({
        user_id: profile.id, meal_type: mealType, description,
        calories: calc(food.energiaKcal), protein_g: calc(food.proteinaG),
        carbs_g: calc(food.carboidratoG), fat_g: calc(food.lipideosG),
      }).select('id,meal_type,description,calories,protein_g,carbs_g,fat_g,logged_at').single();
      if (insertError) throw insertError;
      setLogs((current) => [data as FoodLog, ...current]);
      setFood(null);
      setSearch('');
      setGramsText('100');
      setShowMore(false);
    } catch (caught) {
      Alert.alert('Não foi possível salvar', caught instanceof Error ? caught.message : 'Tente novamente.');
    } finally { setSaving(false); }
  };

  const removeFood = (item: FoodLog) => Alert.alert('Remover alimento?', item.description, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: () => { void (async () => {
      const { error: deleteError } = await supabase.from('meal_logs').delete().eq('id', item.id);
      if (deleteError) return Alert.alert('Não foi possível remover', 'Tente novamente.');
      setLogs((current) => current.filter((entry) => entry.id !== item.id));
    })(); } },
  ]);

  const openTacoSource = async () => {
    try { await Linking.openURL('https://nepa.unicamp.br/publicacoes/'); }
    catch { Alert.alert('Não foi possível abrir a fonte', 'A tabela é da 4ª edição da TACO, publicada pelo NEPA/UNICAMP.'); }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>PLANEJADOR COM A TACO</Text>
      <Text style={styles.title}>Monte sua alimentação</Text>
      <Text style={styles.description}>Pesquise um alimento, escolha a versão e informe a quantidade em gramas. Os nutrientes são calculados automaticamente.</Text>

      <View style={styles.mealTypes}>{mealTypes.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mealType === item }} onPress={() => setMealType(item)} style={[styles.mealPill, mealType === item && styles.mealPillActive]}><Text style={[styles.mealText, mealType === item && styles.mealTextActive]}>{item}</Text></Pressable>)}</View>

      <Text style={styles.fieldLabel}>Qual alimento você consumiu?</Text>
      <TextInput value={search} onChangeText={(value) => { setSearch(value); setFood(null); }} placeholder="Ex.: arroz, frango, banana" placeholderTextColor={theme.colors.muted} style={styles.searchInput} accessibilityLabel="Pesquisar alimento na TACO" />
      {search.trim().length > 0 && !food ? (
        <View style={styles.resultList}>
          {results.length ? results.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => { setFood(item); setSearch(item.description); }} style={styles.resultItem}><Text style={styles.resultName}>{item.description}</Text><Text style={styles.resultMeta}>{item.category} · TACO #{item.id}</Text></Pressable>) : <Text style={styles.emptySearch}>Nenhum alimento encontrado. Tente outro nome. A TACO não contém todas as marcas e produtos industrializados.</Text>}
        </View>
      ) : null}

      {food ? (
        <View style={styles.selectionCard}>
          <Text style={styles.selectedName}>{food.description}</Text>
          {profile?.food_allergies?.length || profile?.food_allergy_notes?.trim() ? <Text style={styles.allergyHint}>Atenção: seu perfil registra {profile.food_allergies?.join(', ')}{profile.food_allergy_notes?.trim() ? `${profile.food_allergies?.length ? ' e ' : ''}${profile.food_allergy_notes.trim()}` : ''}. A TACO não identifica alergênicos nem contaminação cruzada; confira o rótulo antes de consumir.</Text> : null}
          <Text style={styles.portionLabel}>Quantidade consumida · gramas</Text>
          <View style={styles.portionRow}><TextInput value={gramsText} onChangeText={setGramsText} keyboardType="decimal-pad" accessibilityLabel="Quantidade do alimento em gramas" style={styles.gramsInput} /><Text style={styles.gramsUnit}>g</Text></View>
          <View style={styles.macros}>
            <Macro label="CARBOIDRATOS" value={number(calc(food.carboidratoG))} />
            <Macro label="PROTEÍNAS" value={number(calc(food.proteinaG))} />
            <Macro label="GORDURAS" value={number(calc(food.lipideosG))} />
          </View>
          <View style={styles.extraMacroRow}><Text style={styles.extraMacro}>Energia: {kcal(calc(food.energiaKcal))} kcal</Text><Text style={styles.extraMacro}>Fibras: {number(calc(food.fibraG))} g</Text></View>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMore }} onPress={() => setShowMore((value) => !value)} style={styles.moreToggle}><Text style={styles.moreText}>{showMore ? 'Ocultar outros nutrientes' : 'Ver outros nutrientes da TACO'}　{showMore ? '−' : '+'}</Text></Pressable>
          {showMore ? <View style={styles.micronutrients}>{[
            ['Sódio', food.sodioMg, 'mg'], ['Potássio', food.potassioMg, 'mg'], ['Cálcio', food.calcioMg, 'mg'], ['Ferro', food.ferroMg, 'mg'], ['Magnésio', food.magnesioMg, 'mg'], ['Colesterol', food.colesterolMg, 'mg'],
          ].map(([label, value, unit]) => <Text key={String(label)} style={styles.microText}>{label}: {number(calc(value as number | null))} {unit}</Text>)}</View> : null}
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => void addFood()} style={[styles.addButton, saving && { opacity: 0.7 }]}><Text style={styles.addButtonText}>{saving ? 'Salvando…' : `Adicionar ao ${mealType.toLocaleLowerCase('pt-BR')}`}</Text></Pressable>
        </View>
      ) : null}

      <View style={styles.dailySummary}>
        <View><Text style={styles.summaryEyebrow}>TOTAL REGISTRADO HOJE</Text><Text style={styles.summaryTitle}>{kcal(totals.calories)} kcal</Text></View>
        <Text style={styles.summaryMacros}>C {number(totals.carbs)} g　P {number(totals.protein)} g　G {number(totals.fat)} g</Text>
      </View>

      <Text style={styles.loggedHeading}>{mealType} · alimentos de hoje</Text>
      {loadingLogs ? <Text style={styles.statusText}>Carregando seus registros…</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!loadingLogs && !currentLogs.length ? <Text style={styles.statusText}>Ainda não há alimentos registrados nesta refeição.</Text> : null}
      {currentLogs.map((item) => <View key={item.id} style={styles.loggedItem}><View style={styles.loggedCopy}><Text style={styles.loggedName}>{item.description}</Text><Text style={styles.loggedMacros}>C {number(item.carbs_g)} g · P {number(item.protein_g)} g · G {number(item.fat_g)} g</Text><Text style={styles.loggedEnergy}>{kcal(item.calories)} kcal</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Remover ${item.description}`} onPress={() => removeFood(item)} style={styles.removeButton}><Text style={styles.removeText}>Remover</Text></Pressable></View>)}

      <Pressable accessibilityRole="link" onPress={() => void openTacoSource()} style={styles.sourceLink}><Text style={styles.sourceText}>Fonte: TACO, 4ª edição · NEPA/UNICAMP ↗</Text></Pressable>
      <Text style={styles.disclaimer}>Valores por 100 g de parte comestível da TACO, ajustados pela quantidade informada. Podem variar conforme marca e preparo; confira o rótulo. Este registro é educativo e não substitui orientação nutricional.</Text>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return <View style={styles.macro}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}> g</Text></Text></View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 18, marginBottom: 22 },
  eyebrow: { color: theme.colors.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 7 },
  description: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  mealTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16, marginBottom: 16 },
  mealPill: { minHeight: 36, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line },
  mealPillActive: { backgroundColor: theme.colors.purpleSurface, borderColor: theme.colors.purple },
  mealText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' },
  mealTextActive: { color: theme.colors.white },
  fieldLabel: { color: theme.colors.ink, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  searchInput: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background, color: theme.colors.ink, paddingHorizontal: 13, fontSize: 12, outlineStyle: 'none' } as never,
  resultList: { borderWidth: 1, borderColor: theme.colors.line, borderRadius: 14, marginTop: 7, overflow: 'hidden', backgroundColor: theme.colors.background },
  resultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  resultName: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' },
  resultMeta: { color: theme.colors.muted, fontSize: 9, marginTop: 4 },
  emptySearch: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, padding: 12 },
  selectionCard: { borderRadius: 16, padding: 14, marginTop: 13, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.line },
  selectedName: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  allergyHint: { color: theme.colors.ink, backgroundColor: theme.colors.orangeSoft, borderRadius: 10, fontSize: 9, lineHeight: 14, padding: 9, marginTop: 9 },
  portionLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '700', marginTop: 13, marginBottom: 6 },
  portionRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', borderRadius: 11, borderWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 12 },
  gramsInput: { flex: 1, color: theme.colors.ink, fontSize: 13, fontWeight: '800', outlineStyle: 'none' } as never,
  gramsUnit: { color: theme.colors.muted, fontSize: 11, fontWeight: '800' },
  macros: { flexDirection: 'row', gap: 7, marginTop: 11 },
  macro: { flex: 1, minHeight: 62, justifyContent: 'center', backgroundColor: theme.colors.purpleSoft, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8 },
  macroLabel: { color: theme.colors.purpleMuted, fontSize: 7, lineHeight: 10, letterSpacing: 0.45, fontWeight: '900' },
  macroValue: { color: theme.colors.orange, fontSize: 17, fontWeight: '900', marginTop: 4 },
  macroUnit: { fontSize: 9, color: theme.colors.muted },
  extraMacroRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  extraMacro: { color: theme.colors.muted, fontSize: 10, fontWeight: '700' },
  moreToggle: { marginTop: 11, paddingVertical: 6 },
  moreText: { color: theme.colors.purpleMuted, fontSize: 10, fontWeight: '800' },
  micronutrients: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingVertical: 8 },
  microText: { color: theme.colors.muted, fontSize: 9 },
  addButton: { minHeight: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.orange, marginTop: 12 },
  addButtonText: { color: theme.colors.dark, fontSize: 11, fontWeight: '900' },
  dailySummary: { borderRadius: 15, backgroundColor: theme.colors.dark, padding: 14, marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summaryEyebrow: { color: theme.colors.orange, fontSize: 7, letterSpacing: 0.9, fontWeight: '900' },
  summaryTitle: { color: theme.colors.white, fontSize: 19, fontWeight: '900', marginTop: 3 },
  summaryMacros: { color: '#E2D9E6', fontSize: 9, fontWeight: '700' },
  loggedHeading: { color: theme.colors.ink, fontSize: 12, fontWeight: '900', marginTop: 17, marginBottom: 8 },
  statusText: { color: theme.colors.muted, fontSize: 10, paddingVertical: 8 },
  errorText: { color: theme.colors.orange, fontSize: 10, paddingVertical: 8 },
  loggedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingVertical: 10 },
  loggedCopy: { flex: 1 },
  loggedName: { color: theme.colors.ink, fontSize: 10, fontWeight: '800' },
  loggedMacros: { color: theme.colors.muted, fontSize: 9, marginTop: 4 },
  loggedEnergy: { color: theme.colors.purpleMuted, fontSize: 9, marginTop: 3, fontWeight: '700' },
  removeButton: { padding: 7 },
  removeText: { color: theme.colors.muted, fontSize: 9, fontWeight: '800' },
  sourceLink: { alignSelf: 'flex-start', marginTop: 13, paddingVertical: 4 },
  sourceText: { color: theme.colors.purpleMuted, fontSize: 9, fontWeight: '800' },
  disclaimer: { color: theme.colors.muted, fontSize: 8, lineHeight: 13, marginTop: 5 },
});

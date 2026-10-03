import { Href, router, useLocalSearchParams, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Tab = { href: '/home' | '/workout' | '/nutrition' | '/progress' | '/profile'; label: string; icon: string; hint: string };
const tabs: Tab[] = [
  { href: '/home', label: 'Início', icon: '⌂', hint: 'Seu dia' },
  { href: '/workout', label: 'Treino', icon: '✦', hint: 'Movimento' },
  { href: '/nutrition', label: 'Dieta', icon: '◒', hint: 'Nutrição' },
  { href: '/progress', label: 'Evolução', icon: '↗', hint: 'Conquistas' },
  { href: '/profile', label: 'Perfil', icon: '◎', hint: 'Você' },
];

export function AppTabBar({ active }: { active: Tab['href'] }) {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  return (
    <View accessibilityRole="tablist" style={styles.bar}>
      {tabs.map((tab) => {
        const selected = active === tab.href || pathname === tab.href;
        return (
          <Pressable
            key={tab.href}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label} · ${tab.hint}`}
            accessibilityState={{ selected }}
            onPress={() => router.replace({ pathname: tab.href, params } as Href)}
            style={({ pressed }) => [styles.item, selected && styles.itemActive, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrap, selected && styles.iconActive]}>
              <Text style={[styles.icon, selected && styles.iconSelected]}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
            <View style={[styles.indicator, selected && styles.indicatorActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 24,
    paddingHorizontal: 7,
    paddingTop: 8,
    paddingBottom: 5,
    marginTop: 13,
    marginBottom: 7,
    boxShadow: '0px 8px 16px rgba(0,0,0,0.28)',
  },
  item: { flex: 1, minHeight: 59, borderRadius: 17, alignItems: 'center', justifyContent: 'center', gap: 3 },
  itemActive: { backgroundColor: theme.colors.purpleSoft },
  itemPressed: { transform: [{ scale: 0.95 }], opacity: 0.86 },
  iconWrap: { width: 34, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: theme.colors.purple },
  icon: { color: '#B8A7C4', fontSize: 19, fontWeight: '700' },
  iconSelected: { color: theme.colors.dark },
  label: { color: theme.colors.muted, fontSize: 9, fontWeight: '600' },
  labelSelected: { color: theme.colors.ink, fontWeight: '900' },
  indicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: theme.colors.purple },
});

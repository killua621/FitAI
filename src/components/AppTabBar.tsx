import { Href, router, useLocalSearchParams, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Tab = { href: '/home' | '/workout' | '/nutrition' | '/progress' | '/profile'; label: string; icon: string };
const tabs: Tab[] = [
  { href: '/home', label: 'Início', icon: '⌂' },
  { href: '/workout', label: 'Treino', icon: '◉' },
  { href: '/nutrition', label: 'Dieta', icon: '◒' },
  { href: '/progress', label: 'Evolução', icon: '↗' },
  { href: '/profile', label: 'Perfil', icon: '○' },
];

export function AppTabBar({ active }: { active: Tab['href'] }) {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  return (
    <View accessibilityRole="tablist" style={styles.bar}>
      {tabs.map((tab) => {
        const selected = active === tab.href || pathname === tab.href;
        return (
          <Pressable key={tab.href} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => router.replace({ pathname: tab.href, params } as Href)} style={styles.item}>
            <View style={[styles.iconWrap, selected && styles.iconActive]}><Text style={[styles.icon, selected && styles.iconSelected]}>{tab.icon}</Text></View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 12, paddingBottom: 5, marginTop: 10 },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: { width: 34, height: 29, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: theme.colors.dark },
  icon: { color: '#A5968C', fontSize: 19 },
  iconSelected: { color: theme.colors.orange },
  label: { color: theme.colors.muted, fontSize: 9, fontWeight: '600' },
  labelSelected: { color: theme.colors.ink, fontWeight: '900' },
});


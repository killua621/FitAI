import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

export function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.mark} accessibilityElementsHidden>
        <View style={styles.ribbonTop} /><View style={styles.ribbonUpper} />
        <View style={styles.ribbonLower} /><View style={styles.ribbonFoot} />
      </View>
      <Text style={styles.name}>Scholz<Text style={styles.accent}>Fit</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 34, height: 34, position: 'relative' },
  ribbonTop: { position: 'absolute', top: 3, left: 13, width: 19, height: 8, borderRadius: 3, backgroundColor: theme.colors.purple, transform: [{ rotate: '-35deg' }] },
  ribbonUpper: { position: 'absolute', top: 10, left: 5, width: 19, height: 8, borderRadius: 3, backgroundColor: theme.colors.purple, transform: [{ rotate: '35deg' }] },
  ribbonLower: { position: 'absolute', top: 17, left: 10, width: 20, height: 8, borderRadius: 3, backgroundColor: theme.colors.orange, transform: [{ rotate: '-35deg' }] },
  ribbonFoot: { position: 'absolute', top: 25, left: 0, width: 20, height: 8, borderRadius: 3, backgroundColor: theme.colors.orange, transform: [{ rotate: '-2deg' }] },
  name: { color: theme.colors.ink, fontSize: 20, letterSpacing: -0.7, fontWeight: '900' },
  accent: { color: theme.colors.orange },
});

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

export function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.mark}><Text style={styles.spark}>✳</Text></View>
      <Text style={styles.name}>fit<Text style={styles.accent}>ai</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.orange, alignItems: 'center', justifyContent: 'center' },
  spark: { color: theme.colors.dark, fontSize: 21, fontWeight: '800' },
  name: { color: theme.colors.ink, fontSize: 20, letterSpacing: -0.7, fontWeight: '900' },
  accent: { color: theme.colors.orangeDeep },
});

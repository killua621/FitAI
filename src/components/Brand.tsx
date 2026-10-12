import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

export function Brand() {
  return (
    <View style={styles.brand} accessibilityLabel="ScholzFit">
      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityElementsHidden
      />
      <Text style={styles.name}>Scholz<Text style={styles.accent}>Fit</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 42, height: 42, borderRadius: 12 },
  name: { color: theme.colors.ink, fontSize: 20, letterSpacing: -0.7, fontWeight: '900' },
  accent: { color: theme.colors.orange },
});


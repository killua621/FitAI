import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'dark' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const dark = variant === 'dark';
  const outline = variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        dark && styles.dark,
        outline && styles.outline,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, (dark || outline) && styles.darkLabel]}>{title}</Text>
      {!outline && <Text style={[styles.arrow, dark && styles.darkArrow]}>↗</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 56, borderRadius: 18, backgroundColor: theme.colors.orange, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 5px 12px rgba(255,123,63,0.18)' },
  dark: { backgroundColor: theme.colors.dark },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.line },
  label: { color: theme.colors.dark, fontSize: 14, letterSpacing: 0.1, fontWeight: '900' },
  darkLabel: { color: theme.colors.white },
  arrow: { position: 'absolute', right: 22, color: theme.colors.dark, fontSize: 18, fontWeight: '700' },
  darkArrow: { color: theme.colors.orange },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});

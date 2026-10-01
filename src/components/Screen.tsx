import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/theme';

type Props = PropsWithChildren<{ scroll?: boolean; style?: ViewStyle; footer?: ReactNode }>;

export function Screen({ children, scroll = false, style, footer }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const contentStyle = [styles.content, wide ? styles.wideContent : styles.compactContent, style];
  const footerStyle = [styles.footer, wide ? styles.wideFooter : styles.compactFooter];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
      {footer && <View style={footerStyle}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { width: '100%', flexGrow: 1, alignSelf: 'center', paddingTop: 22, paddingBottom: 24 },
  wideContent: { maxWidth: 1160, paddingHorizontal: 38 },
  compactContent: { paddingHorizontal: 22 },
  footer: { width: '100%', alignSelf: 'center', backgroundColor: theme.colors.background },
  wideFooter: { maxWidth: 1160, paddingHorizontal: 38 },
  compactFooter: { paddingHorizontal: 22 },
});

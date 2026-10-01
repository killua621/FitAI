import { Href, Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { theme } from '@/theme';

function RouteGuard({ children }: { children: ReactNode }) {
  const { session, profile, loading, profileLoading } = useAuth();
  const segments = useSegments() as string[];
  const firstSegment = segments[0];
  const publicRoute = !firstSegment || firstSegment === 'index' || firstSegment === 'auth';

  useEffect(() => {
    if (loading || (session && profileLoading)) return;
    if (!session && !publicRoute) router.replace('/auth' as Href);
    else if (session && publicRoute) router.replace(profile ? '/home' : '/onboarding');
  }, [session, profile, loading, profileLoading, publicRoute]);

  if (loading || (session && profileLoading)) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.orangeDeep} /></View>;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: 'fade' }} />
      </RouteGuard>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background } });

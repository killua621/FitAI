import { useEffect, useState } from 'react';
import { AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/features/auth/AuthProvider';
import { theme } from '@/theme';

const THREE_HOURS = 3 * 60 * 60 * 1000;
const messages = [
  'Eii, pausa rapidinha! Pega uma água, dá um gole e depois volta no seu ritmo. 💧',
  'Alô, hora de hidratar! Seu corpo merece esse cuidado entre uma tarefa e outra. 🧡',
  'Missão relâmpago: levanta, pega sua água e faz um brinde à sua saúde. 💧',
  'Pausa no que estiver fazendo por um instante: que tal tomar uma água agora?',
];

export function HydrationReminder() {
  const { session } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setVisible(false);
      return;
    }

    let disposed = false;
    let nextReminderAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const storageKey = `scholzfit:hydration-reminder:${userId}`;
    const saveNextReminder = () => {
      void AsyncStorage.setItem(storageKey, String(nextReminderAt)).catch(() => undefined);
    };

    const scheduleNextCheck = () => {
      if (disposed) return;
      if (timer) clearTimeout(timer);
      const untilReminder = Math.max(0, nextReminderAt - Date.now());
      timer = setTimeout(checkReminder, untilReminder);
    };

    const checkReminder = () => {
      if (disposed) return;
      if (AppState.currentState !== 'active') {
        timer = setTimeout(checkReminder, 60_000);
        return;
      }
      if (Date.now() >= nextReminderAt) {
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setVisible(true);
        nextReminderAt = Date.now() + THREE_HOURS;
        saveNextReminder();
      }
      scheduleNextCheck();
    };

    const initialize = async () => {
      try {
        const saved = Number(await AsyncStorage.getItem(storageKey));
        if (!disposed && Number.isFinite(saved) && saved > 0) nextReminderAt = saved;
      } catch {
        // If local storage is unavailable, keep the reminder active for this session.
      }
      if (disposed) return;
      if (!nextReminderAt) {
        nextReminderAt = Date.now() + THREE_HOURS;
        saveNextReminder();
      }
      checkReminder();
    };

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkReminder();
    });

    void initialize();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      appStateListener.remove();
    };
  }, [session?.user.id]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.icon}><Text style={styles.iconText}>💧</Text></View>
          <Text style={styles.eyebrow}>PAUSA DE HIDRATAÇÃO</Text>
          <Text style={styles.title}>Ei, um minutinho pra você!</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>Bora hidratar ↗</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={styles.dismissButton}>
            <Text style={styles.dismissLabel}>Fechar por enquanto</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: 'rgba(5, 3, 8, 0.78)' },
  card: { width: '100%', maxWidth: 430, alignItems: 'center', borderRadius: 28, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 25, paddingTop: 28, paddingBottom: 21 },
  icon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.purpleSoft, marginBottom: 17 },
  iconText: { fontSize: 31 },
  eyebrow: { color: theme.colors.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.ink, fontSize: 23, lineHeight: 29, fontWeight: '900', textAlign: 'center', marginTop: 9 },
  message: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 },
  primaryButton: { minHeight: 50, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: theme.colors.orange, marginTop: 22 },
  primaryLabel: { color: theme.colors.dark, fontSize: 13, fontWeight: '900' },
  dismissButton: { paddingHorizontal: 18, paddingVertical: 12, marginTop: 4 },
  dismissLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' },
});

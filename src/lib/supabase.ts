import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local.');
}

const memoryStorage: SupportedStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

const webStorage: SupportedStorage = typeof globalThis.localStorage === 'undefined'
  ? memoryStorage
  : globalThis.localStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

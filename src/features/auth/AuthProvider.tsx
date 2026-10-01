import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  display_name: string;
  goal: string;
  experience_level: string;
  training_days: number;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  waterTotalMl: number;
  waterLoading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  refreshWater: () => Promise<number>;
  addWater: (amountMl: number) => Promise<void>;
  saveProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [waterTotalMl, setWaterTotalMl] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);

  const refreshProfile = async () => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      return null;
    }
    setProfileLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      setProfile(data as Profile | null);
      return data as Profile | null;
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async (values: Omit<Profile, 'id'>) => {
    const userId = session?.user.id;
    if (!userId) throw new Error('Sua sessão expirou. Entre novamente para salvar seu perfil.');
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...values });
    if (error) throw error;
    setProfile({ id: userId, ...values });
  };

  const loadWaterForUser = async (userId: string) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const { data, error } = await supabase.from('water_logs').select('amount_ml')
      .eq('user_id', userId).gte('logged_at', start.toISOString()).lt('logged_at', end.toISOString());
    if (error) throw error;
    return (data || []).reduce((sum, row) => sum + row.amount_ml, 0);
  };

  const refreshWater = async () => {
    const userId = session?.user.id;
    if (!userId) {
      setWaterTotalMl(0);
      return 0;
    }
    setWaterLoading(true);
    try {
      const total = await loadWaterForUser(userId);
      setWaterTotalMl(total);
      return total;
    } finally {
      setWaterLoading(false);
    }
  };

  const addWater = async (amountMl: number) => {
    const userId = session?.user.id;
    if (!userId) throw new Error('Entre novamente para registrar sua hidratação.');
    const { error } = await supabase.from('water_logs').insert({ user_id: userId, amount_ml: amountMl });
    if (error) throw error;
    setWaterTotalMl((total) => total + amountMl);
  };

  useEffect(() => {
    let active = true;
    const loadSessionData = async (currentSession: Session | null) => {
      if (!active) return;
      setSession(currentSession);
      if (!currentSession) {
        setProfile(null);
        setWaterTotalMl(0);
        setProfileLoading(false);
        setWaterLoading(false);
        setLoading(false);
        return;
      }
      setProfileLoading(true);
      setWaterLoading(true);
      const [profileResult, waterResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentSession.user.id).maybeSingle(),
        loadWaterForUser(currentSession.user.id),
      ]);
      if (!active) return;
      setProfile(profileResult.data as Profile | null);
      setWaterTotalMl(waterResult);
      setProfileLoading(false);
      setWaterLoading(false);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void loadSessionData(currentSession).catch(() => {
        if (active) { setLoading(false); setProfileLoading(false); setWaterLoading(false); }
      });
    }).catch(() => { if (active) setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => { void loadSessionData(nextSession).catch(() => {
        if (active) { setLoading(false); setProfileLoading(false); setWaterLoading(false); }
      }); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session, profile, loading, profileLoading, waterTotalMl, waterLoading,
    refreshProfile, refreshWater, addWater, saveProfile,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [session, profile, loading, profileLoading, waterTotalMl, waterLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return value;
}

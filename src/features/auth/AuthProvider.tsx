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
  weight_goal_kg: number | null;
  weight_goal_start_kg: number | null;
  water_goal_ml: number | null;
  training_weekdays: string[];
  activity_level: 'low' | 'light' | 'moderate' | 'high' | null;
  energy_equation_profile: 'female' | 'male' | null;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  waterTotalMl: number;
  waterLoading: boolean;
  workoutCheckinDates: string[];
  weightHistory: { weight_kg: number; measured_at: string }[];
  refreshProfile: () => Promise<Profile | null>;
  refreshWater: () => Promise<number>;
  addWater: (amountMl: number) => Promise<void>;
  setWaterGoal: (goalMl: number) => Promise<void>;
  refreshWorkoutCheckins: () => Promise<string[]>;
  addWorkoutCheckin: (workoutTitle: string, activityType?: string, focus?: string) => Promise<boolean>;
  addWeighIn: (weightKg: number) => Promise<void>;
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
  const [workoutCheckinDates, setWorkoutCheckinDates] = useState<string[]>([]);
  const [weightHistory, setWeightHistory] = useState<{ weight_kg: number; measured_at: string }[]>([]);

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

  const setWaterGoal = async (goalMl: number) => {
    const userId = session?.user.id;
    if (!userId) throw new Error('Entre novamente para salvar sua meta.');
    if (profile?.age && profile.age < 18) throw new Error('Peça a um responsável para definir uma meta adequada com orientação profissional.');
    if (!Number.isInteger(goalMl) || goalMl < 500 || goalMl > 6000) throw new Error('Escolha uma meta entre 500 e 6.000 ml.');
    const { error } = await supabase.from('profiles').update({ water_goal_ml: goalMl }).eq('id', userId);
    if (error) throw error;
    setProfile((current) => current ? { ...current, water_goal_ml: goalMl } : current);
  };

  const loadWorkoutCheckins = async (userId: string) => {
    const { data, error } = await supabase.from('workout_checkins').select('checkin_date')
      .eq('user_id', userId).order('checkin_date', { ascending: false }).limit(90);
    if (error) throw error;
    return (data || []).map((row) => row.checkin_date as string);
  };

  const loadWeightHistory = async (userId: string) => {
    const { data, error } = await supabase.from('body_metrics').select('weight_kg,measured_at')
      .eq('user_id', userId).not('weight_kg', 'is', null).order('measured_at', { ascending: false }).limit(30);
    if (error) throw error;
    return (data || []) as { weight_kg: number; measured_at: string }[];
  };

  const addWeighIn = async (weightKg: number) => {
    const userId = session?.user.id;
    if (!userId) throw new Error('Entre novamente para registrar seu peso.');
    if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 500) throw new Error('Informe um peso entre 20 e 500 kg.');
    const { data: measuredAt, error } = await supabase.rpc('record_weight_weigh_in', { p_weight_kg: weightKg });
    if (error) throw error;
    const timestamp = typeof measuredAt === 'string' ? measuredAt : new Date().toISOString();
    setProfile((current) => current ? { ...current, weight_kg: weightKg } : current);
    setWeightHistory((current) => [{ weight_kg: weightKg, measured_at: timestamp }, ...current].slice(0, 30));
  };

  const refreshWorkoutCheckins = async () => {
    const userId = session?.user.id;
    if (!userId) { setWorkoutCheckinDates([]); return []; }
    const dates = await loadWorkoutCheckins(userId);
    setWorkoutCheckinDates(dates);
    return dates;
  };

  const addWorkoutCheckin = async (workoutTitle: string, activityType = 'Musculação', focus = '') => {
    const userId = session?.user.id;
    if (!userId) throw new Error('Entre novamente para registrar seu treino.');
    const now = new Date();
    const checkinDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase.from('workout_checkins').upsert({
      user_id: userId, checkin_date: checkinDate, workout_title: workoutTitle,
      activity_type: activityType, workout_focus: focus,
    }, { onConflict: 'user_id,checkin_date', ignoreDuplicates: true }).select('checkin_date');
    if (error) throw error;
    if (!data?.length) return false;
    setWorkoutCheckinDates((dates) => dates.includes(checkinDate) ? dates : [checkinDate, ...dates]);
    return true;
  };

  useEffect(() => {
    let active = true;
    const loadSessionData = async (currentSession: Session | null) => {
      if (!active) return;
      setSession(currentSession);
      if (!currentSession) {
        setProfile(null);
        setWaterTotalMl(0);
        setWorkoutCheckinDates([]);
        setWeightHistory([]);
        setProfileLoading(false);
        setWaterLoading(false);
        setLoading(false);
        return;
      }
      setProfileLoading(true);
      setWaterLoading(true);
      const [profileResult, waterResult, checkinsResult, weightsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentSession.user.id).maybeSingle(),
        loadWaterForUser(currentSession.user.id),
        loadWorkoutCheckins(currentSession.user.id),
        loadWeightHistory(currentSession.user.id),
      ]);
      if (!active) return;
      setProfile(profileResult.data as Profile | null);
      setWaterTotalMl(waterResult);
      setWorkoutCheckinDates(checkinsResult);
      setWeightHistory(weightsResult);
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
    session, profile, loading, profileLoading, waterTotalMl, waterLoading, workoutCheckinDates, weightHistory,
    refreshProfile, refreshWater, addWater, setWaterGoal, refreshWorkoutCheckins, addWorkoutCheckin, addWeighIn, saveProfile,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [session, profile, loading, profileLoading, waterTotalMl, waterLoading, workoutCheckinDates, weightHistory]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return value;
}

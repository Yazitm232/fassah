import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Space {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  best_times?: string;
  qibla_notes?: string;
  photo_url?: string;
  last_checkin?: string;
  created_at: string;
  verified: boolean;
}

// --- Session / Points ---

const ADJECTIVES = ['Silent','Blessed','Humble','Gentle','Serene','Faithful','Gracious','Radiant','Sincere','Peaceful'];
const NOUNS = ['Lion','River','Star','Falcon','Mountain','Garden','Lantern','Pearl','Cedar','Dawn'];

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}_${num}`;
}

export async function getOrCreateSession(): Promise<{ sessionId: string; username: string; points: number }> {
  let sessionId = localStorage.getItem('fassah_session_id');
  let username = localStorage.getItem('fassah_username');

  if (!sessionId || !username) {
    sessionId = crypto.randomUUID();
    username = generateUsername();
    localStorage.setItem('fassah_session_id', sessionId);
    localStorage.setItem('fassah_username', username);

    await supabase.from('user_sessions').insert({
      session_id: sessionId,
      username,
      points: 0,
    });
  }

  const { data } = await supabase
    .from('user_sessions')
    .select('points')
    .eq('session_id', sessionId)
    .single();

  return { sessionId, username, points: data?.points ?? 0 };
}

export async function addPoints(sessionId: string, amount: number): Promise<void> {
  const { data } = await supabase
    .from('user_sessions')
    .select('points')
    .eq('session_id', sessionId)
    .single();

  const current = data?.points ?? 0;
  await supabase
    .from('user_sessions')
    .update({ points: current + amount })
    .eq('session_id', sessionId);
}

export async function fetchLeaderboard(): Promise<{ username: string; points: number }[]> {
  const { data } = await supabase
    .from('user_sessions')
    .select('username, points')
    .order('points', { ascending: false })
    .limit(10);
  return data ?? [];
}

// --- Spaces ---

export async function fetchVerifiedSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function checkInToSpace(
  spaceId: string,
  sessionId: string,
  answers: { is_open: boolean; is_busy: boolean; wudu_available: boolean }
): Promise<boolean> {
  const { error: checkinError } = await supabase.from('checkins').insert({
    space_id: spaceId,
    session_id: sessionId,
    is_open: answers.is_open,
    is_busy: answers.is_busy,
    wudu_available: answers.wudu_available,
  });

  await supabase
    .from('spaces')
    .update({ last_checkin: new Date().toISOString() })
    .eq('id', spaceId);

  return !checkinError;
}

export async function fetchRecentCheckins(spaceId: string) {
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('space_id', spaceId)
    .order('checked_in_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

export async function submitSpace(spaceData: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  best_times?: string;
  qibla_notes?: string;
  photo_url?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('spaces').insert({
    ...spaceData,
    verified: false,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

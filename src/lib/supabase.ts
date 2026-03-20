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
  best_times: string;
  qibla_notes: string;
  photo_url: string | null;
  last_checkin: string | null;
  created_at: string;
  verified: boolean;
}

export async function fetchVerifiedSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching spaces:', error);
    return [];
  }

  return data || [];
}

export async function checkInToSpace(spaceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('spaces')
    .update({ last_checkin: new Date().toISOString() })
    .eq('id', spaceId);

  if (error) {
    console.error('Error checking in:', error);
    return false;
  }

  return true;
}

export async function submitSpace(spaceData: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  best_times: string;
  qibla_notes: string;
  photo_url?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('spaces')
    .insert([{ ...spaceData, verified: false }]);

  if (error) {
    console.error('Error submitting space:', error);
    return false;
  }

  return true;
}

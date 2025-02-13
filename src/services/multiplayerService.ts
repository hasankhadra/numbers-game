import { supabase } from '@/lib/supabase';

export async function createPlayer(sessionId: string, name: string | null = null) {
  const { data: player, error } = await supabase
    .from('multiplayer_players')
    .insert([{ session_id: sessionId, name }])
    .select()
    .single();

  sessionStorage.setItem('sessionId', sessionId);
  if (error) throw error;
  return player;
}

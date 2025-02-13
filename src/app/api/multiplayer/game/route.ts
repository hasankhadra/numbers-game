import { supabase } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const { data: game, error } = await supabase
      .from('multiplayer_games')
      .select(`
        id,
        game_status,
        current_turn,
        player1:player1_id(id, name),
        player2:player2_id(id, name),
        winner_id
      `)
      .eq('id', gameId)
      .single();

    if (error) throw error;

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
} 
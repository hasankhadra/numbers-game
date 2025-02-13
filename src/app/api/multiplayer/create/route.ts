import { supabase } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { playerId, playerSecret } = await request.json();

    const { data: gameData, error: gameError } = await supabase
      .from('multiplayer_games')
      .insert([
        {
          current_turn: playerId,
          player1_id: playerId,
          player1_secret: playerSecret,
          game_status: 'waiting',
        },
      ])
      .select('id, game_status, created_at')
      .single();

    if (gameError) throw gameError;

    return NextResponse.json({ game: gameData });
  } catch (error) {
    console.error('Error creating multiplayer game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
} 
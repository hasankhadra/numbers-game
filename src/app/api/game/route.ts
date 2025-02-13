import { supabase } from '../../../lib/supabase-admin';
import { NextResponse } from 'next/server';
import { generateSecretNumber } from '@/utils/gameLogic';

export async function POST() {
  try {
    const userId = Math.random().toString(36).substring(7);
    const aiSecret = generateSecretNumber();

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([
        {
          user_id: userId,
          user_secret: '0000',
          ai_secret: aiSecret,
          current_turn: 'user',
        },
      ])
      .select('id, current_turn, game_status, created_at')
      .single();

    if (gameError) throw gameError;

    return NextResponse.json({ 
      game: gameData,
      userId 
    });
  } catch (err) {
    console.error('Error creating game:', err);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
} 
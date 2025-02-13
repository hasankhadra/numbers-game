import { supabase } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const playerId = searchParams.get('playerId');
    const sessionId = searchParams.get('sessionId');

    if (!gameId || !playerId || !sessionId) {
      return NextResponse.json({ error: 'Game ID, Player ID and Session ID are required' }, { status: 400 });
    }

    // First verify the session
    const { data: player } = await supabase
      .from('multiplayer_players')
      .select('id')
      .eq('id', playerId)
      .eq('session_id', sessionId)
      .single();

    if (!player) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Then fetch the secret
    const { data: game } = await supabase
      .from('multiplayer_games')
      .select('player1_id, player2_id, player1_secret, player2_secret')
      .eq('id', gameId)
      .single();

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const secret = game.player1_id === playerId ? game.player1_secret : game.player2_secret;

    return NextResponse.json({ secret });
  } catch (error) {
    console.error('Error fetching secret:', error);
    return NextResponse.json({ error: 'Failed to fetch secret' }, { status: 500 });
  }
} 
import { supabase } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const { data: game } = await supabase
      .from('multiplayer_games')
      .select(`
        id,
        game_status,
        player1:player1_id(id, name),
        player2:player2_id(id, name),
        player1_secret,
        player2_secret,
        winner_id
      `)
      .eq('id', gameId)
      .eq('game_status', 'completed')
      .single();

    if (!game) {
      return NextResponse.json({ error: 'Completed game not found' }, { status: 404 });
    }

    return NextResponse.json({
      winner: {
        id: game.winner_id,
        name: game.winner_id === game.player1.id ? game.player1.name : game.player2.name
      },
      playerSecrets: {
        player1Secret: game.player1_secret,
        player2Secret: game.player2_secret,
        player1Name: game.player1.name,
        player2Name: game.player2.name
      }
    });
  } catch (error) {
    console.error('Error fetching game over details:', error);
    return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
} 
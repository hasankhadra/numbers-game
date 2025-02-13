import { supabase } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';
import { evaluateGuess } from '@/utils/gameLogic';

export async function POST(request: Request) {
  try {
    const { gameId, playerId, guess } = await request.json();

    // Get game data with opponent's secret
    const { data: game } = await supabase
      .from('multiplayer_games')
      .select('player1_id, player2_id, player1_secret, player2_secret')
      .eq('id', gameId)
      .single();

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Determine if player is player1 or player2 and get opponent's secret
    const isPlayer1 = game.player1_id === playerId;
    const targetSecret = isPlayer1 ? game.player2_secret : game.player1_secret;

    // Evaluate guess against opponent's secret
    const { exactMatches, partialMatches } = evaluateGuess(guess, targetSecret);

    // Save the guess
    const { data: guessData, error: guessError } = await supabase
      .from('multiplayer_guesses')
      .insert([
        {
          game_id: gameId,
          player_id: playerId,
          number: guess,
          exact_matches: exactMatches,
          partial_matches: partialMatches,
        },
      ])
      .select('id, number, exact_matches, partial_matches, created_at')
      .single();

    if (guessError) throw guessError;

    // Check if game is won
    const gameStatus = exactMatches === 4 ? 'completed' : 'active';
    if (gameStatus === 'completed') {
      await supabase
        .from('multiplayer_games')
        .update({ game_status: 'completed', winner_id: playerId })
        .eq('id', gameId);
    }
    await supabase
      .from('multiplayer_games')
      .update({
        current_turn: isPlayer1 ? game.player2_id : game.player1_id,
      })
      .eq('id', gameId)
      .single();

    return NextResponse.json({
      guess: guessData,
      gameStatus,
      winner: gameStatus === 'completed' ? playerId : null
    });

  } catch (error) {
    console.error('Error processing multiplayer guess:', error);
    return NextResponse.json({ error: 'Failed to process guess' }, { status: 500 });
  }
} 
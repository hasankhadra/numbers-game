import { supabase } from '@/lib/supabase';
import { evaluateGuess } from '@/utils/gameLogic';

export async function createPlayer(sessionId: string, name: string | null = null) {
  const { data: player, error } = await supabase
    .from('multiplayer_players')
    .insert([{ session_id: sessionId, name }])
    .select()
    .single();

  if (error) throw error;
  return player;
}

export async function createGame(player1Id: string, player1Secret: string) {
  const { data: game, error } = await supabase
    .from('multiplayer_games')
    .insert([{
      player1_id: player1Id,
      player1_secret: player1Secret,
      current_turn: player1Id,
      game_status: 'waiting'
    }])
    .select()
    .single();

  if (error) throw error;
  return game;
}

export async function joinGame(gameId: string, player2Id: string, player2Secret: string) {
  const { data: game, error } = await supabase
    .from('multiplayer_games')
    .update({
      player2_id: player2Id,
      player2_secret: player2Secret,
      game_status: 'active'
    })
    .eq('id', gameId)
    .eq('game_status', 'waiting')
    .select()
    .single();

  if (error) throw error;
  return game;
}

export async function makeGuess(
  gameId: string,
  playerId: string,
  guess: string,
  opponentSecret: string
) {
  const { exactMatches, partialMatches } = evaluateGuess(guess, opponentSecret);

  const { data: guessData, error: guessError } = await supabase
    .from('multiplayer_guesses')
    .insert([{
      game_id: gameId,
      player_id: playerId,
      number: guess,
      exact_matches: exactMatches,
      partial_matches: partialMatches
    }])
    .select()
    .single();

  if (guessError) throw guessError;

  // Update game state if someone won
  if (exactMatches === 4) {
    await supabase
      .from('multiplayer_games')
      .update({
        game_status: 'completed',
        current_turn: null
      })
      .eq('id', gameId);
  } else {
    // Switch turns
    const { data: game } = await supabase
      .from('multiplayer_games')
      .select('player1_id, player2_id, current_turn')
      .eq('id', gameId)
      .single();

    if (game) {
      const nextTurn = game.current_turn === game.player1_id 
        ? game.player2_id 
        : game.player1_id;

      await supabase
        .from('multiplayer_games')
        .update({ current_turn: nextTurn })
        .eq('id', gameId);
    }
  }

  return guessData;
} 
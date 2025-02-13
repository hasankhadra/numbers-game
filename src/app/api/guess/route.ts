import { supabase } from '../../../lib/supabase-admin';
import { NextResponse } from 'next/server';
import { evaluateGuess } from '@/utils/gameLogic';
import { generateNextGuess } from '@/utils/bruteForceGuesser';

export async function POST(request: Request) {
  try {
    const { gameId, guessNumber, userSecret, isAIGuess } = await request.json();

    // Get game data
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (isAIGuess) {
      // AI's turn
      const { data: previousGuesses } = await supabase
        .from('guesses')
        .select('number, exact_matches, partial_matches')
        .eq('game_id', gameId)
        .eq('player', 'ai');

      const aiGuess = generateNextGuess(previousGuesses || []);
      const aiGuessResult = evaluateGuess(aiGuess, userSecret);

      const { data: aiGuessData, error: aiGuessError } = await supabase
        .from('guesses')
        .insert([
          {
            game_id: gameId,
            number: aiGuess,
            exact_matches: aiGuessResult.exactMatches,
            partial_matches: aiGuessResult.partialMatches,
            player: 'ai',
          },
        ])
        .select('id, number, exact_matches, partial_matches, player, created_at')
        .single();

      if (aiGuessError) throw aiGuessError;

      const gameStatus = aiGuessResult.exactMatches === 4 ? 'completed' : 'active';
      await supabase
        .from('games')
        .update({ 
          game_status: gameStatus,
          current_turn: gameStatus === 'completed' ? null : 'user'
        })
        .eq('id', gameId);

      return NextResponse.json({
        guess: aiGuessData,
        gameStatus,
        winner: gameStatus === 'completed' ? 'ai' : null,
        aiSecret: gameStatus === 'completed' ? game.ai_secret : null
      });

    } else {
      // User's turn
      const { exactMatches, partialMatches } = evaluateGuess(guessNumber, game.ai_secret);

      const { data: guessData, error: guessError } = await supabase
        .from('guesses')
        .insert([
          {
            game_id: gameId,
            number: guessNumber,
            exact_matches: exactMatches,
            partial_matches: partialMatches,
            player: 'user',
          },
        ])
        .select('id, number, exact_matches, partial_matches, player, created_at')
        .single();

      if (guessError) throw guessError;

      const gameStatus = exactMatches === 4 ? 'completed' : 'active';
      await supabase
        .from('games')
        .update({ 
          game_status: gameStatus,
          current_turn: gameStatus === 'completed' ? null : 'ai'
        })
        .eq('id', gameId);

      return NextResponse.json({
        guess: guessData,
        gameStatus,
        winner: gameStatus === 'completed' ? 'user' : null,
        aiSecret: gameStatus === 'completed' ? game.ai_secret : null
      });
    }
  } catch (error) {
    console.error('Error processing guess:', error);
    return NextResponse.json({ error: 'Failed to process guess' }, { status: 500 });
  }
} 
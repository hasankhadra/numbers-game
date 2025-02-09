'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import GameBoard from '../components/GameBoard';
import GuessHistory from '../components/GuessHistory';
import GameModeSelector from '../components/GameModeSelector';
import GameSetup from '../components/GameSetup';
import GameLayout from '../components/GameLayout';
import { generateSecretNumber, evaluateGuess, isValidGuess } from '../utils/gameLogic';
import { Game, Guess } from '../types/database';
import { generateNextGuess } from '../utils/bruteForceGuesser';

type GameMode = 'ai' | 'computer' | 'practice' | 'multiplayer';

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [userSecret, setUserSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  useEffect(() => {
    console.log(game);
  }, [game])

  const startNewGame = async () => {
    if (gameMode !== 'practice' && (!userSecret || !isValidGuess(userSecret))) {
      alert('Please enter a valid 4-digit secret number');
      return;
    }

    setIsLoading(true);
    const aiSecret = generateSecretNumber();
    const userId = Math.random().toString(36).substring(7);

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([
        {
          user_id: userId,
          user_secret: '0000', // Dummy number since we don't need it for practice mode
          ai_secret: aiSecret,
          current_turn: 'user',
        },
      ])
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      setIsLoading(false);
      return;
    }

    setGame(gameData);
    setGuesses([]);
    setWinner(null);
    setIsLoading(false);
  };

  const resetGame = () => {
    setWinner(null);
    setGame(null);
    setGuesses([]);
    setUserSecret('');
    setIsLoading(false);
    setGameMode(null);
  };

  const makeAIGuess = async () => {
    if (gameMode === 'ai') {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          previousGuesses: guesses.filter(g => g.player === 'ai').map(g => ({
            number: g.number,
            exact_matches: g.exact_matches,
            partial_matches: g.partial_matches
          }))
        }),
      });

      const aiResponse = await response.json();
      return aiResponse.choices[0].message.content.trim();
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateNextGuess(
        guesses.filter(g => g.player === 'ai')
      );
    }
  };

  const makeGuess = async (guessNumber: string) => {
    if (!game || game.current_turn !== 'user') return;

    // Evaluate user's guess
    const { exactMatches, partialMatches } = evaluateGuess(guessNumber, game.ai_secret);

    // Save user's guess
    const { data: guessData, error: guessError } = await supabase
      .from('guesses')
      .insert([
        {
          game_id: game.id,
          number: guessNumber,
          exact_matches: exactMatches,
          partial_matches: partialMatches,
          player: 'user',
        },
      ])
      .select()
      .single();

    if (guessError) {
      console.error('Error saving guess:', guessError);
      return;
    }

    setGuesses((prev) => [...prev, guessData]);

    // Check if user won
    if (exactMatches === 4) {
      await supabase
        .from('games')
        .update({ game_status: 'completed' })
        .eq('id', game.id);
      setGame({ ...game, game_status: 'completed' });
      setWinner('user');
      return;
    }

    // Skip AI turn in practice mode
    if (gameMode === 'practice') {
      // Set turn back to user immediately
      setGame(prev => prev ? { ...prev, current_turn: 'user' } : null);
      return;
    }

    // AI's turn (only for non-practice modes)
    const aiGuess = await makeAIGuess();
    
    // Make sure we're using the correct user secret for evaluation
    const aiGuessResult = evaluateGuess(aiGuess, userSecret);

    // Log for debugging
    console.log('AI Guess:', aiGuess);
    console.log('User Secret:', userSecret);
    console.log('Result:', aiGuessResult);

    // Save AI's guess
    const { data: aiGuessData } = await supabase
      .from('guesses')
      .insert([
        {
          game_id: game.id,
          number: aiGuess,
          exact_matches: aiGuessResult.exactMatches,
          partial_matches: aiGuessResult.partialMatches,
          player: 'ai',
        },
      ])
      .select()
      .single();

    setGuesses((prev) => [...prev, aiGuessData]);

    // Check if AI won
    if (aiGuessResult.exactMatches === 4) {
      await supabase
        .from('games')
        .update({ game_status: 'completed' })
        .eq('id', game.id);
      setGame({ ...game, game_status: 'completed' });
      setWinner('ai');
    } else {
      // Set turn back to user if game continues
      setGame(prev => prev ? { ...prev, current_turn: 'user' } : null);
    }
  };

  return (
    <GameLayout>
      {!gameMode ? (
        <GameModeSelector onSelectMode={setGameMode} />
      ) : !game ? (
        <GameSetup 
          isPracticeMode={gameMode === 'practice'}
          userSecret={userSecret}
          onUserSecretChange={setUserSecret}
          onStartGame={startNewGame}
          isLoading={isLoading}
          isValidSecret={isValidGuess}
        />
      ) : (
        <div className="space-y-8">
          <GameBoard
            onMakeGuess={makeGuess}
            isUserTurn={true}
            gameStatus={game.game_status}
            winner={winner}
            aiSecret={winner === 'user' ? undefined : game.ai_secret}
            onNewGame={resetGame}
            userSecret={gameMode === 'practice' ? game.ai_secret : userSecret}
            isPracticeMode={gameMode === 'practice'}
          />

          <div className={gameMode === 'practice' ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
            <GuessHistory 
              guesses={guesses.filter(g => g.player === 'user')}
              title="Your Guesses"
              description="Your attempts to guess the number"
            />
            {gameMode !== 'practice' && (
              <GuessHistory 
                guesses={guesses.filter(g => g.player === 'ai')}
                title="AI's Guesses"
                description="AI&apos;s attempts to guess your number"
              />
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
} 
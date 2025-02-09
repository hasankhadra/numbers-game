'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import GameBoard from '../components/GameBoard';
import GuessHistory from '../components/GuessHistory';
import { generateSecretNumber, evaluateGuess, isValidGuess } from '../utils/gameLogic';
import { Game, Guess } from '../types/database';
import GameStatus from '../components/GameStatus';
import { generateNextGuess } from '../utils/bruteForceGuesser';

type Opponent = 'ai' | 'computer';

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [userSecret, setUserSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);

  useEffect(() => {
    console.log(game);
  }, [game])

  const startNewGame = async () => {
    if (!userSecret || !isValidGuess(userSecret)) {
      alert('Please enter a valid 4-digit secret number');
      return;
    }

    setIsLoading(true);
    const aiSecret = generateSecretNumber();
    const userId = Math.random().toString(36).substring(7); // Simple random ID for demo

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([
        {
          user_id: userId,
          user_secret: userSecret,
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
    setOpponent(null);
  };

  const makeAIGuess = async () => {
    if (opponent === 'ai') {
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

    // Update turn immediately for better UX
    setGame(prev => prev ? { ...prev, current_turn: 'ai' } : null);

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
      // Revert turn if there was an error
      setGame(prev => prev ? { ...prev, current_turn: 'user' } : null);
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

    // AI's turn
    const aiGuess = await makeAIGuess();

    // Evaluate AI's guess
    const aiGuessResult = evaluateGuess(aiGuess, game.user_secret);

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
    <main className="min-h-screen animated-background p-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          Numbers Game
        </h1>
        <p className="text-center text-blue-200 mb-4">
          Each player chooses a secret 4-digit number (all digits must be different).
          Take turns guessing each other&apos;s number. After each guess, you&apos;ll learn:
        </p>
        <div className="text-center text-blue-200 mb-8 space-y-1">
          <p>• How many digits are in the correct position (Exact matches)</p>
          <p>• How many digits exist in the number but in wrong positions (Partial matches)</p>
        </div>
        
        {!opponent ? (
          <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-blue-100 mb-4">
              Choose Your Opponent
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setOpponent('ai')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              >
                Play Against AI
                <p className="text-sm opacity-80 mt-1">Strategic opponent that learns from feedback</p>
              </button>
              <button
                onClick={() => setOpponent('computer')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              >
                Play Against Computer
                <p className="text-sm opacity-80 mt-1">Systematic opponent that tries all possibilities</p>
              </button>
            </div>
          </div>
        ) : !game ? (
          <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-blue-100 mb-4">
              Start New Game
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="secret" className="block text-sm font-medium text-blue-200 mb-1">
                  Your Secret Number
                </label>
                <input
                  id="secret"
                  type="text"
                  value={userSecret}
                  onChange={(e) => setUserSecret(e.target.value)}
                  maxLength={4}
                  placeholder="Enter your secret 4-digit number"
                  className="w-full p-3 border-2 border-blue-500/30 rounded-lg bg-blue-950/30 text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
                />
              </div>
              <button
                onClick={startNewGame}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Game...
                  </span>
                ) : (
                  'Start New Game'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <GameBoard
              onMakeGuess={makeGuess}
              isUserTurn={game.current_turn === 'user'}
              gameStatus={game.game_status}
              winner={winner}
              aiSecret={winner === 'user' ? undefined : game.ai_secret}
              onNewGame={resetGame}
              userSecret={userSecret}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GuessHistory 
                guesses={guesses.filter(g => g.player === 'user')}
                title="Your Guesses"
                description="Your attempts to guess AI's number"
              />
              <GuessHistory 
                guesses={guesses.filter(g => g.player === 'ai')}
                title="AI's Guesses"
                description="AI&apos;s attempts to guess your number"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
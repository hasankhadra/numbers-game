'use client';

import { useState } from 'react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { makeGuess } from '@/services/multiplayerService';
import NumberInput from './NumberInput';
import GuessHistory from './GuessHistory';
import { MultiplayerGameOver } from './MultiplayerGameOver';

interface MultiplayerGameBoardProps {
  gameId: string;
  playerId: string;
  onNewGame: () => void;
}

export function MultiplayerGameBoard({ gameId, playerId, onNewGame }: MultiplayerGameBoardProps) {
  const { game, guesses, opponent, isMyTurn } = useMultiplayerGame({ gameId, playerId });
  const [error, setError] = useState('');

  const handleGuess = async (guess: string) => {
    if (!game || !isMyTurn) return;

    try {
      setError('');
      const opponentSecret = game.player1_id === playerId ? game.player2_secret : game.player1_secret;
      await makeGuess(gameId, playerId, guess, opponentSecret);
    } catch (err) {
      setError('Failed to submit guess. Please try again.');
      console.error(err);
    }
  };

  if (!game) return null;

  const isWaiting = game.game_status === 'waiting';
  const isCompleted = game.game_status === 'completed';
  const myGuesses = guesses.filter(g => g.player_id === playerId);
  const opponentGuesses = guesses.filter(g => g.player_id !== playerId);

  const winner = isCompleted ? {
    playerId: myGuesses.some(g => g.exact_matches === 4) ? playerId : opponent?.id,
    name: myGuesses.some(g => g.exact_matches === 4) ? 'You' : opponent?.name
  } : null;

  return (
    <div className="space-y-8">
      <div className="game-card w-full max-w-md mx-auto p-6 rounded-xl shadow-lg">
        {isWaiting ? (
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold text-blue-200 mb-4">Waiting for Opponent</h3>
            <p className="text-blue-300/80 mb-4">Share this game ID with your friend:</p>
            <div className="bg-blue-900/30 p-3 rounded-lg font-mono text-lg text-blue-200 mb-4">
              {gameId}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/multiplayer/${gameId}`)}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              Copy Game ID
            </button>
          </div>
        ) : (
          <>
            <div className={`text-center p-3 rounded-lg mb-4 transition-all duration-300 ${
              isCompleted
                ? 'bg-purple-500 bg-opacity-20'
                : isMyTurn
                ? 'bg-emerald-500 bg-opacity-20 text-emerald-300 animate-glow'
                : 'bg-amber-500 bg-opacity-20 text-amber-300'
            }`}>
              {isCompleted ? (
                <div className="font-semibold text-purple-300">
                  Game Over - {myGuesses.some(g => g.exact_matches === 4) ? 'You Won!' : 'Opponent Won!'}
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {isMyTurn ? (
                    <>
                      <span>Your Turn</span>
                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Waiting for {opponent?.name || 'opponent'}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {!isCompleted && (
              <div className="space-y-4">
                <NumberInput 
                  onComplete={handleGuess}
                  disabled={!isMyTurn}
                  showSubmit={true}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!isWaiting && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GuessHistory 
            guesses={myGuesses}
            title="Your Guesses"
            description="Your attempts to guess the opponent's number"
            type="multiplayer"
          />
          <GuessHistory 
            guesses={opponentGuesses}
            title={`${opponent?.name || 'Opponent'}'s Guesses`}
            description="Opponent's attempts to guess your number"
          />
        </div>
      )}

      {isCompleted && winner && (
        <MultiplayerGameOver
          winner={winner}
          myPlayerId={playerId}
          playerSecrets={{
            player1Secret: game.player1_secret,
            player2Secret: game.player2_secret
          }}
          onNewGame={onNewGame}
        />
      )}
    </div>
  );
} 
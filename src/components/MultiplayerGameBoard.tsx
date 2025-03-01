'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import NumberInput from './NumberInput';
import GuessHistory from './GuessHistory';
import { MultiplayerGameOver } from './MultiplayerGameOver';
import { Toast } from './Toast';

interface MultiplayerGameBoardProps {
  gameId: string;
  playerId: string;
  onNewGame: () => void;
}

interface Winner {
  playerId: string | undefined;
  name?: string | null;
}

export function MultiplayerGameBoard({ gameId, playerId, onNewGame }: MultiplayerGameBoardProps) {
  const { game, guesses, opponent, isMyTurn, mySecret } = useMultiplayerGame({ gameId, playerId });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [gameOverDetails, setGameOverDetails] = useState<{
    player1Secret: string;
    player2Secret: string;
    player1Name: string | null;
    player2Name: string | null;
  } | null>(null);

  const handleGuess = async (guess: string) => {
    if (!game || !isMyTurn) return;

    try {
      setError('');
      const response = await fetch('/api/multiplayer/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, playerId, guess }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      if (data.gameStatus === 'completed') {
        const fetchGameOver = async () => {
          try {
            const response = await fetch(`/api/multiplayer/game-over?gameId=${gameId}`);
            const data = await response.json();
            
            if (response.ok) {
              setWinner(data.winner);
              setGameOverDetails(data.playerSecrets);
            }
          } catch (error) {
            console.error('Error fetching game over details:', error);
          }
        };
        
        fetchGameOver();
      }
    } catch (error) {
      console.error('Error making guess:', error);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/multiplayer/${gameId}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isWaiting = game?.game_status === 'waiting';
  const isCompleted = game?.game_status === 'completed';
  const myGuesses = guesses.filter(g => g.player_id === playerId);
  const opponentGuesses = guesses.filter(g => g.player_id !== playerId);

  useEffect(() => {
    if (!winner) {
      // Fetch final game details
      const fetchGameOver = async () => {
        try {
          const response = await fetch(`/api/multiplayer/game-over?gameId=${gameId}`);
          const data = await response.json();
          
          if (response.ok) {
            setWinner(data.winner);
            setGameOverDetails(data.playerSecrets);
          }
        } catch (error) {
          console.error('Error fetching game over details:', error);
        }
      };
      
      fetchGameOver();
    }
  }, [isCompleted, winner, gameId]);

  if (!game) return null;

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
              onClick={handleCopyLink}
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

            {!isWaiting && (
              <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-blue-900/20 border border-blue-500/10">
                <span className="text-sm text-blue-300">Your Number:</span>
                <div className="flex gap-1">
                  {mySecret?.split('').map((digit, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 flex items-center justify-center text-sm font-mono font-medium bg-blue-900/30 rounded text-blue-200"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
            isOpponentHistory={true}
          />
        </div>
      )}

      {winner && gameOverDetails && (
        <MultiplayerGameOver
          winner={winner}
          myPlayerId={playerId}
          playerSecrets={gameOverDetails}
          game={game}
          onNewGame={onNewGame}
        />
      )}
      {showToast && (
        <Toast 
          message="Link copied to clipboard!" 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
} 
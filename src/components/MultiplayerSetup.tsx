'use client';

import { useState } from 'react';
import { createPlayer } from '@/services/multiplayerService';
import { isValidGuess } from '@/utils/gameLogic';
import { MultiplayerGame } from '@/types/multiplayer';

interface MultiplayerSetupProps {
  onGameStart: (gameId: string, playerId: string) => void;
  initialGameId?: string;
  isJoining?: boolean;
}

export function MultiplayerSetup({ onGameStart, initialGameId, isJoining }: MultiplayerSetupProps) {
  const [mode, setMode] = useState<'create' | 'join' | null>(isJoining ? 'join' : null);
  const [gameId, setGameId] = useState(initialGameId || '');
  const [playerName, setPlayerName] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [joinState, setJoinState] = useState<boolean>(false);

  const handleCreateGame = async () => {
    if (!isValidGuess(secretNumber)) {
      setError('Please enter a valid 4-digit number with unique digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const sessionId = Math.random().toString(36).substring(7);
      const player = await createPlayer(sessionId, playerName);
      sessionStorage.setItem('playerId', player.id);
      await createGame(player.id, secretNumber);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!isValidGuess(secretNumber)) {
      setError('Please enter a valid 4-digit number with unique digits');
      return;
    }

    setIsLoading(true);
    setJoinState(true);
    setError('');

    try {
      const sessionId = Math.random().toString(36).substring(7);
      const player = await createPlayer(sessionId, playerName);
      await joinGame(gameId, player.id, secretNumber);
    } catch (err) {
      setError('Failed to join game. Please check the game ID and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setJoinState(false);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/multiplayer/${gameId}`;
    await navigator.clipboard.writeText(shareUrl);
    // Optionally show a toast/notification that the link was copied
  };

  const WaitingState = () => (
    <div className="text-center p-6">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">Waiting for Opponent</h3>
      <p className="text-blue-300/80 mb-4">Share this link with your friend:</p>
      <div className="bg-blue-900/30 p-3 rounded-lg font-mono text-sm text-blue-200 mb-4 break-all">
        {`${window.location.origin}/multiplayer/${gameId}`}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
        >
          Copy Link
        </button>
        <button
          onClick={() => navigator.share?.({
            title: 'Join my Numbers Game',
            text: 'Join me for a game of Numbers!',
            url: `${window.location.origin}/multiplayer/${gameId}`
          }).catch(() => {})}
          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
        >
          Share
        </button>
      </div>
    </div>
  );

  const createGame = async (playerId: string, secret: string) => {
    try {
      const response = await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, playerSecret: secret }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setGame(data.game);
      onGameStart(data.game.id, playerId);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const joinGame = async (gameId: string, playerId: string, secret: string) => {
    try {
      const response = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, playerId, playerSecret: secret }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setGame(data.game);
      onGameStart(data.game.id, playerId);
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-200">{joinState ? 'Joining game...' : 'Creating your game...'}</p>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-blue-100 mb-4">
          Multiplayer Game
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Create New Game
            <p className="text-sm opacity-80 mt-1">Start a new game and invite a friend</p>
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Join Game
            <p className="text-sm opacity-80 mt-1">Join an existing game with a game ID</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
      {mode === 'create' && game?.game_status === 'waiting' ? (
        <WaitingState />
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-blue-100 mb-4">
            {mode === 'create' ? 'Create New Game' : 'Join Game'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border-2 border-blue-500/30 rounded-lg bg-blue-950/30 text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
              />
            </div>
            {mode === 'join' && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Game ID
                </label>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Enter game ID"
                  className="w-full p-3 border-2 border-blue-500/30 rounded-lg bg-blue-950/30 text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Your Secret Number
              </label>
              <input
                type="text"
                value={secretNumber}
                onChange={(e) => setSecretNumber(e.target.value)}
                maxLength={4}
                placeholder="Enter your secret 4-digit number"
                className="w-full p-3 border-2 border-blue-500/30 rounded-lg bg-blue-950/30 text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setMode(null)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
              >
                Back
              </button>
              <button
                onClick={mode === 'create' ? handleCreateGame : handleJoinGame}
                disabled={isLoading || !secretNumber || (mode === 'join' && !gameId)}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Loading...' : mode === 'create' ? 'Create Game' : 'Join Game'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
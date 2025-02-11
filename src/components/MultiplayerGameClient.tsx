'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MultiplayerSetup } from './MultiplayerSetup';
import { MultiplayerGameBoard } from './MultiplayerGameBoard';
import GameLayout from './GameLayout';

interface MultiplayerState {
  gameId: string;
  playerId: string;
}

interface MultiplayerGameClientProps {
  gameId: string;
  isCreator: boolean;
}

export default function MultiplayerGameClient({ gameId, isCreator }: MultiplayerGameClientProps) {
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState | null>(
    // If creator, initialize with the state from URL
    isCreator ? { gameId, playerId: sessionStorage.getItem('playerId') || '' } : null
  );
  const router = useRouter();

  useEffect(() => {
    if (isCreator) {
      // Store playerId in session storage when creating game
      const playerId = sessionStorage.getItem('playerId');
      if (playerId) {
        setMultiplayerState({ gameId, playerId });
      }
    }
  }, [isCreator, gameId]);

  const handleGameStart = (gameId: string, playerId: string) => {
    sessionStorage.setItem('playerId', playerId);
    setMultiplayerState({ gameId, playerId });
  };

  const handleNewGame = () => {
    router.push('/');
  };

  return (
    <GameLayout>
      {!multiplayerState ? (
        <MultiplayerSetup 
          onGameStart={handleGameStart} 
          initialGameId={gameId}
          isJoining={true}
        />
      ) : (
        <MultiplayerGameBoard
          gameId={multiplayerState.gameId}
          playerId={multiplayerState.playerId}
          onNewGame={handleNewGame}
        />
      )}
    </GameLayout>
  );
} 
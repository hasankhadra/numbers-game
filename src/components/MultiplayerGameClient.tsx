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
}

export default function MultiplayerGameClient({ gameId }: MultiplayerGameClientProps) {
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const playerId = sessionStorage.getItem('playerId');
      if (playerId) {
        setMultiplayerState({ gameId, playerId });
      }
    }
  }, [gameId]);

  const handleGameStart = (gameId: string, playerId: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('playerId', playerId);
    }
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
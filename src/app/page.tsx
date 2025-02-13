'use client';

import { useState } from 'react';
import GameBoard from '../components/GameBoard';
import GuessHistory from '../components/GuessHistory';
import GameModeSelector from '../components/GameModeSelector';
import GameSetup from '../components/GameSetup';
import GameLayout from '../components/GameLayout';
import { isValidGuess } from '../utils/gameLogic';
import { Game, Guess } from '../types/database';
import { MultiplayerSetup } from '@/components/MultiplayerSetup';
import { MultiplayerGameBoard } from '@/components/MultiplayerGameBoard';
import { useRouter } from 'next/navigation';

type GameMode = 'ai' | 'computer' | 'practice' | 'multiplayer';

interface MultiplayerState {
  gameId: string;
  playerId: string;
}

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [userSecret, setUserSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState | null>(null);
  const router = useRouter();

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    // Reset states when changing mode
    setGame(null);
    setGuesses([]);
    setUserSecret('');
    setWinner(null);
    setMultiplayerState(null);
  };

  const handleMultiplayerStart = async (gameId: string, playerId: string) => {
    if (gameMode === 'multiplayer') {
      // Set the state before navigation to preserve the game creator's session
      setMultiplayerState({ gameId, playerId });
      router.push(`/multiplayer/${gameId}?creator=true`);
    }
  };

  const startNewGame = async () => {
    if (gameMode !== 'practice' && (!userSecret || !isValidGuess(userSecret))) {
      alert('Please enter a valid 4-digit secret number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setGame(data.game);
      setGuesses([]);
      setWinner(null);
    } catch (error) {
      console.error('Error creating game:', error);
    }
    setIsLoading(false);
  };

  const resetGame = () => {
    setGameMode(null);
    setGame(null);
    setGuesses([]);
    setUserSecret('');
    setWinner(null);
    setMultiplayerState(null);
    setIsLoading(false);
  };

  const makeGuess = async (guessNumber: string) => {
    if (!game || game.current_turn !== 'user') return;

    try {
      // Make user's guess
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          guessNumber,
          userSecret,
          isAIGuess: false
        }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setGuesses(prev => [...prev, data.guess]);
      
      if (data.gameStatus === 'completed') {
        setGame(prev => prev ? { ...prev, game_status: 'completed' } : null);
        setWinner(data.winner);
        return;
      }

      // Skip AI turn in practice mode
      if (gameMode === 'practice') {
        setGame(prev => prev ? { ...prev, current_turn: 'user' } : null);
        return;
      }

      // Make AI's guess
      const aiResponse = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          userSecret,
          isAIGuess: true
        }),
      });
      const aiData = await aiResponse.json();
      
      if (!aiResponse.ok) throw new Error(aiData.error);

      setGuesses(prev => [...prev, aiData.guess]);
      
      if (aiData.gameStatus === 'completed') {
        setGame(prev => prev ? { ...prev, game_status: 'completed' } : null);
        setWinner(aiData.winner);
      } else {
        setGame(prev => prev ? { ...prev, current_turn: 'user' } : null);
      }
    } catch (error) {
      console.error('Error making guess:', error);
    }
  };

  return (
    <GameLayout>
      {!gameMode ? (
        <GameModeSelector onSelectMode={handleGameModeSelect} />
      ) : gameMode === 'multiplayer' ? (
        !multiplayerState ? (
          <MultiplayerSetup onGameStart={handleMultiplayerStart} />
        ) : (
          <MultiplayerGameBoard
            gameId={multiplayerState.gameId}
            playerId={multiplayerState.playerId}
            onNewGame={resetGame}
          />
        )
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
            isUserTurn={game.current_turn === 'user'}
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
                isOpponentHistory={true}
              />
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
} 
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MultiplayerGame, MultiplayerGuess, MultiplayerPlayer } from '@/types/multiplayer';

interface UseMultiplayerGameProps {
  gameId?: string;
  playerId?: string;
}

export function useMultiplayerGame({ gameId, playerId }: UseMultiplayerGameProps) {
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [guesses, setGuesses] = useState<MultiplayerGuess[]>([]);
  const [opponent, setOpponent] = useState<MultiplayerPlayer | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!gameId || !playerId) return;

    // Subscribe to game changes
    const gameSubscription = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const updatedGame = payload.new as MultiplayerGame;
          setGame(updatedGame);
          setIsMyTurn(updatedGame.current_turn === playerId);
        }
      )
      .subscribe();

    // Subscribe to new guesses
    const guessesSubscription = supabase
      .channel(`guesses:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'multiplayer_guesses',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setGuesses((prev) => [...prev, payload.new as MultiplayerGuess]);
        }
      )
      .subscribe();

    // Load initial game state
    loadGameState();

    return () => {
      gameSubscription.unsubscribe();
      guessesSubscription.unsubscribe();
    };
  }, [gameId, playerId]);

  const loadGameState = async () => {
    if (!gameId || !playerId) return;

    // Fetch game with player details
    const { data: gameData } = await supabase
      .from('multiplayer_games')
      .select(`
        *,
        player1:player1_id(*),
        player2:player2_id(*)
      `)
      .eq('id', gameId)
      .single();

    if (gameData) {
      setGame(gameData);
      setIsMyTurn(gameData.current_turn === playerId);
      setOpponent(
        gameData.player1_id === playerId ? gameData.player2 : gameData.player1
      );
    }

    // Fetch guesses
    const { data: guessesData } = await supabase
      .from('multiplayer_guesses')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (guessesData) {
      setGuesses(guessesData);
    }
  };

  return {
    game,
    guesses,
    opponent,
    isMyTurn,
    refreshGame: loadGameState,
  };
} 
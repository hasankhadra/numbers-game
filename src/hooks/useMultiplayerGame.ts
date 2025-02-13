import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MultiplayerGame,
  MultiplayerGuess,
  MultiplayerPlayer,
} from "@/types/multiplayer";

interface UseMultiplayerGameProps {
  gameId?: string;
  playerId?: string;
}

export function useMultiplayerGame({
  gameId,
  playerId,
}: UseMultiplayerGameProps) {
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [guesses, setGuesses] = useState<MultiplayerGuess[]>([]);
  const [opponent, setOpponent] = useState<MultiplayerPlayer | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [mySecret, setMySecret] = useState<string | null>(null);

  const loadGameState = async () => {
    if (!gameId || !playerId) return;

    try {
      // Fetch game details
      const gameResponse = await fetch(
        `/api/multiplayer/game?gameId=${gameId}`
      );
      const gameData = await gameResponse.json();

      if (!gameResponse.ok) throw new Error(gameData.error);

      setGame(gameData.game);
      setIsMyTurn(gameData.game.current_turn === playerId);
      setOpponent(
        gameData.game.player1.id === playerId
          ? gameData.game.player2
          : gameData.game.player1
      );

      // Fetch player's secret with session authentication
      const sessionId = sessionStorage.getItem("sessionId");
      if (sessionId) {
        const secretResponse = await fetch(
          `/api/multiplayer/secret?gameId=${gameId}&playerId=${playerId}&sessionId=${sessionId}`
        );
        const secretData = await secretResponse.json();

        if (secretResponse.ok) {
          setMySecret(secretData.secret);
        }
      }

      // Fetch guesses
      const { data: guessesData } = await supabase
        .from("multiplayer_guesses")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });

      if (guessesData) {
        setGuesses(guessesData);
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }
  };

  useEffect(() => {
    if (!gameId || !playerId) return;

    const gameSubscription = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "multiplayer_games",
          filter: `id=eq.${gameId}`,
        },
        async () => {

          const gameResponse = await fetch(
            `/api/multiplayer/game?gameId=${gameId}`
          );
          const gameData = await gameResponse.json();
          const updatedGame = gameData.game as MultiplayerGame;

          setGame(updatedGame);
          setOpponent(updatedGame.player1.id === playerId ? updatedGame.player2 : updatedGame.player1);
          setIsMyTurn(updatedGame.current_turn === playerId);
        }
      )
      .subscribe();

    // Subscribe to new guesses
    const guessesSubscription = supabase
      .channel(`guesses:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "multiplayer_guesses",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setGuesses((prev) => [...prev, payload.new as MultiplayerGuess]);
        }
      )
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
      guessesSubscription.unsubscribe();
    };
  }, [gameId, playerId]);


  useEffect(() => {
    if (!gameId || !playerId || opponent) return;
    
    loadGameState();
  }, [gameId, playerId, opponent]);

  return {
    game,
    guesses,
    opponent,
    isMyTurn,
    mySecret,
    refreshGame: loadGameState,
  };
}

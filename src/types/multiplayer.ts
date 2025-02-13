export interface MultiplayerPlayer {
    id: string;
    name: string | null;
}

export interface MultiplayerGame {
    id: string;
    current_turn: string;
    game_status: 'waiting' | 'active' | 'completed';
    created_at: string;
    updated_at: string;
    player1: MultiplayerPlayer;
    player2: MultiplayerPlayer;
}

export interface MultiplayerGuess {
    id: string;
    game_id: string;
    player_id: string;
    number: string;
    exact_matches: number;
    partial_matches: number;
    created_at: string;
    player: string;
} 
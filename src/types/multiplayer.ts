export interface MultiplayerPlayer {
    id: string;
    session_id: string;
    name: string | null;
    created_at: string;
}

export interface MultiplayerGame {
    id: string;
    player1_id: string;
    player2_id: string;
    player1_secret: string;
    player2_secret: string;
    current_turn: string;
    game_status: 'waiting' | 'active' | 'completed';
    created_at: string;
    updated_at: string;
    // Join fields
    player1?: MultiplayerPlayer;
    player2?: MultiplayerPlayer;
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
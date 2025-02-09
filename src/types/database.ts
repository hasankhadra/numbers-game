export interface Game {
  id: string;
  user_id: string;
  user_secret: string;
  ai_secret: string;
  current_turn: 'user' | 'ai';
  created_at: string;
  game_status: 'active' | 'completed';
}

export interface Guess {
  id: string;
  game_id: string;
  number: string;
  exact_matches: number;
  partial_matches: number;
  player: 'user' | 'ai';
  created_at: string;
} 
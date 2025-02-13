alter table multiplayer_games
    add column winner_id uuid references multiplayer_players(id); 
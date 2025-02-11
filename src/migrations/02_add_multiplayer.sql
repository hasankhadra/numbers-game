-- Create players table for multiplayer
CREATE TABLE multiplayer_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create multiplayer games table
CREATE TABLE multiplayer_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player1_id UUID REFERENCES multiplayer_players(id),
    player2_id UUID REFERENCES multiplayer_players(id),
    player1_secret TEXT NOT NULL,
    player2_secret TEXT NOT NULL,
    current_turn UUID REFERENCES multiplayer_players(id),
    game_status TEXT CHECK (game_status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create multiplayer guesses table
CREATE TABLE multiplayer_guesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES multiplayer_games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES multiplayer_players(id),
    number TEXT NOT NULL,
    exact_matches INTEGER NOT NULL,
    partial_matches INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add timestamp update trigger
CREATE OR REPLACE FUNCTION update_multiplayer_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_multiplayer_games_updated_at
    BEFORE UPDATE ON multiplayer_games
    FOR EACH ROW
    EXECUTE FUNCTION update_multiplayer_updated_at_column();

-- Enable realtime for multiplayer tables
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_games;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_guesses;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_players;

-- Add cleanup function for multiplayer games
CREATE OR REPLACE FUNCTION delete_old_multiplayer_games() RETURNS void AS $$
BEGIN
    -- Delete waiting games older than 1 hour
    DELETE FROM multiplayer_games 
    WHERE game_status = 'waiting' 
    AND created_at < NOW() - INTERVAL '1 hour';

    -- Delete completed games older than 1 hour
    DELETE FROM multiplayer_games 
    WHERE game_status = 'completed' 
    AND created_at < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup
SELECT cron.schedule('5 * * * *', $$SELECT delete_old_multiplayer_games()$$); 
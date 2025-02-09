-- Create games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_secret TEXT NOT NULL,
    ai_secret TEXT NOT NULL,
    current_turn TEXT CHECK (current_turn IN ('user', 'ai')) DEFAULT 'user',
    game_status TEXT CHECK (game_status IN ('active', 'completed')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create guesses table
CREATE TABLE guesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    exact_matches INTEGER NOT NULL,
    partial_matches INTEGER NOT NULL,
    player TEXT CHECK (player IN ('user', 'ai')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create function to delete completed games after 1 hour
CREATE OR REPLACE FUNCTION delete_completed_games() RETURNS void AS $$
BEGIN
    -- First delete guesses for completed games
    DELETE FROM guesses 
    WHERE game_id IN (
        SELECT id FROM games 
        WHERE game_status = 'completed' 
        AND created_at < NOW() - INTERVAL '1 hour'
    );

    -- Then delete the completed games
    DELETE FROM games 
    WHERE game_status = 'completed' 
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Delete all existing cron jobs
SELECT cron.unschedule(jobid) 
FROM cron.job;

-- Then add your new schedule
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('0 * * * *', $$SELECT delete_completed_games()$$); 
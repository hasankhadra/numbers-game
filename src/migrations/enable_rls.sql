-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
CREATE POLICY "Enable insert for authenticated users" ON games
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id" ON games
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Enable update for users based on user_id" ON games
    FOR UPDATE TO public
    USING (true);

-- Create policies for guesses table
CREATE POLICY "Enable insert for authenticated users" ON guesses
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Enable select for users" ON guesses
    FOR SELECT TO public
    USING (true);

-- Grant necessary permissions
GRANT ALL ON games TO public;
GRANT ALL ON guesses TO public; 
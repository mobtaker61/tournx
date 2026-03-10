-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER NOT NULL,
  bracket_type TEXT NOT NULL CHECK (bracket_type IN ('main', 'loser')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rounds_bracket ON rounds(bracket_type, round_number);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  next_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  next_match_slot TEXT CHECK (next_match_slot IN ('player1', 'player2')),
  loser_next_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  loser_next_slot TEXT CHECK (loser_next_slot IN ('player1', 'player2')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON matches(winner_id);

-- Enable RLS (Row Level Security) - Admin only, disable for local dev or use service role
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all (admin panel - use service role key or add auth for production)
CREATE POLICY "Allow all" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON matches FOR ALL USING (true) WITH CHECK (true);

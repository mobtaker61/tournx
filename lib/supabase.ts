import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  name: string;
  created_at: string;
};

export type Round = {
  id: string;
  round_number: number;
  bracket_type: "main" | "loser";
  created_at: string;
};

export type Match = {
  id: string;
  round_id: string;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  next_match_id: string | null;
  next_match_slot: "player1" | "player2" | null;
  loser_next_match_id: string | null;
  loser_next_slot: "player1" | "player2" | null;
  created_at: string;
};

export type MatchWithPlayers = Match & {
  player1?: Player | null;
  player2?: Player | null;
  winner?: Player | null;
  round?: Round | null;
};

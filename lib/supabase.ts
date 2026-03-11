import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Lazy init: createClient فقط در اولین فراخوانی اجرا می‌شود.
 * در زمان build (بدون env) هیچ وقت صدا زده نمی‌شود → build crash نمی‌کند.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) {
    throw new Error(
      "Supabase پیکربندی نشده. متغیرهای NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY را در تنظیمات Cloudflare Pages تنظیم کنید."
    );
  }
  _client = createClient(url, key);
  return _client;
}

/** @deprecated از getSupabase() استفاده کنید. برای سازگاری با کد قبلی */
export const supabase = null as SupabaseClient | null;

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

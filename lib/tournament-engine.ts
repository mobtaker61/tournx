import { supabase } from "./supabase";
import type { Player, Round, Match } from "./supabase";

export async function generateFirstRound(): Promise<{ matches: Match[] }> {
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .order("created_at");

  if (playersError) throw new Error(playersError.message);
  if (!players || players.length < 2)
    throw new Error("حداقل ۲ بازیکن برای شروع تورنمنت لازم است");

  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ round_number: 1, bracket_type: "main" })
    .select()
    .single();

  if (roundError) throw new Error(roundError.message);
  if (!round) throw new Error("خطا در ایجاد راند");

  const matches: Match[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const player2 = shuffled[i + 1] ? shuffled[i + 1] : null;
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        round_id: round.id,
        player1_id: shuffled[i].id,
        player2_id: player2?.id ?? null,
      })
      .select()
      .single();

    if (matchError) throw new Error(matchError.message);
    if (match) matches.push(match);
  }

  return { matches };
}

export async function generateNextRound(): Promise<{ round: Round; matches: Match[] }> {
  const { data: lastRound } = await supabase
    .from("rounds")
    .select("*")
    .eq("bracket_type", "main")
    .order("round_number", { ascending: false })
    .limit(1)
    .single();

  if (!lastRound) throw new Error("ابتدا راند اول را ایجاد کنید");

  const { data: prevMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("round_id", lastRound.id)
    .order("id");

  const matchCount = Math.ceil((prevMatches ?? []).length / 2);
  if (matchCount < 1) throw new Error("راند قبل باید حداقل ۲ مسابقه داشته باشد");

  const nextRoundNum = lastRound.round_number + 1;
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ round_number: nextRoundNum, bracket_type: "main" })
    .select()
    .single();

  if (roundError) throw new Error(roundError.message);
  if (!round) throw new Error("خطا در ایجاد راند");

  const matches: Match[] = [];
  for (let i = 0; i < matchCount; i++) {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({ round_id: round.id })
      .select()
      .single();
    if (matchError) throw new Error(matchError.message);
    if (match) matches.push(match);
  }

  for (let i = 0; i < prevMatches!.length; i++) {
    const nextMatch = matches[Math.floor(i / 2)];
    if (!nextMatch) continue;
    const slot: "player1" | "player2" = i % 2 === 0 ? "player1" : "player2";
    await supabase
      .from("matches")
      .update({ next_match_id: nextMatch.id, next_match_slot: slot })
      .eq("id", prevMatches![i].id);
  }

  return { round, matches };
}

export async function generateLoserRound(): Promise<{ round: Round; matches: Match[] }> {
  const { data: lastLoserRound } = await supabase
    .from("rounds")
    .select("*")
    .eq("bracket_type", "loser")
    .order("round_number", { ascending: false })
    .limit(1)
    .single();

  const lastLoserNum = lastLoserRound?.round_number ?? 0;
  const feedMainRound = lastLoserNum + 1;

  const { data: mainRound } = await supabase
    .from("rounds")
    .select("id")
    .eq("bracket_type", "main")
    .eq("round_number", feedMainRound)
    .single();

  if (!mainRound) throw new Error(`راند اصلی #${feedMainRound} وجود ندارد. ابتدا آن را ایجاد کنید.`);

  const { data: mainMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("round_id", mainRound.id)
    .order("id");

  const matchIds = (mainMatches ?? []).map((m) => m.id);
  if (matchIds.length < 2) throw new Error("راند اصلی باید حداقل ۲ مسابقه داشته باشد.");

  const nextRoundNum = lastLoserNum + 1;
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ round_number: nextRoundNum, bracket_type: "loser" })
    .select()
    .single();

  if (roundError) throw new Error(roundError.message);
  if (!round) throw new Error("خطا در ایجاد راند بازنده‌ها");

  const matches: Match[] = [];
  const loserMatchCount = Math.ceil(matchIds.length / 2);

  for (let i = 0; i < loserMatchCount; i++) {
    const { data: match, error } = await supabase
      .from("matches")
      .insert({ round_id: round.id })
      .select()
      .single();
    if (!error && match) matches.push(match);
  }

  for (let i = 0; i < matchIds.length; i++) {
    const loserMatchIdx = Math.floor(i / 2);
    const loserMatch = matches[loserMatchIdx];
    if (!loserMatch) continue;
    const slot: "player1" | "player2" = i % 2 === 0 ? "player1" : "player2";
    await supabase
      .from("matches")
      .update({ loser_next_match_id: loserMatch.id, loser_next_slot: slot })
      .eq("id", matchIds[i]);
  }

  return { round, matches };
}

export async function recordMatchResult(
  matchId: string,
  winnerId: string
): Promise<void> {
  const { data: match, error: fetchErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (fetchErr || !match) throw new Error("مسابقه یافت نشد");

  const { error: updateErr } = await supabase
    .from("matches")
    .update({ winner_id: winnerId })
    .eq("id", matchId);

  if (updateErr) throw new Error(updateErr.message);

  if (match.next_match_id && match.next_match_slot) {
    await supabase
      .from("matches")
      .update({
        [match.next_match_slot === "player1" ? "player1_id" : "player2_id"]: winnerId,
      })
      .eq("id", match.next_match_id);
  }

  const loserId = [match.player1_id, match.player2_id].find((p) => p && p !== winnerId);
  if (match.loser_next_match_id && match.loser_next_slot && loserId) {
    await supabase
      .from("matches")
      .update({
        [match.loser_next_slot === "player1" ? "player1_id" : "player2_id"]: loserId,
      })
      .eq("id", match.loser_next_match_id);
  }
}

export async function checkTournamentWinner(): Promise<Player | null> {
  const { data: rounds } = await supabase
    .from("rounds")
    .select("id")
    .eq("bracket_type", "main")
    .order("round_number", { ascending: false });

  if (!rounds?.length) return null;

  const lastMainRoundId = rounds[0].id;
  const { data: matches } = await supabase
    .from("matches")
    .select("winner_id")
    .eq("round_id", lastMainRoundId);

  const withWinner = (matches ?? []).filter((m) => m.winner_id);
  if (withWinner.length !== 1) return null;

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", withWinner[0].winner_id)
    .single();

  return player;
}

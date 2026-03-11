"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RoundView } from "@/components/RoundView";
import { getSupabase } from "@/lib/supabase";
import type { MatchWithPlayers, Round } from "@/lib/supabase";

type Section = { round: Round; matches: MatchWithPlayers[] };

export default function RoundsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: rounds } = await sb
        .from("rounds")
        .select("*")
        .order("round_number");

      if (!rounds?.length) {
        setSections([]);
        setLoading(false);
        return;
      }

      const { data: matchData } = await sb
        .from("matches")
        .select("*, round:rounds(*)")
        .in("round_id", rounds.map((r) => r.id));

      const playerIds = new Set<string>();
      for (const m of matchData ?? []) {
        if ((m as { player1_id?: string }).player1_id) playerIds.add((m as { player1_id: string }).player1_id);
        if ((m as { player2_id?: string }).player2_id) playerIds.add((m as { player2_id: string }).player2_id);
        if ((m as { winner_id?: string }).winner_id) playerIds.add((m as { winner_id: string }).winner_id);
      }
      const { data: players } = await sb
        .from("players")
        .select("id, name")
        .in("id", [...playerIds]);
      const playerMap = new Map((players ?? []).map((p) => [p.id, p]));

      const byRound = new Map<string, MatchWithPlayers[]>();
      for (const m of matchData ?? []) {
        const r = (m as { round?: Round }).round;
        if (!r) continue;
        const enriched: MatchWithPlayers = {
          ...m,
          player1: (m as { player1_id?: string }).player1_id ? playerMap.get((m as { player1_id: string }).player1_id) : null,
          player2: (m as { player2_id?: string }).player2_id ? playerMap.get((m as { player2_id: string }).player2_id) : null,
          winner: (m as { winner_id?: string }).winner_id ? playerMap.get((m as { winner_id: string }).winner_id) : null,
          round: r,
        };
        const arr = byRound.get(r.id) ?? [];
        arr.push(enriched);
        byRound.set(r.id, arr);
      }

      const result: Section[] = rounds.map((r) => ({
        round: r,
        matches: (byRound.get(r.id) ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));

      setSections(result);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">راندها</h1>

      {loading ? (
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            هنوز راندی ایجاد نشده است. از داشبورد راند اول را ایجاد کنید.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sections.map((s) => (
            <Card key={s.round.id}>
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  {s.round.bracket_type === "loser" ? "راند بازنده‌ها" : "راند اصلی"} #{s.round.round_number}
                </h2>
              </CardHeader>
              <CardContent>
                <RoundView round={s.round} matches={s.matches} onResult={load} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

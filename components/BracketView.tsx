"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import type { MatchWithPlayers, Round } from "@/lib/supabase";
import { MatchCard } from "./MatchCard";

type BracketSection = {
  round: Round;
  matches: MatchWithPlayers[];
};

export function BracketView() {
  const [mainBracket, setMainBracket] = useState<BracketSection[]>([]);
  const [loserBracket, setLoserBracket] = useState<BracketSection[]>([]);
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
        setMainBracket([]);
        setLoserBracket([]);
        setLoading(false);
        return;
      }

      const { data: matches } = await sb
        .from("matches")
        .select("*, round:rounds(*)");

      const playerIds = new Set<string>();
      for (const m of matches ?? []) {
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
      for (const m of matches ?? []) {
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

      const main: BracketSection[] = [];
      const loser: BracketSection[] = [];
      for (const r of rounds) {
        const ms = byRound.get(r.id) ?? [];
        const section = { round: r, matches: ms };
        if (r.bracket_type === "main") main.push(section);
        else loser.push(section);
      }

      setMainBracket(main);
      setLoserBracket(loser);
    } catch {
      setMainBracket([]);
      setLoserBracket([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-muted-foreground">در حال بارگذاری...</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">براکت اصلی</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {mainBracket.length === 0 ? (
            <p className="text-muted-foreground text-sm">هنوز راندی ایجاد نشده است.</p>
          ) : (
            mainBracket.map((s) => (
              <div key={s.round.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  راند {s.round.round_number}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {s.matches.map((m) => (
                    <MatchCard key={m.id} match={m} onResult={load} />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">براکت بازنده‌ها</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {loserBracket.length === 0 ? (
            <p className="text-muted-foreground text-sm">هنوز راند بازنده‌ها ایجاد نشده است.</p>
          ) : (
            loserBracket.map((s) => (
              <div key={s.round.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  راند بازنده‌ها #{s.round.round_number}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {s.matches.map((m) => (
                    <MatchCard key={m.id} match={m} onResult={load} />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

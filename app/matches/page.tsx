"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchCard } from "@/components/MatchCard";
import { getSupabase } from "@/lib/supabase";
import type { MatchWithPlayers, Round } from "@/lib/supabase";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: matchData } = await sb
        .from("matches")
        .select("*, round:rounds(*)")
        .is("winner_id", null)
        .order("created_at", { ascending: false });

      const playerIds = new Set<string>();
      for (const m of matchData ?? []) {
        if ((m as { player1_id?: string }).player1_id) playerIds.add((m as { player1_id: string }).player1_id);
        if ((m as { player2_id?: string }).player2_id) playerIds.add((m as { player2_id: string }).player2_id);
      }
      const { data: players } = await sb
        .from("players")
        .select("id, name")
        .in("id", [...playerIds]);
    const playerMap = new Map((players ?? []).map((p) => [p.id, p]));

      const enriched: MatchWithPlayers[] = (matchData ?? []).map((m) => ({
        ...m,
        player1: (m as { player1_id?: string }).player1_id ? playerMap.get((m as { player1_id: string }).player1_id) : null,
        player2: (m as { player2_id?: string }).player2_id ? playerMap.get((m as { player2_id: string }).player2_id) : null,
        winner: null,
        round: (m as { round?: Round }).round,
      }));

      setMatches(enriched);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ثبت نتایج مسابقات</h1>
      <p className="text-muted-foreground">مسابقاتی که هنوز نتیجه‌ای ندارند:</p>

      {loading ? (
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            هیچ مسابقه‌ای در انتظار ثبت نتیجه نیست.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} onResult={load} />
          ))}
        </div>
      )}
    </div>
  );
}

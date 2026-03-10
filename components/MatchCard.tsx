"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { recordMatchResult } from "@/lib/tournament-engine";
import type { MatchWithPlayers } from "@/lib/supabase";

export function MatchCard({
  match,
  onResult,
}: {
  match: MatchWithPlayers;
  onResult?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const p1 = match.player1?.name ?? "TBD";
  const p2 = match.player2?.name ?? "TBD";
  const hasWinner = !!match.winner_id;
  const canSetWinner = (match.player1_id || match.player2_id) && !hasWinner;

  async function setWinner(winnerId: string) {
    if (!canSetWinner) return;
    setLoading(true);
    try {
      await recordMatchResult(match.id, winnerId);
      onResult?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="py-2 px-4 text-sm text-muted-foreground">
        {match.round?.bracket_type === "loser" ? "بازنده‌ها" : "اصلی"} • راند {match.round?.round_number}
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={
                match.winner_id === match.player1_id
                  ? "font-semibold text-primary"
                  : ""
              }
            >
              {p1}
            </span>
            {canSetWinner && match.player1_id && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => setWinner(match.player1_id!)}
              >
                برنده
              </Button>
            )}
          </div>
          <div className="text-muted-foreground text-xs">vs</div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={
                match.winner_id === match.player2_id
                  ? "font-semibold text-primary"
                  : ""
              }
            >
              {p2}
            </span>
            {canSetWinner && match.player2_id && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => setWinner(match.player2_id!)}
              >
                برنده
              </Button>
            )}
          </div>
        </div>
        {hasWinner && (
          <p className="text-sm text-primary mt-2">
            برنده: {match.winner?.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

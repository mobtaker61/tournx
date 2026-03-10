"use client";

import { MatchCard } from "./MatchCard";
import type { MatchWithPlayers, Round } from "@/lib/supabase";

export function RoundView({
  round,
  matches,
  onResult,
}: {
  round: Round;
  matches: MatchWithPlayers[];
  onResult?: () => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">
        {round.bracket_type === "loser" ? "راند بازنده‌ها" : "راند اصلی"} #{round.round_number}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onResult={onResult} />
        ))}
      </div>
    </div>
  );
}

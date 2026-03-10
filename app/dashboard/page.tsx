"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  generateFirstRound,
  generateNextRound,
  generateLoserRound,
  checkTournamentWinner,
} from "@/lib/tournament-engine";

export default function DashboardPage() {
  const [playerCount, setPlayerCount] = useState(0);
  const [activeMatchCount, setActiveMatchCount] = useState(0);
  const [winner, setWinner] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const { count: pc } = await supabase.from("players").select("*", { count: "exact", head: true });
    setPlayerCount(pc ?? 0);

    const { data: matches } = await supabase
      .from("matches")
      .select("id")
      .is("winner_id", null)
      .not("player1_id", "is", null);
    setActiveMatchCount(matches?.length ?? 0);

    const w = await checkTournamentWinner();
    setWinner(w);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFirstRound() {
    setLoading("first");
    setError("");
    try {
      await generateFirstRound();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(null);
    }
  }

  async function handleNextRound() {
    setLoading("next");
    setError("");
    try {
      await generateNextRound();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(null);
    }
  }

  async function handleLoserRound() {
    setLoading("loser");
    setError("");
    try {
      await generateLoserRound();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد</h1>

      {winner && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <h2 className="text-lg font-semibold">🏆 برنده تورنمنت</h2>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{winner.name}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">تعداد بازیکنان</h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{playerCount}</p>
            <Link href="/players">
              <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                مدیریت بازیکنان
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">مسابقات در انتظار نتیجه</h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeMatchCount}</p>
            <Link href="/matches">
              <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                ثبت نتایج
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">کنترل تورنمنت</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleFirstRound}
              disabled={!!loading || playerCount < 2}
              className="w-full"
            >
              {loading === "first" ? "در حال ایجاد..." : "ایجاد راند اول"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextRound}
              disabled={!!loading}
              className="w-full"
            >
              {loading === "next" ? "در حال ایجاد..." : "ایجاد راند بعدی (اصلی)"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLoserRound}
              disabled={!!loading}
              className="w-full"
            >
              {loading === "loser" ? "در حال ایجاد..." : "ایجاد راند بازنده‌ها"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/lib/supabase";

export function PlayerTable({ refresh }: { refresh?: number }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPlayers(data ?? []);
      setLoading(false);
    }
    fetchPlayers();
  }, [refresh]);

  async function removePlayer(id: string) {
    if (!confirm("آیا از حذف این بازیکن اطمینان دارید؟")) return;
    await supabase.from("players").delete().eq("id", id);
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  if (loading) return <p className="text-muted-foreground">در حال بارگذاری...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>نام</TableHead>
          <TableHead className="w-[100px]">عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((p, i) => (
          <TableRow key={p.id}>
            <TableCell>{players.length - i}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removePlayer(p.id)}
              >
                حذف
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

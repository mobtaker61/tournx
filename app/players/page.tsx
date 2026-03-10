"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayerTable } from "@/components/PlayerTable";

export default function PlayersPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">مدیریت بازیکنان</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">افزودن بازیکن</h2>
        </CardHeader>
        <CardContent>
          <AddPlayerForm onAdded={() => setRefresh((r) => r + 1)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">لیست بازیکنان</h2>
        </CardHeader>
        <CardContent>
          <PlayerTable refresh={refresh} />
        </CardContent>
      </Card>
    </div>
  );
}

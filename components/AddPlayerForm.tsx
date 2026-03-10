"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export function AddPlayerForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("نام بازیکن را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("players")
        .insert({ name: name.trim() });
      if (err) throw err;
      setName("");
      onAdded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در افزودن بازیکن");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm text-muted-foreground block mb-1">نام بازیکن</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام بازیکن"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "در حال افزودن..." : "افزودن بازیکن"}
      </Button>
      {error && <p className="text-destructive text-sm w-full">{error}</p>}
    </form>
  );
}

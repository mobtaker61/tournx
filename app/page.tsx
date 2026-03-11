"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
      در حال انتقال...
    </div>
  );
}

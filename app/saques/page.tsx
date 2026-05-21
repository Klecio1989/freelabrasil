"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SaquesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/saques");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecionando para saques...
    </main>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/minhas-avaliacoes");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecionando...
    </main>
  );
}
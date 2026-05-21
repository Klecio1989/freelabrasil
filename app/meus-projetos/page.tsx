"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MeusProjetosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/meus-projetos");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecionando para meus projetos...
    </main>
  );
}
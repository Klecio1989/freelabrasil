"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PainelFreelancerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/painel-freelancer");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecionando para o painel do freelancer...
    </main>
  );
}
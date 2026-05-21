"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PerfilRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/perfil");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecionando para perfil...
    </main>
  );
}
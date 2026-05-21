"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    validar();
  }, []);

  function validar() {
    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (!userLocal) {
      alert("Faça login para acessar.");
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(userLocal);

    if (usuario.banido) {
      localStorage.removeItem("freelabrasil_usuario");

      alert(
        usuario.motivo_banimento ||
          "Sua conta foi banida."
      );

      router.push("/login");
      return;
    }

    setPermitido(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Validando acesso...
      </main>
    );
  }

  if (!permitido) {
    return null;
  }

  return <>{children}</>;
}
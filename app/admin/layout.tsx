"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarAcesso();
  }, []);

  function verificarAcesso() {
    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (!userLocal) {
      alert("Você precisa estar logado.");
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(userLocal);

    if (usuario.banido) {
      localStorage.removeItem("freelabrasil_usuario");
      alert(
        usuario.motivo_banimento ||
          "Sua conta foi banida por violação dos termos."
      );
      router.push("/login");
      return;
    }

    if (!usuario.admin && usuario.role !== "admin") {
      alert("Acesso restrito ao administrador.");
      router.push("/");
      return;
    }

    setAutorizado(true);
    setCarregando(false);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Verificando acesso administrativo...
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  return <>{children}</>;
}
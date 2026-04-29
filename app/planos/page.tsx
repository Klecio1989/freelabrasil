"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const [usuario, setUsuario] = useState<any>(null);

useEffect(() => {
  const user = localStorage.getItem("freelabrasil_usuario");
  if (user) {
    setUsuario(JSON.parse(user));
  }
}, []);

async function contratarPlano(plano: "plus" | "pro") {
  if (!usuario?.id) {
    alert("Faça login.");
    return;
  }

  const res = await fetch("/api/mp/create-preference", {
    method: "POST",
    body: JSON.stringify({
      plano,
      usuario_id: usuario.id,
    }),
  });

  const data = await res.json();

  // REDIRECIONA PARA MERCADO PAGO
  window.location.href = data.init_point;
}
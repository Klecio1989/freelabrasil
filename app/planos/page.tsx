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

  const valor = plano === "plus" ? 19.99 : 29.99;

  const { data, error } = await supabase
    .from("pagamentos")
    .insert([
      {
        usuario_id: usuario.id,
        plano,
        valor,
        status: "pendente",
      },
    ])
    .select()
    .single();

  if (error) {
    console.log(error);
    alert("Erro ao iniciar pagamento");
    return;
  }

  window.location.href = `/pagamento?plano=${plano}&id=${data.id}`;
}
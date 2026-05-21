import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { tipo, texto } = await req.json();

    if (!tipo || !texto) {
      return NextResponse.json(
        { error: "Tipo e texto são obrigatórios." },
        { status: 400 }
      );
    }

    let prompt = "";

    if (tipo === "melhorar_proposta") {
      prompt = `
Melhore a proposta abaixo para uma plataforma de freelancers.
Deixe o texto profissional, claro, objetivo, persuasivo e confiável.
Não invente experiências.
Mantenha em português do Brasil.

Proposta:
${texto}
`;
    }

    if (tipo === "descricao_projeto") {
      prompt = `
Transforme o texto abaixo em uma descrição profissional de projeto para contratar freelancer.
Inclua objetivo, escopo, entregáveis e perfil desejado.
Mantenha em português do Brasil.

Texto:
${texto}
`;
    }

    if (tipo === "titulo_projeto") {
      prompt = `
Crie 5 opções de títulos curtos e profissionais para este projeto.
Mantenha em português do Brasil.

Projeto:
${texto}
`;
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Tipo de IA inválido." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: prompt,
    });

    return NextResponse.json({
      resultado: response.output_text,
    });
  } catch (error) {
    console.error("Erro IA:", error);

    return NextResponse.json(
      { error: "Erro ao gerar resposta com IA." },
      { status: 500 }
    );
  }
}
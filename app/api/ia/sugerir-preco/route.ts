import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY não configurada.",
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { titulo, descricao, area, prazo } = body;

    if (!titulo || !descricao) {
      return NextResponse.json(
        {
          success: false,
          error: "Título e descrição são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const prompt = `
Você é especialista em precificação de projetos freelancer no Brasil.

Analise o projeto abaixo e sugira uma faixa de preço justa em reais.

Projeto:
Título: ${titulo}
Descrição: ${descricao}
Área: ${area || "não informada"}
Prazo: ${prazo || "não informado"}

Retorne APENAS JSON válido neste formato:
{
  "preco_minimo": 0,
  "preco_recomendado": 0,
  "preco_maximo": 0,
  "justificativa": "texto curto"
}
`;

    const resposta = await openai.responses.create({
      model: "gpt-5.5",
      input: prompt,
    });

    const texto = resposta.output_text || "{}";

    let resultado;

    try {
      resultado = JSON.parse(texto);
    } catch {
      resultado = {
        preco_minimo: 0,
        preco_recomendado: 0,
        preco_maximo: 0,
        justificativa: "Não foi possível gerar uma sugestão estruturada.",
      };
    }

    return NextResponse.json({
      success: true,
      resultado,
    });
  } catch (error: any) {
    console.error("Erro IA preço:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao sugerir preço com IA.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API sugerir preço ativa.",
  });
}
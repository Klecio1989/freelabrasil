import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Variáveis Supabase não configuradas.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(url, serviceKey);

    const body = await req.json();

    console.log("Webhook recebido:", body);

    return NextResponse.json({
      success: true,
      received: body,
    });
  } catch (error: any) {
    console.error("Erro webhook:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro no webhook.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook ativo.",
  });
}
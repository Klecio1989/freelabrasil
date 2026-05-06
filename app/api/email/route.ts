import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API de email ativa.",
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY não configurada no .env.local.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();

    const { para, assunto, titulo, mensagem, botaoTexto, botaoLink } = body;

    if (!para || !assunto || !titulo || !mensagem) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios ausentes.",
        },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "FreellaBrasil <noreply@freellabrasil.com.br>",
      to: [para],
      subject: assunto,
      html: `
        <div style="background:#020617;padding:40px;font-family:Arial;color:#fff">
          <div style="max-width:600px;margin:auto;background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px">
            <h1 style="font-size:32px;color:#fff">${titulo}</h1>

            <p style="margin-top:25px;font-size:16px;line-height:30px;color:#cbd5e1">
              ${mensagem}
            </p>

            ${
              botaoTexto && botaoLink
                ? `
                  <a href="${botaoLink}" style="display:inline-block;margin-top:35px;background:#10b981;color:#020617;padding:16px 28px;border-radius:14px;text-decoration:none;font-weight:bold;">
                    ${botaoTexto}
                  </a>
                `
                : ""
            }

            <p style="margin-top:40px;font-size:12px;color:#64748b">
              © ${new Date().getFullYear()} FreellaBrasil
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("ERRO EMAIL:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao enviar email.",
      },
      { status: 500 }
    );
  }
}
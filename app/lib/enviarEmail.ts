export async function enviarEmail({
  para,
  assunto,
  titulo,
  mensagem,
  botaoTexto,
  botaoLink,
}: any) {
  try {
    await fetch("/api/email", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        para,
        assunto,
        titulo,
        mensagem,
        botaoTexto,
        botaoLink,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
}
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function FreelancerPublico({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  const { data: avaliacoes } = await supabase
    .from("avaliacoes")
    .select("id,nota,comentario,created_at")
    .eq("freelancer_id", id)
    .order("created_at", { ascending: false });

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Freelancer não encontrado.</p>
      </main>
    );
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
          PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">
          PLUS
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
        GRATUITO
      </span>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Perfil Público</h1>
            {badgePlano(usuario.plano)}
          </div>

          <Link
            href="/freelancers"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                {usuario.foto_url ? (
                  <img
                    src={usuario.foto_url}
                    alt="Foto do freelancer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {usuario.nome?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mt-4">{usuario.nome}</h2>
              <p className="text-slate-400 mt-1">{usuario.cidade || "-"}</p>
              <p className="text-yellow-400 mt-3 font-bold">
                ⭐ {Number(usuario.nota_media || 0).toFixed(1)}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {usuario.projetos_concluidos || 0} projetos concluídos
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-sm text-slate-400">Descrição</p>
                <p className="text-base mt-2 text-slate-200">
                  {usuario.descricao || "Sem descrição."}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-sm text-slate-400">Habilidades</p>
                <p className="text-base mt-2 text-slate-200">
                  {usuario.habilidades || "Sem habilidades cadastradas."}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-sm text-slate-400">Portfólio</p>
                {usuario.portfolio_url ? (
                  <a
                    href={usuario.portfolio_url}
                    target="_blank"
                    className="text-emerald-400 mt-2 inline-block"
                  >
                    Abrir portfólio
                  </a>
                ) : (
                  <p className="text-base mt-2 text-slate-200">
                    Sem portfólio cadastrado.
                  </p>
                )}
              </div>

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-sm text-slate-400 mb-4">Avaliações</p>

                {avaliacoes && avaliacoes.length > 0 ? (
                  <div className="space-y-4">
                    {avaliacoes.map((avaliacao: any) => (
                      <div
                        key={avaliacao.id}
                        className="rounded-xl border border-white/10 bg-slate-900 p-4"
                      >
                        <p className="text-yellow-400 font-bold">
                          ⭐ {avaliacao.nota}/5
                        </p>

                        <p className="text-slate-200 mt-2">
                          {avaliacao.comentario || "Sem comentário."}
                        </p>

                        <p className="text-xs text-slate-500 mt-3">
                          {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-300">Nenhuma avaliação ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
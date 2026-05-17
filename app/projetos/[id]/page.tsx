  "use client";

  import { useEffect, useState } from "react";
  import { supabase } from "@/lib/supabase";
  import { useParams } from "next/navigation";
  import Link from "next/link";

  export default function ProjetoPage() {
    const params = useParams();
    const id = params?.id as string;

    const [projeto, setProjeto] = useState<any>(null);
    const [freelas, setFreelas] = useState<any[]>([]);
    const [usuario, setUsuario] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState<string | null>(null);

    useEffect(() => {
      if (id) carregar();
    }, [id]);

    async function carregar() {
      setCarregando(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      setUsuario(user);

      const { data: proj, error: erroProjeto } = await supabase
        .from("projetos")
        .select("*")
        .eq("id", id)
        .single();

      if (erroProjeto || !proj) {
        console.error("Erro ao carregar projeto:", erroProjeto);
        setProjeto(null);
        setCarregando(false);
        return;
      }

      setProjeto(proj);

      const { data: lista, error: erroFreelas } = await supabase
        .from("ranking_freelancers")
        .select("*");

      if (erroFreelas) {
        console.error("Erro ao carregar freelancers:", erroFreelas);
        setFreelas([]);
        setCarregando(false);
        return;
      }

      setFreelas(calcularMatch(proj, lista || []));
      setCarregando(false);
    }

    function calcularMatch(projeto: any, lista: any[]) {
      const textoProjeto = `
        ${projeto.titulo || ""}
        ${projeto.descricao || ""}
        ${projeto.categoria || ""}
      `.toLowerCase();

      const palavrasIgnoradas = [
        "de",
        "da",
        "do",
        "das",
        "dos",
        "em",
        "para",
        "por",
        "com",
        "um",
        "uma",
        "o",
        "a",
        "e",
        "ou",
        "que",
        "no",
        "na",
        "nos",
        "nas",
        "site",
        "sistema",
        "projeto",
        "preciso",
        "quero",
      ];

      const palavrasProjeto = textoProjeto
        .replace(/[^\wÀ-ÿ\s]/g, " ")
        .split(/\s+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 3 && !palavrasIgnoradas.includes(p));

      return lista
        .map((f) => {
          const habilidades = `${f.habilidades || ""}`.toLowerCase();
          const nome = `${f.nome || ""}`.toLowerCase();
          const categoria = `${f.categoria || ""}`.toLowerCase();

          let score = 0;

          palavrasProjeto.forEach((palavra) => {
            if (habilidades.includes(palavra)) score += 3;
            if (categoria.includes(palavra)) score += 2;
            if (nome.includes(palavra)) score += 1;
          });

          score += Number(f.media || 0);

          if (f.boost_ativo) score += 5;

          return {
            ...f,
            score,
          };
        })
        .filter((f) => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    async function convidarFreelancer(freela: any) {
      if (!usuario) {
        alert("Você precisa estar logado para convidar um freelancer.");
        return;
      }

      setEnviando(freela.id);

      const { data: conviteExistente } = await supabase
        .from("convites")
        .select("id")
        .eq("projeto_id", projeto.id)
        .eq("freelancer_id", freela.id)
        .maybeSingle();

      if (conviteExistente) {
        alert("Este freelancer já foi convidado para este projeto.");
        setEnviando(null);
        return;
      }

      const { error: erroConvite } = await supabase.from("convites").insert({
        projeto_id: projeto.id,
        contratante_id: usuario.id,
        freelancer_id: freela.id,
        status: "pendente",
        mensagem: `Você recebeu um convite para o projeto: ${projeto.titulo}`,
      });

      if (erroConvite) {
        console.error("Erro ao enviar convite:", erroConvite);
        alert("Erro ao enviar convite.");
        setEnviando(null);
        return;
      }

      await supabase.from("notificacoes").insert({
        usuario_id: freela.id,
        titulo: "Novo convite recebido",
        mensagem: `Você foi convidado para o projeto: ${projeto.titulo}`,
        link: `/projetos/${projeto.id}`,
        lida: false,
      });

      alert("Convite enviado com sucesso!");
      setEnviando(null);
    }

    if (carregando) {
      return (
        <main className="min-h-screen bg-slate-950 p-10 text-white">
          Carregando projeto...
        </main>
      );
    }

    if (!projeto) {
      return (
        <main className="min-h-screen bg-slate-950 p-10 text-white">
          Projeto não encontrado.
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/projetos"
            className="text-sm text-emerald-400 hover:underline"
          >
            ← Voltar para projetos
          </Link>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h1 className="text-4xl font-black">{projeto.titulo}</h1>

            <p className="mt-4 text-slate-300">{projeto.descricao}</p>

            {projeto.categoria && (
              <p className="mt-4 text-sm text-slate-400">
                Categoria:{" "}
                <span className="text-emerald-300">{projeto.categoria}</span>
              </p>
            )}

            {projeto.orcamento && (
              <p className="mt-2 text-sm text-slate-400">
                Orçamento:{" "}
                <span className="text-emerald-300">{projeto.orcamento}</span>
              </p>
            )}
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">
            Freelancers recomendados 🧠
          </h2>

          {freelas.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl text-slate-300">
              Nenhum freelancer recomendado para este projeto ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {freelas.map((f) => (
                <div
                  key={f.id}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/freelancer/${f.id}`}>
                        <h3 className="font-bold text-lg hover:text-emerald-300">
                          {f.nome || "Freelancer"}
                        </h3>
                      </Link>

                      <p className="text-yellow-300 mt-1">
                        ⭐ {Number(f.media || 0).toFixed(1)}
                      </p>
                    </div>

                    {f.boost_ativo && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 mt-3">
                    {f.habilidades || "Sem habilidades cadastradas"}
                  </p>

                  <p className="text-xs text-emerald-300 mt-3">
                    Match score: {f.score}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/freelancer/${f.id}`}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                    >
                      Ver perfil
                    </Link>

                    <button
                      onClick={() => convidarFreelancer(f)}
                      disabled={enviando === f.id}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-slate-950 disabled:opacity-50"
                    >
                      {enviando === f.id ? "Enviando..." : "Convidar Freelancer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }
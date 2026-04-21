"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [cidade, setCidade] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
      setNome(parsed.nome || "");
      setEmail(parsed.email || "");
      setDescricao(parsed.descricao || "");
      setFotoUrl(parsed.foto_url || "");
      setPortfolioUrl(parsed.portfolio_url || "");
      setHabilidades(parsed.habilidades || "");
      setCidade(parsed.cidade || "");
    }
  }, []);

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

  function cardDestaque(plano?: string) {
    if (plano === "pro") return "border-purple-500/50 bg-purple-500/5";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/5";
    return "border-white/10 bg-slate-900";
  }

  async function uploadFoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !usuario) return;

    try {
      setEnviandoFoto(true);

      const extensao = file.name.split(".").pop();
      const nomeArquivo = `${usuario.id}-${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(nomeArquivo, file, { upsert: true });

      if (uploadError) {
        alert("Erro ao enviar foto.");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(nomeArquivo);

      if (!data?.publicUrl) {
        alert("Erro ao obter URL da foto.");
        return;
      }

      setFotoUrl(data.publicUrl);
      alert("Foto enviada com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar foto.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvarPerfil() {
    if (!usuario) return;

    try {
      setSalvando(true);

      const { error } = await supabase
        .from("usuarios")
        .update({
          nome,
          email,
          descricao,
          foto_url: fotoUrl,
          portfolio_url: portfolioUrl,
          habilidades,
          cidade,
        })
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao salvar perfil.");
        return;
      }

      const usuarioAtualizado = {
        ...usuario,
        nome,
        email,
        descricao,
        foto_url: fotoUrl,
        portfolio_url: portfolioUrl,
        habilidades,
        cidade,
      };

      localStorage.setItem("freelabrasil_usuario", JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);
      setEditando(false);
      alert("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Carregando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Meu Perfil</h1>
            {badgePlano(usuario.plano)}
          </div>

          <div className="flex gap-3">
            {usuario.tipo_usuario === "freelancer" && (
              <Link
                href={`/freelancer/${usuario.id}`}
                className="bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold"
              >
                Ver página pública
              </Link>
            )}

            <Link
              href={usuario.tipo_usuario === "freelancer" ? "/painel-freelancer" : "/painel-contratante"}
              className="border border-white/20 px-4 py-2 rounded-lg"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className={`rounded-2xl border p-8 ${cardDestaque(usuario.plano)}`}>
          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Foto do perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {usuario.nome?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mt-4">{usuario.nome}</h2>
              <p className="text-slate-400 mt-1">{usuario.email}</p>
              <p className="text-sm text-slate-500 mt-3 capitalize">
                {usuario.tipo_usuario}
              </p>
            </div>

            <div className="space-y-6">
              {!editando ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-xl p-5">
                      <p className="text-sm text-slate-400">Nome</p>
                      <p className="text-xl font-bold mt-1">{usuario.nome}</p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-5">
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-xl font-bold mt-1">{usuario.email}</p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-5">
                      <p className="text-sm text-slate-400">Cidade</p>
                      <p className="text-xl font-bold mt-1">{usuario.cidade || "-"}</p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-5">
                      <p className="text-sm text-slate-400">Plano</p>
                      <p className="text-xl font-bold mt-1 capitalize">{usuario.plano || "gratuito"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400">Descrição</p>
                    <p className="text-base mt-2 text-slate-200">
                      {usuario.descricao || "Nenhuma descrição cadastrada."}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400">Habilidades</p>
                    <p className="text-base mt-2 text-slate-200">
                      {usuario.habilidades || "Nenhuma habilidade cadastrada."}
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
                        Nenhum portfólio cadastrado.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setEditando(true)}
                    className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg"
                  >
                    Editar perfil
                  </button>
                </>
              ) : (
                <div className="space-y-5">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="URL do portfólio"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadFoto}
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  {enviandoFoto && (
                    <p className="text-sm text-slate-400">Enviando foto...</p>
                  )}

                  <textarea
                    value={habilidades}
                    onChange={(e) => setHabilidades(e.target.value)}
                    rows={3}
                    placeholder="Habilidades"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={5}
                    placeholder="Descrição"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={salvarPerfil}
                      disabled={salvando}
                      className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg disabled:opacity-60"
                    >
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      onClick={() => setEditando(false)}
                      className="border border-white/20 px-6 py-3 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
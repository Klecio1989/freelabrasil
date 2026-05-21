"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type PortfolioItem = {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
  link_url?: string;
  created_at?: string;
};

export default function PerfilPage() {
  const inputFotoRef = useRef<HTMLInputElement | null>(null);

  const [usuario, setUsuario] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [cidade, setCidade] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioTitulo, setPortfolioTitulo] = useState("");
  const [portfolioDescricao, setPortfolioDescricao] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioImagem, setPortfolioImagem] = useState<File | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvandoPortfolio, setSalvandoPortfolio] = useState(false);
  const [desativando, setDesativando] = useState(false);

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

      if (parsed.tipo_usuario === "freelancer") {
        carregarPortfolio(parsed.id);
      }
    }
  }, []);

  function limitePortfolio(plano?: string) {
    if (plano === "pro") return 10;
    if (plano === "plus") return 5;
    return 2;
  }

  async function carregarPortfolio(usuarioId: string) {
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPortfolio(data as PortfolioItem[]);
    }
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

  function cardDestaque(plano?: string) {
    if (plano === "pro") return "border-purple-500/50 bg-purple-500/5";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/5";
    return "border-white/10 bg-slate-900";
  }

  function abrirSeletorFoto() {
    if (!editando) return;
    inputFotoRef.current?.click();
  }

  async function uploadFoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !usuario) return;

    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];

    if (!tiposPermitidos.includes(file.type)) {
      alert("Selecione uma imagem PNG ou JPG.");
      return;
    }

    try {
      setEnviandoFoto(true);

      const extensao = file.name.split(".").pop();
      const nomeArquivo = `avatar-${usuario.id}-${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(nomeArquivo, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        alert("Erro no upload: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(nomeArquivo);

      if (!data?.publicUrl) {
        alert("Erro ao gerar URL da imagem.");
        return;
      }

      const novaFoto = data.publicUrl;

      const { error } = await supabase
        .from("usuarios")
        .update({ foto_url: novaFoto })
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao salvar foto no banco.");
        return;
      }

      const usuarioAtualizado = {
        ...usuario,
        foto_url: novaFoto,
      };

      setUsuario(usuarioAtualizado);
      setFotoUrl(novaFoto);

      localStorage.setItem(
        "freelabrasil_usuario",
        JSON.stringify(usuarioAtualizado)
      );

      alert("Foto atualizada com sucesso!");
    } finally {
      setEnviandoFoto(false);
      if (event.target) event.target.value = "";
    }
  }

  async function salvarProjetoPortfolio() {
    if (!usuario) return;

    const limite = limitePortfolio(usuario.plano);

    if (portfolio.length >= limite) {
      alert(
        `Seu plano permite até ${limite} projetos no portfólio. Para adicionar mais projetos, altere seu plano.`
      );
      return;
    }

    if (!portfolioTitulo.trim() || !portfolioDescricao.trim()) {
      alert("Informe título e descrição do projeto.");
      return;
    }

    try {
      setSalvandoPortfolio(true);

      let imagemUrl = "";

      if (portfolioImagem) {
        const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];

        if (!tiposPermitidos.includes(portfolioImagem.type)) {
          alert("A imagem do portfólio precisa ser PNG ou JPG.");
          return;
        }

        const extensao = portfolioImagem.name.split(".").pop();
        const nomeArquivo = `${usuario.id}/${Date.now()}-${portfolioImagem.name
          .replace(/\s/g, "-")
          .toLowerCase()}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(nomeArquivo, portfolioImagem, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("ERRO UPLOAD PORTFOLIO:", uploadError);
          alert("Erro ao enviar imagem do portfólio: " + uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from("portfolio")
          .getPublicUrl(nomeArquivo);

        imagemUrl = data.publicUrl;
      }

      const { data, error } = await supabase
        .from("portfolio")
        .insert([
          {
            usuario_id: usuario.id,
            titulo: portfolioTitulo.trim(),
            descricao: portfolioDescricao.trim(),
            imagem_url: imagemUrl,
            link_url: portfolioLink.trim(),
          },
        ])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setPortfolio((prev) => [data as PortfolioItem, ...prev]);
      setPortfolioTitulo("");
      setPortfolioDescricao("");
      setPortfolioLink("");
      setPortfolioImagem(null);

      const input = document.getElementById("portfolio-imagem") as HTMLInputElement;
      if (input) input.value = "";

      alert("Projeto adicionado ao portfólio.");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar projeto.");
    } finally {
      setSalvandoPortfolio(false);
    }
  }

  async function excluirPortfolio(id: string) {
    const confirmar = window.confirm("Deseja excluir este item do portfólio?");
    if (!confirmar) return;

    const { error } = await supabase.from("portfolio").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setPortfolio((prev) => prev.filter((item) => item.id !== id));
  }

  async function salvarPerfil() {
    if (!usuario) return;

    if (!nome || !email) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    const querAlterarSenha = novaSenha.trim() || confirmarNovaSenha.trim();

    if (querAlterarSenha) {
      if (!senhaAtual.trim()) {
        alert("Informe a senha atual para alterar a senha.");
        return;
      }

      if (senhaAtual !== usuario.senha) {
        alert("Senha atual inválida.");
        return;
      }

      if (novaSenha.length < 6) {
        alert("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }

      if (novaSenha !== confirmarNovaSenha) {
        alert("A confirmação da nova senha não confere.");
        return;
      }
    }

    try {
      setSalvando(true);

      const payload: any = {
        nome,
        email: email.trim().toLowerCase(),
        descricao,
        foto_url: fotoUrl,
        portfolio_url: portfolioUrl,
        habilidades,
        cidade,
      };

      if (querAlterarSenha) {
        payload.senha = novaSenha;
      }

      const { error } = await supabase
        .from("usuarios")
        .update(payload)
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao salvar perfil.");
        return;
      }

      const usuarioAtualizado = {
        ...usuario,
        ...payload,
      };

      localStorage.setItem(
        "freelabrasil_usuario",
        JSON.stringify(usuarioAtualizado)
      );

      setUsuario(usuarioAtualizado);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setEditando(false);

      alert("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  async function desativarConta() {
    if (!usuario) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja desativar sua conta? Você não conseguirá mais fazer login até reativação manual."
    );

    if (!confirmar) return;

    const senhaInformada = window.prompt("Digite sua senha atual para confirmar:");

    if (!senhaInformada) return;

    if (senhaInformada !== usuario.senha) {
      alert("Senha inválida.");
      return;
    }

    try {
      setDesativando(true);

      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: false })
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao desativar conta.");
        return;
      }

      localStorage.removeItem("freelabrasil_usuario");
      alert("Conta desativada com sucesso.");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Erro ao desativar conta.");
    } finally {
      setDesativando(false);
    }
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Carregando perfil...</p>
      </main>
    );
  }

  const limite = limitePortfolio(usuario.plano);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
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
              href={
                usuario.tipo_usuario === "freelancer"
                  ? "/painel-freelancer"
                  : "/painel-contratante"
              }
              className="border border-white/20 px-4 py-2 rounded-lg"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className={`rounded-2xl border p-8 ${cardDestaque(usuario.plano)}`}>
          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={uploadFoto}
                className="hidden"
              />

              <button
                type="button"
                onClick={abrirSeletorFoto}
                className={`w-32 h-32 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border border-white/10 ${
                  editando ? "cursor-pointer hover:opacity-80" : "cursor-default"
                }`}
              >
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
              </button>

              {editando && (
                <p className="mt-3 text-xs text-slate-400">
                  Clique na foto/inicial para enviar PNG ou JPG.
                </p>
              )}

              {enviandoFoto && (
                <p className="mt-2 text-xs text-emerald-300">Enviando foto...</p>
              )}

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
                    <Info titulo="Nome" valor={usuario.nome} />
                    <Info titulo="Email" valor={usuario.email} />
                    <Info titulo="Cidade" valor={usuario.cidade || "-"} />
                    <Info titulo="Plano" valor={usuario.plano || "gratuito"} />
                  </div>

                  <Bloco titulo="Descrição" texto={usuario.descricao || "Nenhuma descrição cadastrada."} />
                  <Bloco titulo="Habilidades" texto={usuario.habilidades || "Nenhuma habilidade cadastrada."} />

                  <div className="bg-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400">Portfólio externo</p>
                    {usuario.portfolio_url ? (
                      <a href={usuario.portfolio_url} target="_blank" className="text-emerald-400 mt-2 inline-block">
                        Abrir portfólio
                      </a>
                    ) : (
                      <p className="text-base mt-2 text-slate-200">Nenhum link externo cadastrado.</p>
                    )}
                  </div>

                  {usuario.tipo_usuario === "freelancer" && (
                    <div className="bg-slate-800 rounded-xl p-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h3 className="text-2xl font-bold">Projetos do portfólio</h3>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-slate-300">
                          {portfolio.length} de {limite} usados
                        </span>
                      </div>

                      {portfolio.length === 0 && (
                        <p className="mt-3 text-slate-400">Nenhum projeto cadastrado ainda.</p>
                      )}

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {portfolio.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                            {item.imagem_url && (
                              <img src={item.imagem_url} alt={item.titulo} className="h-40 w-full rounded-xl object-cover" />
                            )}

                            <h4 className="mt-4 text-xl font-bold">{item.titulo}</h4>
                            <p className="mt-2 text-sm text-slate-300">{item.descricao}</p>

                            {item.link_url && (
                              <a href={item.link_url} target="_blank" className="mt-3 inline-block text-emerald-400">
                                Abrir projeto
                              </a>
                            )}

                            <button
                              onClick={() => excluirPortfolio(item.id)}
                              className="mt-4 block rounded-lg border border-red-400/40 px-4 py-2 text-sm font-bold text-red-300"
                            >
                              Excluir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setEditando(true)} className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg">
                      Editar perfil
                    </button>

                    <Link href="/planos" className="bg-purple-500 text-white font-bold px-6 py-3 rounded-lg">
                      Alterar plano
                    </Link>

                    <button
                      onClick={desativarConta}
                      disabled={desativando}
                      className="bg-red-500 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-60"
                    >
                      {desativando ? "Desativando..." : "Desativar conta"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                  <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="URL do portfólio externo" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />

                  <textarea value={habilidades} onChange={(e) => setHabilidades(e.target.value)} rows={3} placeholder="Habilidades" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                  <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={5} placeholder="Descrição" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />

                  {usuario.tipo_usuario === "freelancer" && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h3 className="text-lg font-bold">Adicionar projeto ao portfólio</h3>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-slate-300">
                          {portfolio.length} de {limite} usados
                        </span>
                      </div>

                      <p className="text-sm text-slate-400">
                        Limites: Gratuito 5 projetos, Plus 10 projetos, Pro 30 projetos.
                      </p>

                      <input value={portfolioTitulo} onChange={(e) => setPortfolioTitulo(e.target.value)} placeholder="Título do projeto" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                      <textarea value={portfolioDescricao} onChange={(e) => setPortfolioDescricao(e.target.value)} rows={4} placeholder="Descrição do projeto" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                      <input value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} placeholder="Link do projeto" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />

                      <input
                        id="portfolio-imagem"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => setPortfolioImagem(e.target.files?.[0] || null)}
                        className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                      />

                      <button
                        onClick={salvarProjetoPortfolio}
                        disabled={salvandoPortfolio || portfolio.length >= limite}
                        className="rounded-xl bg-purple-500 px-6 py-3 font-bold text-white disabled:opacity-60"
                      >
                        {salvandoPortfolio
                          ? "Salvando projeto..."
                          : portfolio.length >= limite
                          ? "Limite do plano atingido"
                          : "Adicionar ao portfólio"}
                      </button>
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
                    <h3 className="text-lg font-bold">Alterar senha opcional</h3>
                    <p className="text-sm text-slate-400">Preencha apenas se quiser trocar sua senha.</p>

                    <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Senha atual" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                    <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                    <input type="password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} placeholder="Confirmar nova senha" className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3" />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={salvarPerfil} disabled={salvando} className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg disabled:opacity-60">
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      onClick={() => {
                        setEditando(false);
                        setSenhaAtual("");
                        setNovaSenha("");
                        setConfirmarNovaSenha("");
                      }}
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

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="text-xl font-bold mt-1 capitalize">{valor}</p>
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="text-base mt-2 text-slate-200">{texto}</p>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("freelancer");
  const [documentoTipo, setDocumentoTipo] = useState("cpf");
  const [documento, setDocumento] = useState("");
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteComissao, setAceiteComissao] = useState(false);
  const [aceiteConduta, setAceiteConduta] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function validarEmail(valor: string) {
    return /\S+@\S+\.\S+/.test(valor);
  }

  function validarSenha(valor: string) {
    return valor.length >= 6;
  }

  function limparDocumento(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function validarDocumento() {
    const doc = limparDocumento(documento);

    if (documentoTipo === "cpf" && doc.length !== 11) {
      alert("CPF inválido. Informe 11 números.");
      return false;
    }

    if (documentoTipo === "cnpj" && doc.length !== 14) {
      alert("CNPJ inválido. Informe 14 números.");
      return false;
    }

    return true;
  }

  async function verificarDuplicidade(emailNormalizado: string, docLimpo: string) {
    const { data: emailExistente } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", emailNormalizado)
      .maybeSingle();

    if (emailExistente) {
      alert("Já existe uma conta com este email.");
      return false;
    }

    if (documentoTipo === "cpf") {
      const { data: cpfExistente } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cpf", docLimpo)
        .maybeSingle();

      if (cpfExistente) {
        alert("Já existe uma conta cadastrada com este CPF.");
        return false;
      }
    }

    if (documentoTipo === "cnpj") {
      const { data: cnpjExistente } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cnpj", docLimpo)
        .maybeSingle();

      if (cnpjExistente) {
        alert("Já existe uma conta cadastrada com este CNPJ.");
        return false;
      }
    }

    return true;
  }

  async function cadastrar() {
    if (!nome || !email || !senha || !tipoUsuario || !documento) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!validarEmail(email)) {
      alert("Digite um email válido.");
      return;
    }

    if (!validarSenha(senha)) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!validarDocumento()) {
      return;
    }

    if (!aceiteTermos || !aceiteComissao || !aceiteConduta) {
      alert("Para criar sua conta, aceite os termos, a comissão e as regras de conduta.");
      return;
    }

    try {
      setCarregando(true);

      const emailNormalizado = email.trim().toLowerCase();
      const docLimpo = limparDocumento(documento);

      const podeCadastrar = await verificarDuplicidade(emailNormalizado, docLimpo);

      if (!podeCadastrar) return;

      const payload: any = {
        nome: nome.trim(),
        email: emailNormalizado,
        senha,
        tipo_usuario: tipoUsuario,
        plano: "gratuito",
        ativo: true,
        email_verificado: true,
        aceite_termos: true,
        aceite_comissao: true,
        status_conta: "ativo",
      };

      if (documentoTipo === "cpf") {
        payload.cpf = docLimpo;
        payload.cnpj = null;
      }

      if (documentoTipo === "cnpj") {
        payload.cnpj = docLimpo;
        payload.cpf = null;
      }

      const { error } = await supabase.from("usuarios").insert([payload]);

      if (error) {
        console.error(error);

        const msg = String(error.message || "").toLowerCase();

        if (msg.includes("usuarios_email_unico") || msg.includes("email")) {
          alert("Já existe uma conta com este email.");
          return;
        }

        if (msg.includes("usuarios_cpf_unico") || msg.includes("cpf")) {
          alert("Já existe uma conta cadastrada com este CPF.");
          return;
        }

        if (msg.includes("usuarios_cnpj_unico") || msg.includes("cnpj")) {
          alert("Já existe uma conta cadastrada com este CNPJ.");
          return;
        }

        alert("Erro ao cadastrar usuário.");
        return;
      }

      alert("Cadastro realizado com sucesso.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_560px] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            Crie sua conta com segurança
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            Entre para a FreellaBrasil e comece a gerar oportunidades.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Para proteger freelancers e contratantes, usamos cadastro único por
            email, CPF ou CNPJ, aceite de comissão e regras rígidas de conduta.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Conta única</div>
              <div className="mt-2 text-xl font-black">CPF/CNPJ e email</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Comissão</div>
              <div className="mt-2 text-xl font-black">5% promocional</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Segurança</div>
              <div className="mt-2 text-xl font-black">Banimento por fraude</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h2 className="text-3xl font-black">Cadastro</h2>

          <p className="mt-2 text-slate-400">
            Preencha seus dados para criar sua conta.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Nome completo
              </label>
              <input
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email
              </label>
              <input
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[140px_1fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Documento
                </label>
                <select
                  value={documentoTipo}
                  onChange={(e) => {
                    setDocumentoTipo(e.target.value);
                    setDocumento("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Número
                </label>
                <input
                  placeholder={
                    documentoTipo === "cpf"
                      ? "Digite seu CPF"
                      : "Digite seu CNPJ"
                  }
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Senha
              </label>
              <input
                type="password"
                placeholder="Crie uma senha com no mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Tipo de conta
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="freelancer">Freelancer</option>
                <option value="contratante">Contratante</option>
              </select>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
              <p className="font-bold text-yellow-300">Termos de segurança</p>

              <label className="mt-4 flex gap-3">
                <input
                  type="checkbox"
                  checked={aceiteTermos}
                  onChange={(e) => setAceiteTermos(e.target.checked)}
                />
                <span>Aceito os Termos de Uso da FreellaBrasil.</span>
              </label>

              <label className="mt-3 flex gap-3">
                <input
                  type="checkbox"
                  checked={aceiteComissao}
                  onChange={(e) => setAceiteComissao(e.target.checked)}
                />
                <span>
                  Estou ciente da comissão promocional de 5% sobre projetos
                  concluídos.
                </span>
              </label>

              <label className="mt-3 flex gap-3">
                <input
                  type="checkbox"
                  checked={aceiteConduta}
                  onChange={(e) => setAceiteConduta(e.target.checked)}
                />
                <span>
                  Concordo que fraude, desrespeito, tentativa de golpe,
                  assédio, discriminação ou conduta abusiva pode gerar banimento
                  imediato.
                </span>
              </label>
            </div>

            <button
              onClick={cadastrar}
              disabled={carregando}
              className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
            >
              {carregando ? "Cadastrando..." : "Criar conta"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold text-emerald-300">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
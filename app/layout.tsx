import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freellabrasil.com.br"),

  title: {
    default: "FreellaBrasil | Marketplace de Freelancers",
    template: "%s | FreellaBrasil",
  },

  description:
    "Encontre freelancers especializados em Power BI, Excel, Python, Automação, Desenvolvimento Web, Design, Marketing e muito mais.",

  keywords: [
    "freelancer",
    "freelancers brasil",
    "power bi",
    "excel",
    "python",
    "automação",
    "dashboard",
    "desenvolvedor",
    "design",
  ],

  openGraph: {
    title: "FreellaBrasil",
    description:
      "Marketplace profissional de freelancers do Brasil.",

    url: "https://www.freellabrasil.com.br",

    siteName: "FreellaBrasil",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],

    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FreellaBrasil",
    description:
      "Marketplace profissional de freelancers.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white">

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <img
                src="/logo.png"
                alt="FreellaBrasil"
                className="h-10 w-auto"
              />

              <span className="text-2xl font-black">
                FreellaBrasil
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">

              <Link
                href="/projetos"
                className="text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Projetos
              </Link>

              <Link
                href="/freelancers"
                className="text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Freelancers
              </Link>

              <Link
                href="/planos"
                className="text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Planos
              </Link>

            </nav>

            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                style={{ color: "white" }}
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-black text-slate-950 transition hover:scale-[1.02]"
              >
                Criar conta
              </Link>

            </div>

          </div>
        </header>

        {children}

        <footer className="mt-20 border-t border-white/10 bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-black">
                FreellaBrasil
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Marketplace profissional de freelancers do Brasil.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">

              <Link href="/planos">
                Planos
              </Link>

              <Link href="/projetos">
                Projetos
              </Link>

              <Link href="/login">
                Login
              </Link>

              <Link href="/cadastro">
                Cadastro
              </Link>

            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}
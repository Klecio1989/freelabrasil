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
  openGraph: {
    title: "FreellaBrasil",
    description: "Marketplace profissional de freelancers do Brasil.",
    url: "https://www.freellabrasil.com.br",
    siteName: "FreellaBrasil",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreellaBrasil",
    description: "Marketplace profissional de freelancers.",
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-14 w-44 items-center justify-center rounded-md bg-white p-2">
                <img
                  src="/logo-freellabrasil.png"
                  alt="FreellaBrasil"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link href="/projetos" className="font-bold text-slate-200 hover:text-white">
                Projetos
              </Link>

              <Link href="/freelancers" className="font-bold text-slate-200 hover:text-white">
                Freelancers
              </Link>

              <Link href="/planos" className="font-bold text-slate-200 hover:text-white">
                Planos
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t border-white/10 bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                <span className="text-white">Freella</span>
                <span className="text-emerald-400">Brasil</span>
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Marketplace profissional de freelancers do Brasil.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <Link href="/planos">Planos</Link>
              <Link href="/projetos">Projetos</Link>
              <Link href="/login">Login</Link>
              <Link href="/cadastro">Cadastro</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
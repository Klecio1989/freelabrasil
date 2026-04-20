import { Suspense } from "react";
import NovaPropostaClient from "./NovaPropostaClient";

type PageProps = {
  searchParams: Promise<{ projeto_id?: string }>;
};

export default async function NovaPropostaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const projetoId = params?.projeto_id || "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-10 text-white">
          Carregando...
        </div>
      }
    >
      <NovaPropostaClient projetoId={projetoId} />
    </Suspense>
  );
}
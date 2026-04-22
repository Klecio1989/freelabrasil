export const dynamic = "force-dynamic";

import AvaliarClient from "./AvaliarClient";

type PageProps = {
  searchParams: Promise<{
    proposta_id?: string;
    freelancer_id?: string;
  }>;
};

export default async function AvaliarPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <AvaliarClient
      propostaId={params.proposta_id || ""}
      freelancerId={params.freelancer_id || ""}
    />
  );
}
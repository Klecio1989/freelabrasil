import ChatClient from "./ChatClient";

type PageProps = {
  searchParams: Promise<{
    proposta_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ChatPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return <ChatClient propostaId={params.proposta_id || ""} />;
}
import ChatClient from "../ChatClient";

type Props = {
  params: {
    id: string;
  };
};

export default function ChatPage({ params }: Props) {
  return <ChatClient propostaId={params.id} />;
}
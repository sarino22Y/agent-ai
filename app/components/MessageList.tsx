import { Message } from "../types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Historique des conversations</h2>
      {messages.map((msg, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-gray-200 rounded bg-gray-50"
        >
          <p className="font-medium">
            Prompt ({msg.task} - {msg.model}):
          </p>
          <p className="text-gray-700">{msg.prompt}</p>
          <p className="font-medium mt-2">Réponse :</p>
          <p className="text-gray-700 whitespace-pre-wrap">{msg.response}</p>
        </div>
      ))}
    </div>
  );
}
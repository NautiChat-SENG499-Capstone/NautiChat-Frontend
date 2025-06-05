// components/ChatBubble.tsx
type Message  = {
  role: "user" | "bot";
  content: string;
}

export default function ChatBubble({ role, content }: Message) {
  const isUser = role === "user";
  return (
    <div
      className={`max-w-xl px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
        isUser
          ? "ml-auto bg-blue-500 text-white"
          : "mr-auto bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
      }`}
    >
      {content}
    </div>
  );
}

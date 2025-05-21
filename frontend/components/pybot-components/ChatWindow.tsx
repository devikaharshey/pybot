import { RefObject } from "react";
import MarkdownMessage from "@/components/pybot-components/MarkdownMessage";
import { Message } from "@/lib/types";

interface Props {
  chatHistory: Message[];
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement>;
  chatMode: string;
}

export default function ChatWindow({ chatHistory, loading, bottomRef, chatMode }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      <div className="p-4 flex flex-col flex-grow overflow-y-auto scrollbar-hidden space-y-4">
        {chatHistory.map((msg, idx) => {
          const isVoice = chatMode === "voice";

          if (msg.sender === "user" && isVoice) {
            return (
              <div
                key={idx}
                className="w-full bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-yellow-100 p-4 rounded-xl prose prose-sm dark:prose-invert"
              >
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-300 mb-2">
                  🎙️ Voice Transcript
                </p>
                <p>{msg.text}</p>
              </div>
            );
          }

          if (msg.sender === "user") {
            return (
              <div
                key={idx}
                className="inline-block text-base max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ml-auto mb-4 bg-gray-200 dark:bg-gray-600/30 rounded-xl p-3 whitespace-pre-wrap break-words"
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="prose dark:prose-invert max-w-[85%] sm:max-w-[75%] md:max-w-[65%] mb-4"
            >
              <MarkdownMessage text={msg.text} isBot={true} />
            </div>
          );
        })}

        {loading && chatMode === "text" && (
          <div className="px-4 py-2 text-md animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

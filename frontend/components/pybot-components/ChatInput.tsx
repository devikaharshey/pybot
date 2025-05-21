import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import AnimatedSpan from "../AnimatedSpan";

type Props = {
  question: string;
  setQuestion: (val: string) => void;
  askQuestion: () => void;
  loading: boolean;
};

export default function ChatInput({
  question,
  setQuestion,
  askQuestion,
  loading,
}: Props) {
  return (
    <div className="relative p-4 w-full md:w-1/2 mx-auto">
      <div className="relative rounded-3xl">
        <AnimatedSpan />
        <div className="relative z-10 flex items-center gap-2 border rounded-3xl px-4 py-2 bg-white/80 shadow-sm shadow-black/40 dark:shadow-white/30 dark:bg-gray-600/30">
          <Textarea
            placeholder="Ask PyBot"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              const textarea = e.target as HTMLTextAreaElement;
              textarea.style.height = "auto";
              textarea.style.height = `${Math.min(
                textarea.scrollHeight,
                110
              )}px`;
            }}
            rows={1}
            className="flex-grow border-none resize-none focus:ring-0 focus-visible:ring-0 bg-transparent"
          />
          <Button
            onClick={askQuestion}
            disabled={loading}
            size="icon"
            className="rounded-full w-10 h-10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

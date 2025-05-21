import { useState } from "react";
import { Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy code"
      className="absolute top-2 right-2 bg-zinc-700 hover:bg-zinc-600
                 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100
                 transition-opacity"
    >
      <Copy size={16} className={copied ? "text-green-400" : "text-white"} />
    </button>
  );
}

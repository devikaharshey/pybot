"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "highlight.js/styles/github-dark.css";
import CopyButton from "../ui/CopyButton";
import { getCodeString } from "@/lib/getCodeString";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import rehypeHighlight from "rehype-highlight";

type Props = {
  text: string;
  className?: string;
  isBot?: boolean;
};

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function MarkdownMessage({
  text,
  className = "",
  isBot = false,
}: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div
      className={`prose prose-neutral dark:prose-invert break-words ${className}`}
    >
      {isBot ? (
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre({ children }) {
              const codeText = getCodeString(children).replace(/\n$/, "");
              return (
                <div className="bg-zinc-900 rounded-md overflow-hidden my-4 border border-zinc-800">
                  <div className="group relative flex flex-row items-center justify-between bg-zinc-800 px-4 py-3 text-xs font-mono text-zinc-300">
                    <span>python</span>
                    <CopyButton text={codeText} />
                  </div>
                  <pre className="overflow-x-auto p-4">{children}</pre>
                </div>
              );
            },
            code({ inline, children, ...props }: CodeProps) {
              if (inline) {
                return (
                  <code
                    className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className="px-1 py-0.5 rounded bg-zinc-300 dark:bg-zinc-600"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            ul({ children }) {
              return (
                <ul className="list-disc list-outside my-2">{children}</ul>
              );
            },
            ol({ children }) {
              return (
                <ol className="list-decimal list-outside my-2">{children}</ol>
              );
            },
            li({ children }) {
              return <li className="my-1">{children}</li>;
            },
            h1({ children }) {
              return (
                <h1 className="text-3xl font-bold mt-6 mb-2">{children}</h1>
              );
            },
            h2({ children }) {
              return (
                <h2 className="text-2xl font-bold mt-5 mb-2">{children}</h2>
              );
            },
            h3({ children }) {
              return (
                <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
              );
            },
            p({ children }) {
              return <p className="my-2">{children}</p>;
            },
          }}
        >
          {text}
        </ReactMarkdown>
      ) : (
        <div>{text}</div>
      )}
    </div>
  );
}

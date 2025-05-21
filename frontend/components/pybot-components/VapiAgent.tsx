"use client";
import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { motion, AnimatePresence } from "framer-motion";

interface VapiAgentProps {
  userId: string;
  onTranscriptComplete: (transcript: string) => void;
}

export default function VapiAgent({ onTranscriptComplete }: VapiAgentProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptBuffer = useRef<string[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [liveCaption, setLiveCaption] = useState<string>("");

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    vapiRef.current = vapi;

    vapi.on("message", (data) => {
      const transcript = data.transcript;
      if (transcript) {
        transcriptBuffer.current.push(transcript);
        setLiveCaption(transcript); 
      }
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startCall = () => {
    transcriptBuffer.current = [];
    setLiveCaption("");
    vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_AGENT_ID!);
    setIsCalling(true);
  };

  const stopCall = () => {
    vapiRef.current?.stop();
    setIsCalling(false);

    const finalTranscript = transcriptBuffer.current.join(" ").trim();
    if (finalTranscript) {
      onTranscriptComplete(finalTranscript);
    }

    transcriptBuffer.current = [];
    setLiveCaption(""); 
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4 mb-4 w-full max-w-xl">
      <div className="relative w-full h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {isCalling && liveCaption && (
            <motion.div
              key={liveCaption}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 text-center text-md font-bold text-gray-700/[50%] dark:text-gray-200/[50%] italic"
            >
              {liveCaption}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <button
          onClick={startCall}
          className="flex px-4 py-2 gap-3 bg-green-600 text-white rounded-full disabled:bg-green-600/50"
          disabled={isCalling}
        >
          {!isCalling ? `Start Voice Chat` : <span className="animate-pulse">Ongoing Voice Chat</span>}
          {isCalling && (
            <span className="relative flex h-4 w-4 m-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
          )}
        </button>
        <button
          onClick={stopCall}
          className="px-4 py-2 bg-red-600 text-white rounded-full disabled:opacity-50"
          disabled={!isCalling}
        >
          End Voice Chat
        </button>
      </div>
    </div>
  );
}

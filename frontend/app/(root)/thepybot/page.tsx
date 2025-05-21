"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "@/components/pybot-components/Sidebar";
import Header from "@/components/pybot-components/Header";
import ChatWindow from "@/components/pybot-components/ChatWindow";
import ChatInput from "@/components/pybot-components/ChatInput";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/pybot-components/ConfirmModal";
import RenameModal from "@/components/pybot-components/RenameModal";
import SaveModal from "@/components/pybot-components/SaveModal";
import { Message, SessionType, ThemeType, ChatList } from "@/lib/types";
import WelcomeText from "@/components/pybot-components/WelcomeText";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import VapiAgent from "@/components/pybot-components/VapiAgent";

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeType>("system");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sessionToRename, setSessionToRename] = useState<string | null>(null);
  const [sessionToSave, setSessionToSave] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"text" | "voice">("text");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    $id: string;
    [key: string]: unknown;
  } | null>(null);

  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;
  const bottomRef = useRef<HTMLDivElement>(null!);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const applyTheme = (theme: ThemeType) => {
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: ThemeType =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
      } catch {
        router.push("/sign-up");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    account.get().catch(() => router.push("/sign-up"));
  }, [router]);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeType) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemThemeChangeHandler = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", systemThemeChangeHandler);
    return () =>
      mediaQuery.removeEventListener("change", systemThemeChangeHandler);
  }, [theme]);

  const fetchSessions = useCallback(
    async (uid: string) => {
      try {
        const res = await axios.get(`${API_BASE}/api/chats?user_id=${uid}`);
        const sessionArray = Object.entries(res.data as ChatList).map(
          ([id, chat]) => ({ id, name: chat.name || "", chat: chat.chat })
        );
        setSessions(sessionArray);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    },
    [API_BASE]
  );

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setUserId(userData.$id);
        fetchSessions(userData.$id);
      } catch {
        router.push("/log-in");
      }
    };

    initializeUser();
  }, [router, fetchSessions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRename = (id: string) => {
    setSessionToRename(id);
    setNewSessionName("");
    setShowRenameModal(true);
  };

  const handleSave = (id: string) => {
    setSessionToSave(id);
    setShowSaveModal(true);
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await axios.delete(`${API_BASE}/api/chats/${sessionToDelete}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
      if (sessionId === sessionToDelete) {
        setSessionId(null);
        setChatHistory([]);
      }
      setToast({ message: "Chat deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to delete session", error);
    } finally {
      setShowConfirm(false);
      setSessionToDelete(null);
      setShowMenu(null);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || !userId) return;

    const userMessage = { sender: "user" as const, text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, {
        question,
        session_id: sessionId,
        user_id: userId,
      });

      const botMessage = { sender: "bot" as const, text: res.data.answer };
      setChatHistory((prev) => [...prev, botMessage]);
      if (!sessionId) setSessionId(res.data.session_id);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong." },
      ]);
    }

    setQuestion("");
    setLoading(false);
  };

  const signOut = async () => {
    try {
      await account.get();
      await account.deleteSession("current");
      router.push("/log-in");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 401
      ) {
        router.push("/log-in");
      } else {
        console.error("Sign out failed:", error);
        setToast({ message: "Sign out failed.", type: "error" });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        {...{
          sessions,
          setSessionId,
          setChatHistory,
          setSidebarOpen,
          showMenu,
          setShowMenu,
          handleRename,
          handleSave,
          setShowConfirm,
          setSessionToDelete,
          sidebarOpen,
          dropdownRef,
        }}
      />
      <main className="flex-1 flex flex-col bg-white dark:bg-black max-h-screen overflow-hidden">
        <Header
          {...{
            setChatHistory,
            setSessionId,
            sidebarOpen,
            setSidebarOpen,
            setChatMode,
            chatMode,
            toggleTheme,
            theme,
            signOut,
            user,
          }}
        />

        <div className="flex flex-col items-center justify-start flex-1 overflow-auto scrollbar-hidden px-4">
          {!chatHistory.length && !question.length && chatMode === "text" && (
            <WelcomeText />
          )}

          <ChatWindow {...{ chatHistory, loading, bottomRef, chatMode }} />
          <div
            className={`${
              chatHistory.length || question.length
                ? "sticky bottom-0 bg-white dark:bg-black"
                : ""
            } w-full`}
          >
            {chatMode === "text" ? (
              <ChatInput {...{ question, setQuestion, askQuestion, loading }} />
            ) : (
              userId && (
                <div className="flex justify-center mt-2">
                  <VapiAgent
                    userId={userId}
                    onTranscriptComplete={async (transcript: string) => {
                      const userMessage = {
                        sender: "user" as const,
                        text: transcript,
                      };
                      setChatHistory((prev) => [...prev, userMessage]);

                      let currentSessionId = sessionId;
                      if (!currentSessionId) {
                        currentSessionId = crypto.randomUUID();
                        setSessionId(currentSessionId);
                      }

                      setLoading(true);

                      try {
                        if (chatMode === "voice") {
                          await axios.post(`${API_BASE}/api/save-transcript`, {
                            transcript,
                            session_id: currentSessionId,
                            user_id: userId,
                          });
                        } else {
                          const res = await axios.post(`${API_BASE}/api/chat`, {
                            question: transcript,
                            session_id: currentSessionId,
                            user_id: userId,
                          });

                          const botMessage = {
                            sender: "bot" as const,
                            text: res.data.answer,
                          };
                          setChatHistory((prev) => [...prev, botMessage]);
                          if (!sessionId) setSessionId(res.data.session_id);
                        }
                      } catch (error) {
                        console.error(error);
                        setChatHistory((prev) => [
                          ...prev,
                          { sender: "bot", text: "Something went wrong." },
                        ]);
                      }

                      setLoading(false);
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </main>
      <Toast toast={toast} />
      <ConfirmModal {...{ showConfirm, setShowConfirm, handleDelete }} />
      <RenameModal
        {...{
          showRenameModal,
          newSessionName,
          setNewSessionName,
          setShowRenameModal,
          sessionToRename,
          sessions,
          setSessions,
          setShowMenu,
          setToast,
        }}
      />
      <SaveModal
        {...{
          showSaveModal,
          setShowSaveModal,
          sessionToSave,
          sessions,
          setToast,
        }}
      />
    </div>
  );
}

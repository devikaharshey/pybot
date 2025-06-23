"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { account } from "@/lib/appwrite";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  FileText,
  FileDown,
} from "lucide-react";
import { ThemeType } from "@/lib/types";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import AnimatedSpan from "@/components/AnimatedSpan";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Toast from "@/components/ui/Toast";
import pdfMake from "@/lib/pdfmakeSetup";

const MarkdownMessage = dynamic(
  () => import("@/components/pybot-components/MarkdownMessage"),
  {
    ssr: false,
  }
);

type MarkdownSection = { title: string; content: string };
type CollapseState = Record<string, boolean>;

const parseMarkdownSections = (markdown: string): MarkdownSection[] => {
  const sectionRegex = /^#{2,6}\s+(.*)$/gm;
  const matches = [...markdown.matchAll(sectionRegex)];

  if (matches.length === 0) {
    return [{ title: "Dashboard", content: markdown }];
  }

  const sections: MarkdownSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end =
      i + 1 < matches.length ? matches[i + 1].index! : markdown.length;
    const title = matches[i][1].trim();
    const content = markdown.slice(start + matches[i][0].length, end).trim();

    sections.push({ title, content });
  }

  return sections;
};

export default function DashboardPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeType>("system");
  const [user, setUser] = useState<{
    name: string;
    $id: string;
    prefs?: { profileImage?: string };
  } | null>(null);
  const [collapseState, setCollapseState] = useState<CollapseState>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeType) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme]);

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

  const renderThemeIcon = () => {
    if (theme === "light") return <Moon />;
    if (theme === "dark") return <Laptop />;
    return <Sun />;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      let userId: string | null = null;

      try {
        const userData = await account.get();
        userId = userData?.$id;
        setUser(userData);
        localStorage.setItem("user_id", userId);
      } catch {
        userId = localStorage.getItem("user_id");
        if (!userId) {
          setMarkdown("Please log in to view your personalized dashboard.");
          setLoading(false);
          return;
        }
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/dashboard?user_id=${userId}`
        );
        const newMarkdown = res.data.markdown || "No personalized data yet.";
        if (!markdown.trim()) {
          setMarkdown(newMarkdown);
        }
      } catch {
        setMarkdown("Failed to load personalized data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [API_BASE, markdown]);

  useEffect(() => {
    if (!markdown.trim()) return;
    const saved = localStorage.getItem("dashboardCollapseState");
    const parsed = saved ? (JSON.parse(saved) as CollapseState) : {};
    const initial: CollapseState = {};
    parseMarkdownSections(markdown)
      .forEach((s, i) => {
        initial[s.title] = parsed[s.title] ?? i === 0;
      });
    setCollapseState(initial);
  }, [markdown]);

  useEffect(() => {
    if (Object.keys(collapseState).length) {
      localStorage.setItem(
        "dashboardCollapseState",
        JSON.stringify(collapseState)
      );
    }
  }, [collapseState]);

  const toggleOne = (title: string) =>
    setCollapseState((cs) => ({ ...cs, [title]: !cs[title] }));

  const setAll = (open: boolean) =>
    setCollapseState((cs) =>
      Object.fromEntries(Object.keys(cs).map((k) => [k, open]))
    );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  const downloadMarkdown = () => {
    if (!markdown.trim()) {
      setToast({ message: "No dashboard content to download.", type: "error" });
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const username =
      user?.name?.replace(/\s+/g, "_").toLowerCase() || "anonymous";
    const filename = `dashboard_${username}_${timestamp}.md`;

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    setToast({ message: `Downloaded as ${filename}`, type: "success" });
  };

  const downloadPDF = () => {
    if (!markdown.trim()) {
      setToast({ message: "No dashboard content to download.", type: "error" });
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const username =
      user?.name?.replace(/\s+/g, "_").toLowerCase() || "anonymous";
    const filename = `dashboard_${username}_${timestamp}.pdf`;

    const docDefinition = {
      content: markdown
        .split("\n")
        .map((line) => ({ text: line, margin: [0, 4] })),
      defaultStyle: {
        font: "Roboto",
        fontSize: 12,
      },
    };

    pdfMake.createPdf(docDefinition).download(filename);
    setToast({ message: `Downloaded as ${filename}`, type: "success" });
  };

  return (
    <main className="relative flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
      <Toast toast={toast} />
      <div
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto scrollbar-hidden"
        ref={dashboardRef}
      >
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AnimatedSpan />
                <AvatarImage
                  src={user?.prefs?.profileImage || "/default-avatar.png"}
                  alt={user.name || "User"}
                />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user.name}
              </span>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={downloadMarkdown}
              variant="outline"
              className="z-10"
            >
              <FileText className="w-4 h-4 mr-1" />Save Markdown
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="z-10">
              <FileDown className="w-4 h-4 mr-1" />Save PDF
            </Button>
            <Button onClick={() => router.push("/thepybot")} className="z-10">
              PyBot
            </Button>
            <Button
              onClick={toggleTheme}
              size="icon"
              className="rounded-full z-10"
            >
              {renderThemeIcon()}
            </Button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          <AnimatedGradientText className="text-3xl font-bold">
            Your Personalized Dashboard
          </AnimatedGradientText>
        </h1>

        {Object.keys(collapseState).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const anyOpen = Object.values(collapseState).some(Boolean);
              setAll(!anyOpen);
            }}
            className="mb-4"
          >
            {Object.values(collapseState).some(Boolean) ? (
              <>
                <Minus className="mr-1 h-4 w-4" /> Collapse all
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Expand all
              </>
            )}
          </Button>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {parseMarkdownSections(markdown)
              .map((section, idx) => {
                const isOpen = collapseState[section.title];

                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-md"
                  >
                    <div
                      onClick={() => toggleOne(section.title)}
                      className="flex items-center justify-between cursor-pointer select-none pl-5"
                    >
                      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                        {section.title}
                      </h2>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isOpen ? (
                          <ChevronDown className="text-zinc-500" />
                        ) : (
                          <ChevronRight className="text-zinc-500" />
                        )}
                      </motion.div>
                    </div>

                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="pl-5"
                      >
                        <MarkdownMessage text={section.content} isBot />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
          </>
        )}
      </div>
    </main>
  );
}

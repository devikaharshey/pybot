"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { account } from "@/lib/appwrite";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Laptop, Moon, Sun } from "lucide-react";
import { ThemeType } from "@/lib/types";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import AnimatedSpan from "@/components/AnimatedSpan";
import dynamic from "next/dynamic";

const MarkdownMessage = dynamic(
  () => import("@/components/pybot-components/MarkdownMessage"),
  { ssr: false }
);

type MarkdownSection = {
  title: string;
  content: string;
};

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

  const router = useRouter();

  const API_BASE = "http://localhost:5000";

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
        setMarkdown(res.data.markdown || "No personalized data yet.");
      } catch {
        setMarkdown("Failed to load personalized data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [API_BASE]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <main className="relative flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
      <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto scrollbar-hidden">
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

        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          <AnimatedGradientText className="text-3xl font-bold">
            Your Personalized Dashboard
          </AnimatedGradientText>
        </h1>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading your personalized dashboard...
          </p>
        ) : (
          <>
            {parseMarkdownSections(markdown).map((section, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-md overflow-x-auto scrollbar-none"
              >
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2 pl-5">
                  {section.title}
                </h2>
                <MarkdownMessage
                  text={section.content}
                  isBot
                  className="pl-5"
                />
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}

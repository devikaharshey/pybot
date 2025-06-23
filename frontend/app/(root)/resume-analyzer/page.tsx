"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResumeAnalyzer from "@/components/pybot-components/ResumeAnalyzer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowBigLeft, Laptop, Moon, Sun } from "lucide-react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import AnimatedSpan from "@/components/AnimatedSpan";
import { ThemeType } from "@/lib/types";
import { account } from "@/lib/appwrite";

export default function ResumePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    $id: string;
    prefs?: { profileImage?: string };
  } | null>(null);
  const [theme, setTheme] = useState<ThemeType>("system");

  const applyTheme = (theme: ThemeType) => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

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
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        localStorage.setItem("user_id", userData?.$id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <main className="h-screen bg-white dark:bg-black px-4 py-6 overflow-y-auto scrollbar-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            {user && (
              <>
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
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push("/thepybot")}><ArrowBigLeft className="w-5 h-5"/> Back</Button>
            <Button
              onClick={toggleTheme}
              size="icon"
              className="rounded-full"
              title="Toggle Theme"
            >
              {renderThemeIcon()}
            </Button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          <AnimatedGradientText>Resume Analyzer</AnimatedGradientText>
        </h1>

        <ResumeAnalyzer />
      </div>
    </main>
  );
}

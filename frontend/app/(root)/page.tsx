"use client";

import React, { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Laptop, Moon, Sun } from "lucide-react";
import { ThemeType } from "@/lib/types";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import Link from "next/link";
import AnimatedSpan from "@/components/AnimatedSpan";
import Hero from "@/components/home-components/Hero";
import KnowMore from "@/components/home-components/KnowMore";
import TechStack from "@/components/home-components/TechStack";
import HowItWorks from "@/components/home-components/HowItWorks";
import RegisterNow from "@/components/home-components/RegisterNow";
import Footer from "@/components/home-components/Footer";

const Page = () => {
  const [theme, setTheme] = useState<ThemeType>("system");
  type User = {
    name?: string;
    email?: string;
    prefs?: { profileImage?: string };
    [key: string]: unknown;
  };
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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
    const systemThemeChangeHandler = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", systemThemeChangeHandler);
    return () =>
      mediaQuery.removeEventListener("change", systemThemeChangeHandler);
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch {
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  return (
    <main className="relative flex flex-col bg-white dark:bg-black h-screen overflow-y-scroll scroll-smooth scrollbar-hidden">
      <div className="flex flex-col items-end justify-between px-4 py-4 bg-white dark:bg-black">
        <Link href="/thepybot" className="group relative mx-auto mt-15 lg:mt-4 flex items-center justify-center rounded-full px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-300/[80%] dark:hover:bg-gray-600/[80%] transition-all duration-300 ease-in-out z-10">
          <AnimatedSpan />
          <AnimatedGradientText className="text-sm font-medium">
            Try PyBot Now !
          </AnimatedGradientText>
        </Link>

        {user && (
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Avatar>
              <AnimatedSpan />
              <AvatarImage
                src={user?.prefs?.profileImage || "/default-avatar.png"}
                alt={user.name || "User"}
              />
              <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user.name}
            </span>
          </div>
        )}

        <Button onClick={toggleTheme} size="icon" className="fixed rounded-full z-10">
          {renderThemeIcon()}
        </Button>
      </div>
      <Hero />
      <KnowMore />
      <HowItWorks />
      <TechStack />
      <RegisterNow />
      <Footer />
    </main>
  );
};

export default Page;

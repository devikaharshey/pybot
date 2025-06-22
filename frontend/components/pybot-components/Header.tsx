"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Laptop, LogOut, Plus } from "lucide-react";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";
import AnimatedSpan from "../AnimatedSpan";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Props = {
  setChatHistory: (val: []) => void;
  setSessionId: (val: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  setChatMode: (val: "text" | "voice") => void;
  chatMode: "text" | "voice";
  toggleTheme: () => void;
  theme: "light" | "dark" | "system";
  signOut: () => void;
  user: {
    name?: string;
    email?: string;
    prefs?: { profileImage?: string };
    [key: string]: unknown;
  } | null;
};

export default function Header({
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
}: Props) {
  const renderThemeIcon = () => {
    if (theme === "light") return <Moon />;
    if (theme === "dark") return <Laptop />;
    return <Sun />;
  };

  const router = useRouter();

  return (
    <div className="flex items-start justify-between px-4 py-4">
      {!sidebarOpen ? (
        <Button
          onClick={() => setSidebarOpen(true)}
          size="icon"
          title="Open Sidebar"
          aria-label="Open Sidebar"
          className="z-50 rounded-full delay-60 transition-all duration-300 ease-in-out"
        >
          <Menu />
        </Button>
      ) : (
        <Button
          onClick={() => setSidebarOpen(false)}
          size="icon"
          title="Close Sidebar"
          aria-label="Close Sidebar"
          className="ml-49 z-50 rounded-full border bg-white/30 dark:bg-gray-600/30 border-gray-600/30 dark:border-white/30 hover:bg-white/30 hover:border-gray-600/30 delay-60 transition-all duration-300 ease-in-out"
        >
          <X className="text-black dark:text-white" />
        </Button>
      )}

      {user && (
        <div className="flex absolute left-1/2 transform -translate-x-1/2 items-center gap-2">
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

      <div className="absolute left-1/2 transform -translate-x-1/2 mt-13">
        <button
          onClick={() => setChatMode(chatMode === "text" ? "voice" : "text")}
          className="border px-4 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-300/[80%] dark:hover:bg-gray-600/[80%] transition-all duration-300 ease-in-out flex items-center gap-2"
        >
          <AnimatedSpan />
          <AnimatedGradientText>
            Switch to {chatMode === "text" ? "Voice" : "Text"} Chat
          </AnimatedGradientText>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 z-50">
        <Button
          onClick={toggleTheme}
          size="icon"
          title="Toggle Theme"
          aria-label="Toggle Theme"
          className="rounded-full"
        >
          {renderThemeIcon()}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              title="Actions"
              aria-label="More Actions"
              className="rounded-full"
            >
              <Plus className="text-white dark:text-black" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                setChatHistory([]);
                setSessionId(null);
              }}
            >
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/resume-analyzer")}>
              Resume Analyzer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/quiz")}>
              Quiz & Progress
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={signOut}
          size="icon"
          title="Log Out"
          aria-label="Log Out"
          className="rounded-full"
        >
          <LogOut className="text-white dark:text-black" />
        </Button>
      </div>
    </div>
  );
}

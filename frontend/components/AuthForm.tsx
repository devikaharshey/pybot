"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import Toast from "./ui/Toast";
import AnimatedSpan from "./AnimatedSpan";

interface AuthFormProps {
  type: "log-in" | "sign-up";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedTheme =
      (localStorage.getItem("theme") as "light" | "dark" | "system") ||
      "system";

    if (storedTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (type === "sign-up") {
        const userId = ID.unique();
        await account.create(userId, email, password);
        await account.createEmailPasswordSession(email, password);
        await account.updateName(username);
        await account.createVerification(
          "https://pybot-ecru.vercel.app//verify"
        );
        setToast({
          message:
            "Account created successfully! Please check your inbox to verify your email before logging in.",
          type: "success",
        });
        await account.deleteSession("current");
        setTimeout(() => {
          router.push("/log-in");
        }, 5000);
      } else {
        await account.createEmailPasswordSession(email, password);
        router.push("/thepybot");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
    setLoading(false);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {toast && <Toast toast={toast} />}

      <form
        onSubmit={handleSubmit}
        className={`relative overflow-hidden rounded-lg shadow-md p-8 w-full max-w-md transition-colors ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
        noValidate
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {type === "sign-up" ? "Create an Account" : "Log In to Your Account"}
        </h2>

        {error && (
          <p
            className={`mb-4 p-3 rounded font-medium ${
              isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
            }`}
          >
            {error}
          </p>
        )}

        {type === "sign-up" && (
          <>
            <label htmlFor="username" className="block mb-1 font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={`w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 transition ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
          </>
        )}

        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={`w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 transition ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-400"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
        />

        <label htmlFor="password" className="block mb-1 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={
            type === "sign-up" ? "new-password" : "current-password"
          }
          className={`w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring-2 transition ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-400"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          }`}
        >
          {loading
            ? type === "sign-up"
              ? "Creating Account..."
              : "Logging In..."
            : type === "sign-up"
            ? "Sign Up"
            : "Log In"}
        </button>
        <AnimatedSpan />
      </form>

      <div className="mt-4 text-center">
        {type === "sign-up" ? (
          <p>
            Already have an account?{" "}
            <a
              href="/log-in"
              className="text-indigo-500 hover:text-indigo-400 font-semibold"
            >
              Log In
            </a>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="text-indigo-500 hover:text-indigo-400 font-semibold"
            >
              Sign Up
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;

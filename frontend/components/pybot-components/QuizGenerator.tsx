"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, FileText, FileDown } from "lucide-react";

import pdfMake from "@/lib/pdfmakeSetup";

type QuizQuestion = {
  question: string;
  options: string[];
};

export default function QuizGenerator() {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);

  const fetchQuiz = async () => {
    const user_id = localStorage.getItem("user_id");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-quiz?user_id=${user_id}`
    );
    const data = await res.json();
    setQuiz(data.questions || []);
    setScore(null);
    setAnswers({});
  };

  const handleSubmit = async () => {
    const user_id = localStorage.getItem("user_id");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/submit-quiz`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, answers }),
      }
    );
    const data = await res.json();
    setScore(data.score);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("quiz-updated"));
    }
  };

  const resetQuiz = async () => {
    const user_id = localStorage.getItem("user_id");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reset-quiz`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      }
    );

    if (res.ok) {
      setQuiz([]);
      setAnswers({});
      setScore(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quiz-updated"));
      }
    } else {
      alert("Failed to reset quiz.");
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const generateMarkdown = () => {
    if (quiz.length === 0) return "";

    let md = "# Quiz Questions\n\n";
    quiz.forEach((q, i) => {
      md += `## Question ${i + 1}\n`;
      md += `${q.question}\n\n`;
      q.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isSelected = answers[i] === letter;
        md += `${isSelected ? "**" : ""}${letter}) ${opt}${
          isSelected ? "**" : ""
        }\n`;
      });
      md += "\n";
    });

    if (score !== null) {
      md += `**Your Score: ${score} / ${quiz.length}**\n`;
    }

    return md;
  };

  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    if (!markdown) {
      alert("No quiz data to download.");
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `quiz_${timestamp}.md`;

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const markdown = generateMarkdown();
    if (!markdown) {
      alert("No quiz data to download.");
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `quiz_${timestamp}.pdf`;

    const docDefinition = {
      content: markdown
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          if (line.startsWith("# "))
            return {
              text: line.replace("# ", ""),
              style: "header1",
              margin: [0, 10, 0, 5],
            };
          if (line.startsWith("## "))
            return {
              text: line.replace("## ", ""),
              style: "header2",
              margin: [0, 8, 0, 4],
            };
          if (line.startsWith("**") && line.endsWith("**"))
            return {
              text: line.replace(/\*\*/g, ""),
              bold: true,
              margin: [0, 5, 0, 5],
            };
          return { text: line, margin: [0, 2, 0, 2] };
        }),
      styles: {
        header1: { fontSize: 22, bold: true },
        header2: { fontSize: 18, bold: true },
      },
      defaultStyle: { fontSize: 12 },
    };

    pdfMake.createPdf(docDefinition).download(filename);
  };

  return (
    <div className="mb-6 p-6 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Knowledge Quiz</h2>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={fetchQuiz}>Generate Quiz</Button>

          {quiz.length > 0 && (
            <Button variant="destructive" onClick={resetQuiz}>
              Reset
            </Button>
          )}
        </div>

        {quiz.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={downloadMarkdown}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Save Markdown
            </Button>

            <Button
              variant="outline"
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Save PDF
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((q, i) => (
          <Card
            key={i}
            className="border-zinc-300 dark:border-zinc-700 shadow-sm transition hover:shadow-md"
          >
            <CardContent className="p-4">
              <p className="font-semibold mb-3">
                {i + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const selected = answers[i] === letter;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(i, letter)}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left rounded-xl border transition 
                        ${
                          selected
                            ? "bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200"
                            : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        }`}
                    >
                      <span className="w-6 h-6 flex items-center justify-center flex-none">
                        {selected ? (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-400" />
                        )}
                      </span>

                      <span>
                        <strong>{letter})</strong> {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {quiz.length > 0 && (
        <div className="mt-6 text-center">
          <Button onClick={handleSubmit} className="px-6 py-2 text-base">
            Submit Quiz
          </Button>
        </div>
      )}
      {score !== null && (
        <div className="mt-6 text-center text-xl font-semibold text-green-600 dark:text-green-400">
          🏆 Your Score: {score} / {quiz.length}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import MarkdownMessage from "@/components/pybot-components/MarkdownMessage";
import { FileText, FileDown } from "lucide-react";
import Toast from "@/components/ui/Toast";
import pdfMake from "@/lib/pdfmakeSetup";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    const user_id = localStorage.getItem("user_id");
    formData.append("user_id", user_id || "");

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-resume`,
        formData
      );
      setResult(res.data.feedback);
    } catch {
      setResult("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const now = new Date();
    const filename = `resume_analysis_${now
      .toISOString()
      .slice(0, 19)
      .replace(/[:.]/g, "-")}.md`;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: `Downloaded as ${filename}`, type: "success" });
  };

  const downloadPDF = () => {
    if (!result) return;

    const now = new Date();
    const filename = `resume_analysis_${now
      .toISOString()
      .slice(0, 19)
      .replace(/[:.]/g, "-")}.pdf`;

    const docDefinition = {
      content: result
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          if (line.startsWith("## "))
            return {
              text: line.replace("## ", ""),
              style: "header2",
              margin: [0, 6, 0, 4],
            };
          if (line.startsWith("**") && line.endsWith("**"))
            return { text: line.replace(/\*\*/g, ""), bold: true };
          return { text: line, margin: [0, 2, 0, 2] };
        }),
      styles: {
        header2: { fontSize: 18, bold: true },
      },
      defaultStyle: { fontSize: 12 },
    };

    pdfMake.createPdf(docDefinition).download(filename);
    setToast({ message: `Downloaded as ${filename}`, type: "success" });
  };

  return (
    <div className="mb-6 p-8 border rounded-2xl bg-zinc-50 dark:bg-zinc-900">
      <Toast toast={toast} />
      <h2 className="text-2xl font-bold mb-2">Resume ATS Analyzer</h2>

      <div className="mb-4">
        <label
          htmlFor="resume-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Upload Resume
        </label>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        {file && (
          <p className="mt-2 text-green-600 text-sm font-medium">
            Uploaded: <span className="underline">{file.name}</span>
          </p>
        )}
      </div>

      <Button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </Button>

      {result && (
        <>
          <div className="mt-4">
            <MarkdownMessage text={result} isBot />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="outline" onClick={downloadMarkdown}>
              <FileText className="w-4 h-4 mr-1" />
              Save Markdown
            </Button>
            <Button variant="outline" onClick={downloadPDF}>
              <FileDown className="w-4 h-4 mr-1" />
              Save PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

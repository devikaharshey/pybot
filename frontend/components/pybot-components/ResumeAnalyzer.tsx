"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import MarkdownMessage from "@/components/pybot-components/MarkdownMessage";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="mb-6 p-8 border rounded-2xl bg-zinc-50 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold mb-2">📄 Resume ATS Analyzer</h2>
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
        <div className="mt-4">
          <MarkdownMessage text={result} isBot />
        </div>
      )}
    </div>
  );
}

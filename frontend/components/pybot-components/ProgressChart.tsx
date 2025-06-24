"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

type ProgressChartProps = {
  deleteButton?: React.ReactNode;
};

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProgressChart({ deleteButton }: ProgressChartProps) {
  const [data, setData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  const [legendColor, setLegendColor] = useState("#374151");

  const fetchData = async () => {
    const user_id = localStorage.getItem("user_id");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/progress-chart?user_id=${user_id}`
    );
    const parsed = await res.json();
    setData(parsed);
  };

  const updateLegendColor = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setLegendColor(isDark ? "#f3f4f6" : "#374151");
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("quiz-updated", fetchData);

    updateLegendColor();

    const observer = new MutationObserver(updateLegendColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("quiz-updated", fetchData);
      observer.disconnect();
    };
  }, []);

  const correct = data.values[0] || 0;
  const total = data.values.reduce((acc, val) => acc + val, 0);
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ["#22c55e", "#ef4444"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: legendColor,
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.parsed || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative mb-6 p-6 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Progress</h2>
      <div className="relative w-64 h-64 mx-auto overflow-hidden">
        <Pie data={chartData} options={chartOptions} />
      </div>
      {total > 0 && (
        <span className="block text-center mt-4 text-md font-bold text-gray-800 dark:text-gray-200">
          Current Progress: {percentage}%
        </span>
      )}
      <div className="flex justify-center mt-4">{deleteButton}</div>
    </div>
  );
}

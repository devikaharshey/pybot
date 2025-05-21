"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";
import {
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const features = [
  {
    title: "Master Python, End to End",
    description:
      "From syntax to advanced concepts—PyBot guides you hands-on, with a laser focus on Python. No distractions, just pure learning. It's like having a personal tutor available 24/7.",
    icon: <BookOpen size={32} />,
    className: "col-span-1 row-span-1 md:col-span-2",
  },
  {
    title: "Voice & Text Chat",
    description:
      "Chat by voice or text—PyBot listens and speaks with the help of Vapi, providing an immersive, interactive learning experience.",
    icon: <MessageSquare size={32} />,
    className: "col-span-1 row-span-1",
  },
  {
    title: "Build a Job-Winning Resume",
    description:
      "Get AI-assisted resume tips, structure suggestions, and examples tailored for Python developers.",
    icon: <FileText size={32} />,
    className: "col-span-1 row-span-1",
  },
  {
    title: "Powered by Vapi",
    description:
      "Vapi powers PyBot's voice agent, enabling natural, real-time conversations that feel human. It's voice AI at its finest.",
    icon: (
      <Image
        src="/vapi-logo.png"
        alt="Vapi Logo"
        className="h-6 w-auto"
        width={40}
        height={16}
      />
    ),
    className: "col-span-1 row-span-1",
  },
  {
    title: "Perfect for Self-Learners & Students",
    description:
      "Whether you're learning on your own or in school, PyBot acts as a reliable, always-available mentor.",
    icon: <GraduationCap size={32} />,
    className: "col-span-1 row-span-1",
  },
];

const KnowMore = () => {
  const [flipped, setFlipped] = useState(Array(features.length).fill(false));

  const toggleFlip = (index: number) => {
    setFlipped((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

  return (
    <section
      className="flex flex-col items-center justify-center w-full pt-20 md:pt-28 my-10 px-4 md:px-10 bg-white dark:bg-black"
      id="know-more"
    >
      <div className="flex flex-col items-center justify-center mb-12 text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white">
          Why Choose <AnimatedGradientText>PyBot?</AnimatedGradientText>
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Flip the cards to know more!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,_1fr)] gap-6 w-full max-w-5xl">
        {features.map((feature, idx) => (
          <div
            key={idx}
            onClick={() => toggleFlip(idx)}
            className={`${feature.className} perspective cursor-pointer`}
          >
            <motion.div
              className={clsx(
                "relative w-full h-full transition-transform duration-700 preserve-3d",
                flipped[idx] && "rotate-y-180"
              )}
            >
              {/* Front */}
              <Card className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 border border-black/[30%] dark:border-white/[30%]">
                <div className="mb-4 text-primary">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-center">
                  <AnimatedGradientText>{feature.title}</AnimatedGradientText>
                </h3>
              </Card>

              {/* Back */}
              <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 border-2 border-black/[30%] dark:border-white/[30%] bg-gray-200 dark:bg-gray-900">
                <p className="text-md text-center text-black dark:text-white">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KnowMore;

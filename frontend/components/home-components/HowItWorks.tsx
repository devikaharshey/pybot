"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { GridPattern } from "../magicui/grid-pattern";

const steps = [
  {
    title: "Sign Up & Get Started",
    description:
      "Create your free PyBot account to unlock voice and text chat powered by Vapi. Start your Python journey effortlessly.",
  },
  {
    title: "Chat by Voice or Text",
    description:
      "Ask your Python questions via voice or text. PyBot listens, understands, and responds naturally with real-time help.",
  },
  {
    title: "Learn, Practice & Grow",
    description:
      "Use PyBot's interactive sessions to debug, get explanations, and build confidence—all at your own pace.",
  },
];

const HowItWorks = () => {
  return (
    <section
      className="flex flex-col items-center justify-center w-full pt-20 md:pt-28 my-10 px-4 md:px-10 bg-white dark:bg-black"
      id="how-it-works"
    >
      <div className="flex flex-col items-center justify-center mb-12 text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white">
          How <AnimatedGradientText>PyBot</AnimatedGradientText> Works?
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl w-full mt-10">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative h-full"
          >
            <div
              className={cn(
                "relative p-[2px] rounded-2xl animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] h-full"
              )}
            >
              <div className="rounded-2xl bg-white dark:bg-black h-full flex flex-col">
                <GridPattern className="absolute top-0 left-0 w-full h-full opacity-70 dark:opacity-50" />
                <Card className="h-full rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-2xl md:text-3xl lg:text-4xl text-center font-extrabold rounded-full h-12 w-12 md:h-14 md:w-14 pt-2 bg-gray-200 dark:bg-gray-800 text-primary select-none aspect-square">
                      <AnimatedGradientText>{idx + 1}</AnimatedGradientText>
                    </div>
                    <CardTitle className="text-3xl md:text-xl lg:text-4xl font-bold text-black dark:text-white">
                      <AnimatedGradientText>{step.title}</AnimatedGradientText>
                    </CardTitle>
                  </div>

                  <CardContent className="p-0 mt-auto">
                    <p className="text-muted-foreground text-base text-left">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;

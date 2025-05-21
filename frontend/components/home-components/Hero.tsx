import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GridPattern } from "../magicui/grid-pattern";
import { TextAnimate } from "../magicui/text-animate";
import { RainbowButton } from "../magicui/rainbow-button";

const Hero = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleImageClick = () => {
    setShowDialog(true);
    setTimeout(() => setShowDialog(false), 1500);
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center w-full px-4 md:px-10 pt-16 pb-20 md:pt-24 md:pb-32 bg-white dark:bg-black"
      id="home"
    >
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        <div className="hidden md:flex w-full items-center justify-center gap-12">
          <div className="text-left">
            <h1 className="font-bold text-black dark:text-white leading-tight">
              <span className="block pl-10 text-6xl">
                <TextAnimate animation="slideUp" by="word">PRESENTING</TextAnimate>
              </span>
              <span className="block text-9xl mt-2">
                <TextAnimate animation="slideUp" by="word">PYBOT</TextAnimate>
              </span>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            onClick={handleImageClick}
            className="relative w-64 h-64 md:w-72 md:h-72 lg:w-96 lg:h-96 cursor-pointer transition-transform"
          >
            <Image
              src="/pybot.png"
              alt="PyBot"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />

            <AnimatePresence>
              {showDialog && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-1/2 transform -translate-x-1/2 -top-6 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20"
                >
                  Hi! I&apos;m PyBot 👋
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex flex-col items-center md:hidden text-center">
          <h1 className="font-bold text-black dark:text-white leading-tight">
            <span className="block text-4xl">
              <TextAnimate animation="slideUp" by="word">PRESENTING</TextAnimate>
            </span>
            <span className="block text-6xl mt-2">
              <TextAnimate animation="slideUp" by="word">PYBOT</TextAnimate>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            onClick={handleImageClick}
            className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mt-6 cursor-pointer transition-transform"
          >
            <Image
              src="/pybot.png"
              alt="PyBot"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />

            <AnimatePresence>
              {showDialog && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-1/2 transform -translate-x-1/2 -top-6 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20"
                >
                  Hi! I&apos;m PyBot 👋
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <TextAnimate
          animation="fadeIn"
          by="character"
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-2xl"
        >
          Your AI-powered assistant for Python Programming!
        </TextAnimate>

        <div className="mt-10">
          <RainbowButton variant="outline">
            <a href="#know-more">Want To Know More?</a>
          </RainbowButton>
        </div>
      </div>
    </section>
  );
};

export default Hero;

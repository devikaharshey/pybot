'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TextAnimate } from '../magicui/text-animate';
import { RainbowButton } from '../magicui/rainbow-button';
import { AnimatedGradientText } from '../magicui/animated-gradient-text';

const RegisterNow = () => {
  return (
    <section
      className="flex flex-col items-center justify-center w-full pt-20 md:pt-28 my-10 px-4 md:px-10 bg-white dark:bg-black"
      id="register-now"
    >
      <div
        className={cn(
          "w-full max-w-4xl rounded-3xl px-8 py-12 text-center text-white",
          "bg-gradient-to-r from-[#ffaa40]/80 via-[#9c40ff]/80 to-[#ffaa40]/80",
          "bg-[length:300%_100%] animate-gradient shadow-lg"
        )}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          <TextAnimate animate="slideUp" by="word">
            So What Are You Waiting For?
          </TextAnimate>
        </h1>
        <div className="mt-10">
          <RainbowButton
            variant="outline"
            className="h-12 px-6 text-lg font-semibold rounded-full border-2 bg-white/10 backdrop-blur-md text-white"
          >
            <a href="/sign-up">
              <AnimatedGradientText>Sign Up Now!</AnimatedGradientText>
            </a>
          </RainbowButton>
        </div>
      </div>
    </section>
  );
};

export default RegisterNow;

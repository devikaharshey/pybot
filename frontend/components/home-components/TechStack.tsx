"use client";

import React from "react";
import Image from "next/image";
import { Marquee } from "@/components/magicui/marquee";

const techStackItems = [
  { name: "VAPI", filename: "vapi.png" },
  { name: "APPWRITE", filename: "appwrite.png" },
  { name: "NEXT.JS", filename: "nextjs.png" },
  { name: "PYTHON", filename: "python.png" },
  { name: "OPENROUTER API", filename: "open-router.png" },
];

const TechStack = () => {
  return (
    <section
      className="flex flex-col items-center justify-center w-full pt-20 md:pt-28 my-10 px-4 md:px-10 bg-white dark:bg-black"
      id="tech-stack"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black/[40%] dark:text-white/[40%]">
        Heroes Behind The Scene
      </h2>
      <div className="w-full overflow-hidden mask-fade">
        <Marquee pauseOnHover className="w-full flex items-center">
          {techStackItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center mx-6"
              style={{ opacity: 0.4 }}
            >
              <Image
                src={`/${item.filename}`}
                alt={item.name}
                width={90}
                height={90}
                className="mb-2 dark:invert"
              />
            </div>
          ))}
        </Marquee>
      </div>

      <style jsx>{`
        .mask-fade {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
        }
      `}</style>
    </section>
  );
};

export default TechStack;

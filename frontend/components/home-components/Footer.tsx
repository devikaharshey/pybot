"use client";

import React from "react";
import Image from "next/image";
import { Dock, DockIcon } from "@/components/magicui/dock";
import Link from "next/link";

const Footer = () => {
  return (
    <section
      className="flex flex-col items-center justify-center w-full gap-6 pt-20 md:pt-28 my-10 px-4 md:px-10 bg-white dark:bg-black"
      id="register-now"
    >
      <Dock className="z-10">
        <DockIcon>
          <Link href="https://github.com/devikaharshey" target="_blank">
            <Image
              src="/github.svg"
              alt="GitHub"
              width={24}
              height={24}
              className="object-contain dark:invert opacity-80"
            />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link
            href="https://www.linkedin.com/in/devika-harshey-b4b961290"
            target="_blank"
          >
            <Image
              src="/linkedin.svg"
              alt="LinkedIn"
              width={24}
              height={24}
              className="object-contain dark:invert opacity-80"
            />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link
            href="https://tinyurl.com/discord-devikaharshey"
            target="_blank"
          >
            <Image
              src="/discord.svg"
              alt="Discord"
              width={24}
              height={24}
              className="object-contain dark:invert opacity-80"
            />
          </Link>
        </DockIcon>
      </Dock>

      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl gap-2">
        <p className="text-md text-gray-600 dark:text-gray-400">
          Made with ❤️ by Devika
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400">
          &copy; 2025 PyBot. All rights reserved.
        </p>
      </div>
    </section>
  );
};

export default Footer;

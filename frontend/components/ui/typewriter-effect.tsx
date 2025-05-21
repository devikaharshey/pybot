"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";

export const TypewriterEffect = ({
    words,
    className,
}: {
    words: {
        text: string;
        className?: string;
    }[];
    className?: string;
    cursorClassName?: string;
}) => {
    const [scope, animate] = useAnimate();
    const isInView = useInView(scope);

    useEffect(() => {
        if (isInView) {
            animate(
                ".typewriter-text",
                {
                    width: "100%",
                },
                {
                    duration: 2,
                    ease: "easeInOut",
                }
            );
        }
    }, [isInView, animate]);

    const fullText = words.map((w) => w.text).join(" ");
    const combinedClassNames = words.map((w) => w.className).join(" ");

    return (
        <div className={cn("text-center", className)}>
            <motion.div ref={scope} className="inline-block overflow-hidden whitespace-nowrap">
                <motion.span
                    className={cn(
                        "typewriter-text inline-block opacity-100 whitespace-nowrap overflow-hidden",
                        combinedClassNames
                    )}
                    style={{
                        width: 0,
                    }}
                >
                    <AnimatedGradientText>{fullText}</AnimatedGradientText><span className="inline-block animate-wave origin-[70%_70%]">👋</span>
                </motion.span>
            </motion.div>
        </div>
    );
};

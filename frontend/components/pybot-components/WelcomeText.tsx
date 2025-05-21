import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function WelcomeText() {
  return (
    <div className="text-center mb-10 mt-20">
      <h1 className="text-2xl md:text-3xl font-semibold">
        <TypewriterEffect
          words={[
            { text: "Hey" },
            { text: "there!" },
            { text: "It's" },
            { text: "PyBot" },
            { text: "here" },
          ]}
        />
      </h1>
    </div>
  );
}

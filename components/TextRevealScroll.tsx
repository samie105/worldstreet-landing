"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

const text = "Simplicity, performance, and security, empowering you to navigate the digital world with confidence and agility.";

export default function TextRevealScroll() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"],
  });

  const words = text.split(" ");

  return (
    <section 
      ref={containerRef} 
      className="pt-10 pb-8 md:pt-20 md:pb-16 px-6 flex justify-center items-center bg-transparent relative z-10"
    >
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-[26px] md:text-[34px] lg:text-[40px] font-medium tracking-tight flex flex-wrap justify-center leading-[1.1] md:leading-[1.15] gap-x-2 md:gap-x-2.5 gap-y-1 md:gap-y-0.5">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + (1 / words.length);
            
            return (
              <Word key={i} word={word} progress={scrollYProgress} range={[start, end]} />
            );
          })}
        </h2>
      </div>
    </section>
  );
}

function Word({ word, progress, range }: { word: string, progress: any, range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.08, 1]);
  const blurVal = useTransform(progress, range, [4, 0]);
  const filter = useMotionTemplate`blur(${blurVal}px)`;
  
  return (
    <span className="relative inline-block">
      <span className="absolute opacity-0 text-white">{word}</span>
      <motion.span style={{ opacity, filter }} className="text-white relative z-10 inline-block">
        {word}
      </motion.span>
    </span>
  );
}

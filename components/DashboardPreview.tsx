"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function DashboardPreview() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 95%", "center center"],
  });

  // Calculate the 3D tilt and scaling parameters based on scroll
  const rotateX = useTransform(scrollYProgress, [0, 1], [35, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  return (
    <section 
      ref={containerRef} 
      className="w-full px-6 flex justify-center pb-24 md:pb-32 bg-transparent relative z-10"
    >
      <div 
        style={{ perspective: "1200px" }} 
        className="w-full max-w-[1240px] mx-auto flex justify-center"
      >
        <motion.div
          style={{ 
            rotateX, 
            scale, 
            opacity,
            y,
            transformStyle: "preserve-3d" 
          }}
          className="w-full border border-white/[0.08] bg-[#0a0a0a] overflow-hidden"
        >
          {/* Subtle top inner glow for a premium feel mimicking the physical grid line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <img 
            src="/landing-page-image.png" 
            alt="Platform Dashboard Preview" 
            className="w-full h-auto object-cover block" 
            // Handle error visually if the image isn't available yet
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='600' viewBox='0 0 100%25 600'%3E%3Crect width='100%25' height='600' fill='%230a0a0a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23333333'%3Edashboard.png (Placeholder)%3C/text%3E%3C/svg%3E";
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

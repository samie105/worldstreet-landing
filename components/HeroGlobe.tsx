"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; z: number; size: number; opacity: number }[] = [];
    const STAR_COUNT = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize stars
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        // Slow drift to simulate parallax movement
        star.y -= star.z * 0.15;
        star.x -= star.z * 0.05;

        // Wrap around
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        if (star.x < 0) star.x = canvas.width;

        // Twinkle
        const twinkle = Math.sin(Date.now() * 0.001 + star.x) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}

export default function HeroGlobe() {
  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-screen bg-[#050505] after:absolute after:inset-x-0 after:bottom-0 after:h-40 after:bg-gradient-to-t after:from-[#050505] after:to-transparent after:z-20 after:pointer-events-none">
      {/* Animated star field background */}
      <StarField />

      {/* Earth Video — full-width, anchored to bottom, clipped */}
      <div className="absolute bottom-[-30%] md:bottom-[-70%] left-1/2 -translate-x-1/2 w-[min(1600px,160vw)] aspect-square z-[1] pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="/earth.mp4"
        />
        {/* Only fade at the bottom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,transparent_38%,#050505_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#050505] to-transparent" />
      </div>

      {/* Accent yellow dot */}
      <div className="absolute top-[20%] left-[54%] w-1.5 h-1.5 rounded-full bg-[#FFCC2D] animate-pulse z-[2]" />

      {/* Hero Content — centered, above the video */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 mb-[28vh]">
        <p className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-7">Introducing WorldStreet Ecosystem</p>

        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 pb-1 leading-[1.08]">
          Welcome to the<br />new world economy
        </h1>

        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-9 leading-relaxed font-body">
          Join millions to securely trade crypto and fiat on a multi-sector digital ecosystem
          built to empower individuals and businesses worldwide.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="px-6 py-3 rounded-full bg-[#FFCC2D] text-black font-semibold text-sm hover:bg-white hover:box-glow transition-all duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            Get Started Now
          </Link>
          <Link href="/#pricing" className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300">
            See Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

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
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-screen bg-[#050505]">
      {/* Animated star field background */}
      <StarField />

      {/* Earth Video - Centered, sized appropriately */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[min(750px,90vw)] aspect-square z-[1] pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-full"
          src="/earth.mp4"
        />
        {/* Edge fade to seamlessly blend into the dark background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050505_70%)] rounded-full" />
      </div>

      {/* Accent green dot */}
      <div className="absolute top-[18%] left-[6%] w-1.5 h-1.5 rounded-full bg-[#bdff00] animate-pulse z-[2]" />

      {/* Hero Content - Foreground, overlapping lower part of globe */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 mt-[30vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#bdff00] box-glow animate-pulse" />
          <span className="text-xs font-medium text-gray-300">Introducing Worldstreet Ecosystem</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 pb-1 leading-[1.1]">
          Welcome to the new <br /> world economy
        </h1>

        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed font-body">
          Join millions to securely trade crypto and fiat on a multi-sector digital ecosystem
          built to empower individuals and businesses worldwide.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="px-6 py-3 rounded-full bg-[#bdff00] text-black font-semibold text-sm hover:bg-white hover:box-glow transition-all duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            Get Started Now
          </button>

          <button className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300">
            See Pricing
          </button>
        </div>
      </div>
    </div>
  );
}

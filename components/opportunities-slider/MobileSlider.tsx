"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { slides } from "./slides-data";

const GAP = 16;

export default function MobileSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const isScrollingRef = useRef(false);
  const total = slides.length;
  const maxSteps = total - 1;

  /* measure one card = full container width */
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      setCardWidth(containerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* map vertical scroll → horizontal translateX */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || cardWidth === 0) return;

    const onScroll = () => {
      if (isScrollingRef.current) return;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const idx = Math.min(maxSteps, Math.round(progress * maxSteps));
      setCurrent(idx);
      track.style.transform = `translateX(-${progress * maxSteps * (cardWidth + GAP)}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [cardWidth, maxSteps]);

  /* programmatic navigation via arrows / dots */
  const scrollToSlide = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const clamped = Math.max(0, Math.min(maxSteps, index));
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = maxSteps > 0 ? clamped / maxSteps : 0;

      isScrollingRef.current = true;
      setCurrent(clamped);

      if (trackRef.current && cardWidth > 0) {
        trackRef.current.style.transition =
          "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
        trackRef.current.style.transform = `translateX(-${clamped * (cardWidth + GAP)}px)`;
        setTimeout(() => {
          if (trackRef.current) trackRef.current.style.transition = "";
        }, 500);
      }

      window.scrollTo({
        top: sectionTop + progress * scrollable,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [maxSteps, cardWidth],
  );

  return (
    <section ref={sectionRef} className="relative z-10 bg-[#050505]">
      <div className="h-[400vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          {/* Title */}
          <div className="text-center mb-10 px-6">
            <h2 className="text-3xl font-medium tracking-tight mb-4">
              One Platform,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-600">
                Multiple Opportunities
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-body text-[15px]">
              Access a comprehensive suite of financial services and tools
              perfectly synced under one roof.
            </p>
          </div>

          {/* Slider area */}
          <div className="relative px-4">
            <button
              onClick={() => scrollToSlide(current - 1)}
              aria-label="Previous"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <div ref={containerRef} className="overflow-hidden mx-6">
              <div
                ref={trackRef}
                className="flex will-change-transform"
                style={{ gap: `${GAP}px` }}
              >
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    className="shrink-0 relative rounded-2xl overflow-hidden h-[420px] group"
                    style={{
                      width: cardWidth > 0 ? cardWidth : undefined,
                      minWidth: cardWidth > 0 ? cardWidth : undefined,
                    }}
                  >
                    {/* BG image */}
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      sizes="100vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      priority={i < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                    {slide.comingSoon && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#F4845F] text-white text-[11px] font-bold tracking-widest uppercase">
                        Coming Soon
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 p-6 w-full z-10">
                      <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-[11px] font-semibold tracking-wider text-gray-300 uppercase leading-relaxed mb-5">
                        {slide.description}
                      </p>
                      <Link
                        href={slide.href}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFCC2D] hover:bg-[#FFCC2D]/90 text-black text-sm font-bold transition-colors"
                      >
                        <span>→</span> Enter
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollToSlide(current + 1)}
              aria-label="Next"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

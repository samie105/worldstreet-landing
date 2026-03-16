"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Cryptocurrencies",
    description: "TRADE CFDS ON POPULAR CRYPTOCURRENCIES INCLUDING BITCOIN, ETHEREUM, RIPPLE AND LITECOIN AGAINST THE WORLD'S DOMINANT CURRENCIES AND BUILD YOUR CRYPTO PORTFOLIO",
    image: "/attachments/crypto.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Vivid AI",
    description: "AI-POWERED TRADING DECISIONS AND MARKET ANALYSIS. LET ARTIFICIAL INTELLIGENCE GUIDE YOUR TRADING STRATEGY",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    href: "/register",
    comingSoon: true,
  },
  {
    title: "e-Commerce",
    description: "ACCESS OUR PRODUCT MARKETPLACE. BUY AND SELL DIGITAL AND PHYSICAL GOODS IN OUR GROWING ECOSYSTEM",
    image: "/attachments/ecommerce.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Forex Markets",
    description: "TRADE MAJOR AND MINOR CURRENCY PAIRS WITH TIGHT SPREADS, NAIRA DEPOSITS, AND $50 MINIMUM TO START",
    image: "/attachments/forex.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Xtreme",
    description: "ENTERTAINMENT AND STREAMING PLATFORM. ACCESS EXCLUSIVE CONTENT AND CONNECT WITH THE COMMUNITY",
    image: "/attachments/streaming.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Community",
    description: "JOIN THE CONVERSATION. CONNECT WITH FELLOW TRADERS, SHARE INSIGHTS, AND PARTICIPATE IN DISCUSSIONS TO GROW TOGETHER",
    image: "/attachments/community-bg.jpg",
    href: "/register",
    comingSoon: false,
  },
];

const GAP = 16; // gap-4 = 16px

export default function OpportunitiesSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const isScrollingRef = useRef(false);
  const total = slides.length;

  // Get number of visible cards and max steps based on viewport
  const getLayout = useCallback(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const visibleCount = isMobile ? 1 : 3;
    const maxSteps = total - visibleCount;
    return { visibleCount, maxSteps, isMobile };
  }, [total]);

  // Scroll-driven horizontal animation
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      const { maxSteps } = getLayout();

      // Compute card index and translate
      const cardIndex = Math.min(maxSteps, Math.round(progress * maxSteps));
      setCurrent(cardIndex);

      const firstCard = track.children[0] as HTMLElement | undefined;
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth;
      const translateX = progress * maxSteps * (cardWidth + GAP);
      track.style.transform = `translateX(-${translateX}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [total, getLayout]);

  // Control buttons scroll the page to the corresponding position
  const scrollToSlide = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const { maxSteps } = getLayout();
      const clampedIndex = Math.max(0, Math.min(maxSteps, index));

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = sectionHeight - viewportHeight;

      const progress = maxSteps > 0 ? clampedIndex / maxSteps : 0;
      const scrollTarget = sectionTop + progress * scrollableDistance;

      isScrollingRef.current = true;
      setCurrent(clampedIndex);

      window.scrollTo({ top: scrollTarget, behavior: "smooth" });

      // Release scroll lock after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [getLayout]
  );

  const prev = () => scrollToSlide(current - 1);
  const next = () => scrollToSlide(current + 1);

  return (
    <section ref={sectionRef} className="relative z-10 bg-[#050505]">
      {/* Tall wrapper — creates vertical scroll room for horizontal animation */}
      {/* Mobile: 6 steps × 60vh, Desktop: 4 steps × 60vh */}
      <div className="h-[360vh] md:h-[240vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          {/* Title */}
          <div className="text-center mb-10 md:mb-16 px-6">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
              One Platform,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-600">
                Multiple Opportunities
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-body text-[15px]">
              Access a comprehensive suite of financial services and tools perfectly synced under one roof.
            </p>
          </div>

          {/* Slider */}
          <div className="relative max-w-[1300px] mx-auto px-4 sm:px-10">
            {/* Prev */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Cards track — all cards in a horizontal row */}
            <div className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-4 will-change-transform"
              >
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] relative rounded-2xl overflow-hidden h-[420px] md:h-[480px] group"
                  >
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                    {/* Coming Soon badge */}
                    {slide.comingSoon && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#F4845F] text-white text-[11px] font-bold tracking-widest uppercase">
                        Coming Soon
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-6 w-full z-10">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
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

            {/* Next */}
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Dot indicators */}
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

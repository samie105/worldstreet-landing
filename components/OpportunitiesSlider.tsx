"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Cryptocurrencies",
    description:
      "TRADE CFDS ON POPULAR CRYPTOCURRENCIES INCLUDING BITCOIN, ETHEREUM, RIPPLE AND LITECOIN AGAINST THE WORLD'S DOMINANT CURRENCIES AND BUILD YOUR CRYPTO PORTFOLIO",
    image: "/attachments/crypto.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Vivid AI",
    description:
      "AI-POWERED TRADING DECISIONS AND MARKET ANALYSIS. LET ARTIFICIAL INTELLIGENCE GUIDE YOUR TRADING STRATEGY",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    href: "/register",
    comingSoon: true,
  },
  {
    title: "e-Commerce",
    description:
      "ACCESS OUR PRODUCT MARKETPLACE. BUY AND SELL DIGITAL AND PHYSICAL GOODS IN OUR GROWING ECOSYSTEM",
    image: "/attachments/ecommerce.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Forex Markets",
    description:
      "TRADE MAJOR AND MINOR CURRENCY PAIRS WITH TIGHT SPREADS, NAIRA DEPOSITS, AND $50 MINIMUM TO START",
    image: "/attachments/forex.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Xtreme",
    description:
      "ENTERTAINMENT AND STREAMING PLATFORM. ACCESS EXCLUSIVE CONTENT AND CONNECT WITH THE COMMUNITY",
    image: "/attachments/streaming.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Community",
    description:
      "JOIN THE CONVERSATION. CONNECT WITH FELLOW TRADERS, SHARE INSIGHTS, AND PARTICIPATE IN DISCUSSIONS TO GROW TOGETHER",
    image: "/attachments/community-bg.jpg",
    href: "/register",
    comingSoon: false,
  },
];

/* ─── Shared sub-components ─── */

function SlideCard({ slide }: { slide: (typeof slides)[number] }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      {slide.comingSoon && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#F4845F] text-white text-[11px] font-bold tracking-widest uppercase">
          Coming Soon
        </div>
      )}

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
    </>
  );
}

function SectionTitle() {
  return (
    <div className="text-center mb-10 md:mb-16 px-6">
      <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
        One Platform,
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-600">
          Multiple Opportunities
        </span>
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto font-body text-[15px]">
        Access a comprehensive suite of financial services and tools perfectly
        synced under one roof.
      </p>
    </div>
  );
}

function DotIndicators({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 h-2 bg-white"
              : "w-2 h-2 bg-white/30 hover:bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Shared constant ─── */

const GAP = 16;

/* ─── Mobile: scroll-driven carousel (1 card at a time) ─── */

function MobileSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const isScrollingRef = useRef(false);
  const total = slides.length;
  const maxSteps = total - 1; // 1 card visible at a time

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setCardWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || cardWidth === 0) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      const idx = Math.min(maxSteps, Math.round(progress * maxSteps));
      setCurrent(idx);
      track.style.transform = `translateX(-${progress * maxSteps * (cardWidth + GAP)}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cardWidth, maxSteps]);

  const scrollToSlide = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const clamped = Math.max(0, Math.min(maxSteps, index));
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = section.offsetHeight - window.innerHeight;
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
        top: sectionTop + progress * scrollableDistance,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [maxSteps, cardWidth]
  );

  return (
    <section ref={sectionRef} className="relative z-10 bg-[#050505] md:hidden">
      {/* tall wrapper: 1 card at a time × 6 slides → needs ~400vh of scroll room */}
      <div className="h-[400vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <SectionTitle />

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
                className="flex gap-4 will-change-transform"
              >
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    style={{
                      width: cardWidth > 0 ? `${cardWidth}px` : undefined,
                      minWidth: cardWidth > 0 ? `${cardWidth}px` : undefined,
                    }}
                    className="shrink-0 relative rounded-2xl overflow-hidden h-[420px] group"
                  >
                    <SlideCard slide={slide} />
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

          <DotIndicators
            current={current}
            total={slides.length}
            onSelect={scrollToSlide}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Desktop: scroll-driven horizontal animation ─── */

function DesktopSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const isScrollingRef = useRef(false);
  const total = slides.length;
  const visibleCount = 3;
  const maxSteps = total - visibleCount;

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setCardWidth((containerRef.current.offsetWidth - GAP * 2) / 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || cardWidth === 0) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const progress = Math.max(
        0,
        Math.min(1, -rect.top / scrollableDistance)
      );
      const idx = Math.min(maxSteps, Math.round(progress * maxSteps));
      setCurrent(idx);
      track.style.transform = `translateX(-${progress * maxSteps * (cardWidth + GAP)}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cardWidth, maxSteps]);

  const scrollToSlide = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const clamped = Math.max(0, Math.min(maxSteps, index));
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = section.offsetHeight - window.innerHeight;
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
        top: sectionTop + progress * scrollableDistance,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [maxSteps, cardWidth]
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-[#050505] hidden md:block"
    >
      <div className="h-[240vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <SectionTitle />

          <div className="relative max-w-[1300px] mx-auto px-10">
            <button
              onClick={() => scrollToSlide(current - 1)}
              aria-label="Previous"
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div ref={containerRef} className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-4 will-change-transform"
              >
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    style={{
                      width: cardWidth > 0 ? `${cardWidth}px` : undefined,
                      minWidth:
                        cardWidth > 0 ? `${cardWidth}px` : undefined,
                    }}
                    className="shrink-0 relative rounded-2xl overflow-hidden h-[480px] group"
                  >
                    <SlideCard slide={slide} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollToSlide(current + 1)}
              aria-label="Next"
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <DotIndicators
            current={current}
            total={slides.length}
            onSelect={scrollToSlide}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Export: renders both, CSS toggles visibility ─── */

export default function OpportunitiesSlider() {
  return (
    <>
      <MobileSlider />
      <DesktopSlider />
    </>
  );
}

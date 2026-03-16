"use client";

import { useState } from "react";
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

const VISIBLE = 3;

export default function OpportunitiesSlider() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const visibleSlides = Array.from({ length: VISIBLE }, (_, i) => slides[(current + i) % total]);

  return (
    <section className="py-24 relative z-10 bg-[#050505] overflow-hidden">
      <div className="text-center mb-16 px-6">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
          One Platform,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-600">Multiple Opportunities</span>
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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleSlides.map((slide, position) => (
            <div
              key={`${current}-${position}`}
              className={`relative rounded-2xl overflow-hidden h-[420px] md:h-[480px] group${position > 0 ? " hidden md:block" : ""}`}
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
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{slide.title}</h3>
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
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Digital Gold.",
    subtitle: "Trade the future of finance.",
    description: "Dive deep into the world of cryptocurrency. Trade Bitcoin, Ethereum, and emerging altcoins with advanced charting tools, real-time data, and institutional-grade security. Build your digital portfolio and capitalize on market volatility all from a single unified interface.",
    image: "/attachments/bitcoin-bg.jpeg",
  },
  {
    title: "Wall Street, Pocket Sized.",
    subtitle: "Ride the market bull.",
    description: "Access global stock markets right from your fingertips. Invest in your favorite companies, track market trends, and build wealth over time. Enjoy zero-commission trading, fractional shares, and comprehensive financial reports to make informed stock market decisions.",
    image: "/attachments/bull.jpeg",
  },
  {
    title: "Trade Together.",
    subtitle: "Grow alongside the community.",
    description: "Join a thriving community of seasoned traders and ambitious beginners. Share strategies, copy top-performing portfolios, and participate in live trading sessions. Our social trading features ensure you never have to navigate the markets alone.",
    image: "/attachments/community-bg.jpg",
  },
  {
    title: "Shop the Ecosystem.",
    subtitle: "Seamless global commerce.",
    description: "A borderless marketplace built for the modern economy. Browse, buy, and sell goods globally using your trading profits or crypto balances. Experience instant settlements, unparalleled security, and a unified shopping and trading ecosystem.",
    image: "/attachments/ecommmerce.jpeg",
  },
  {
    title: "Master the Macro.",
    subtitle: "Forex trading without borders.",
    description: "Navigate global currency changes with lightning-fast execution. Trade major, minor, and exotic pairs with deep liquidity and tight spreads. Utilize advanced technical indicators and economic calendars to stay ahead of international market movements.",
    image: "/attachments/forex.jpeg",
  },
  {
    title: "Unfiltered Insights.",
    subtitle: "Listen, learn, and leverage.",
    description: "Unlock premium market analysis through exclusive podcasts, live streams, and expert articles. Stay updated on the latest financial news, listen to industry leaders, and gain the edge you need to anticipate market trends correctly.",
    image: "/attachments/streaming.jpeg",
  },
];

export default function OpportunitiesSlider() {
  const [selectedSlide, setSelectedSlide] = useState<{ slide: typeof slides[0], index: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const repeatedSlides = [...slides, ...slides, ...slides];

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

      <div className="w-full border-y border-white/[0.08] relative bg-[#050505]">
        {/* Faded edges to mask the scrolling edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee-left">
          {repeatedSlides.map((slide, i) => (
            <motion.div 
              layoutId={`card-${i}`}
              onClick={() => setSelectedSlide({ slide, index: i })}
              key={i} 
              className="relative w-[75vw] sm:w-[320px] md:w-[400px] aspect-square flex-shrink-0 group overflow-hidden border-r border-white/[0.08] cursor-pointer"
            >
              <motion.div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <motion.div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <motion.h3 layoutId={`title-${i}`} className="text-xl md:text-2xl font-bold text-white mb-1.5">{slide.title}</motion.h3>
                <p className="text-gray-300 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 font-body text-sm md:text-base">
                  {slide.subtitle}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expanded Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedSlide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedSlide(null)}
            >
              <motion.div
                layoutId={`card-${selectedSlide.index}`}
                className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-video rounded-none overflow-hidden cursor-default shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedSlide.slide.image})` }}
                />
                {/* Dark overlays for better text readability */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full z-10">
                  <motion.h3 
                    layoutId={`title-${selectedSlide.index}`} 
                    className="text-2xl sm:text-4xl font-bold text-white mb-2"
                  >
                    {selectedSlide.slide.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-200 font-body text-base sm:text-lg max-w-lg mb-2"
                  >
                    {selectedSlide.slide.subtitle}
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-gray-300 font-body text-xs sm:text-sm max-w-lg mb-6 leading-relaxed"
                  >
                    {selectedSlide.slide.description}
                  </motion.p>
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-none hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedSlide(null)}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

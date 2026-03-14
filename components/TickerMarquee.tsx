"use client";

import { motion } from "framer-motion";

const tickers = [
  { pair: "EUR/USD", price: "1.0924", change: "+0.12%" },
  { pair: "GBP/USD", price: "1.2678", change: "-0.05%" },
  { pair: "BTC/USDT", price: "64,230.50", change: "+2.45%" },
  { pair: "ETH/USDT", price: "3,450.20", change: "+1.80%" },
  { pair: "USD/JPY", price: "151.40", change: "-0.22%" },
  { pair: "GOLD/USD", price: "2,340.10", change: "+0.65%" },
];

export default function TickerMarquee() {
  // Duplicate for seamless infinite loop
  const duplicatedTickers = [...tickers, ...tickers, ...tickers];

  return (
    <div className="w-full border-y border-[rgba(255,255,255,0.05)] bg-[#0a0a0a] overflow-hidden py-4 flex relative">
      {/* Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>

      <motion.div
        className="flex whitespace-nowrap gap-12 px-6"
        animate={{
          x: ["0%", "-33.33%"], // Move by exactly one set length
        }}
        transition={{
          ease: "linear",
          duration: 15,
          repeat: Infinity,
        }}
      >
        {duplicatedTickers.map((ticker, index) => {
          const isPositive = ticker.change.startsWith("+");
          
          return (
            <div key={index} className="flex items-center gap-3 font-mono text-sm tracking-wider">
              <span className="font-semibold text-gray-300">{ticker.pair}</span>
              <span className="text-white">{ticker.price}</span>
              <span className={isPositive ? "text-[#bdff00] text-glow" : "text-red-500"}>
                {ticker.change}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

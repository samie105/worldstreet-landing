"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Crypto pairs config with CoinGecko IDs
const CRYPTO_PAIRS = [
  { id: "bitcoin", pair: "BTC/USDT", baseImg: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { id: "ethereum", pair: "ETH/USDT", baseImg: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { id: "solana", pair: "SOL/USDT", baseImg: "https://assets.coingecko.com/coins/images/4128/small/solana.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { id: "ripple", pair: "XRP/USDT", baseImg: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { id: "pax-gold", pair: "GOLD/USD", baseImg: "https://assets.coingecko.com/coins/images/9519/small/paxgold.png", quoteImg: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%234CAF50'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='18' font-weight='bold' fill='white'%3E%24%3C/text%3E%3C/svg%3E" },
];

// Forex pairs with flag images using flagcdn.com (reliable CDN)
const FOREX_PAIRS = [
  { pair: "EUR/USD", baseImg: "https://flagcdn.com/w80/eu.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "GBP/USD", baseImg: "https://flagcdn.com/w80/gb.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "USD/JPY", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/jp.png" },
  { pair: "AUD/USD", baseImg: "https://flagcdn.com/w80/au.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "USD/CAD", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/ca.png" },
  { pair: "USD/CHF", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/ch.png" },
  { pair: "NZD/USD", baseImg: "https://flagcdn.com/w80/nz.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "EUR/GBP", baseImg: "https://flagcdn.com/w80/eu.png", quoteImg: "https://flagcdn.com/w80/gb.png" },
];

interface TickerItem {
  pair: string;
  price: string;
  change: string;
  baseImg: string;
  quoteImg: string;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(4);
}

// Fallback data
const FALLBACK_TICKERS: TickerItem[] = [
  { pair: "EUR/USD", price: "1.0924", change: "+0.12%", baseImg: "https://flagcdn.com/w80/eu.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "GBP/USD", price: "1.2678", change: "-0.05%", baseImg: "https://flagcdn.com/w80/gb.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "BTC/USDT", price: "64,230.50", change: "+2.45%", baseImg: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { pair: "ETH/USDT", price: "3,450.20", change: "+1.80%", baseImg: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { pair: "USD/JPY", price: "151.40", change: "-0.22%", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/jp.png" },
  { pair: "GOLD/USD", price: "2,340.10", change: "+0.65%", baseImg: "https://assets.coingecko.com/coins/images/9519/small/paxgold.png", quoteImg: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%234CAF50'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='18' font-weight='bold' fill='white'%3E%24%3C/text%3E%3C/svg%3E" },
  { pair: "SOL/USDT", price: "142.50", change: "-0.65%", baseImg: "https://assets.coingecko.com/coins/images/4128/small/solana.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { pair: "AUD/USD", price: "0.6542", change: "+0.08%", baseImg: "https://flagcdn.com/w80/au.png", quoteImg: "https://flagcdn.com/w80/us.png" },
  { pair: "XRP/USDT", price: "0.5240", change: "+1.66%", baseImg: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", quoteImg: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { pair: "USD/CAD", price: "1.3612", change: "-0.14%", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/ca.png" },
  { pair: "EUR/GBP", price: "0.8615", change: "+0.03%", baseImg: "https://flagcdn.com/w80/eu.png", quoteImg: "https://flagcdn.com/w80/gb.png" },
  { pair: "USD/CHF", price: "0.8812", change: "-0.10%", baseImg: "https://flagcdn.com/w80/us.png", quoteImg: "https://flagcdn.com/w80/ch.png" },
  { pair: "NZD/USD", price: "0.6098", change: "+0.06%", baseImg: "https://flagcdn.com/w80/nz.png", quoteImg: "https://flagcdn.com/w80/us.png" },
];

export default function TickerMarquee() {
  const [tickers, setTickers] = useState<TickerItem[]>(FALLBACK_TICKERS);

  useEffect(() => {
    const ids = CRYPTO_PAIRS.map((p) => p.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: { id: string; current_price: number; price_change_percentage_24h: number | null }[]) => {
        const cryptoTickers: TickerItem[] = CRYPTO_PAIRS.map((cfg) => {
          const coin = data.find((d) => d.id === cfg.id);
          if (!coin) return null;
          const change = coin.price_change_percentage_24h ?? 0;
          return {
            pair: cfg.pair,
            price: formatPrice(coin.current_price),
            change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
            baseImg: cfg.baseImg,
            quoteImg: cfg.quoteImg,
          };
        }).filter((item): item is TickerItem => item !== null);

        // Merge crypto data with forex fallback data (forex pairs keep static prices)
        const forexTickers: TickerItem[] = FOREX_PAIRS.map((fx) => {
          const existing = FALLBACK_TICKERS.find((t) => t.pair === fx.pair);
          return existing ?? { pair: fx.pair, price: "—", change: "0.00%", baseImg: fx.baseImg, quoteImg: fx.quoteImg };
        });

        // Interleave crypto and forex
        const merged: TickerItem[] = [];
        const maxLen = Math.max(cryptoTickers.length, forexTickers.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < forexTickers.length) merged.push(forexTickers[i]);
          if (i < cryptoTickers.length) merged.push(cryptoTickers[i]);
        }
        if (merged.length > 0) setTickers(merged);
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless infinite loop
  const duplicatedTickers = [...tickers, ...tickers, ...tickers];

  return (
    <div className="w-full border-y border-[rgba(255,255,255,0.05)] bg-[#0a0a0a] overflow-hidden py-4 flex relative">
      {/* Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>

      <motion.div
        className="flex whitespace-nowrap gap-10 px-6"
        animate={{
          x: ["0%", "-33.33%"],
        }}
        transition={{
          ease: "linear",
          duration: 25,
          repeat: Infinity,
        }}
      >
        {duplicatedTickers.map((ticker, index) => {
          const isPositive = ticker.change.startsWith("+");
          
          return (
            <div key={index} className="flex items-center gap-3 font-mono text-sm tracking-wider">
              {/* Overlapping pair avatars */}
              <div className="flex items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#0a0a0a] overflow-hidden z-[2] relative">
                  <img src={ticker.baseImg} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#0a0a0a] overflow-hidden -ml-2 z-[1] relative">
                  <img src={ticker.quoteImg} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              </div>
              <span className="font-semibold text-gray-300">{ticker.pair}</span>
              <span className="text-white">{ticker.price}</span>
              <span className={isPositive ? "text-[#FFCC2D] text-glow" : "text-red-500"}>
                {ticker.change}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

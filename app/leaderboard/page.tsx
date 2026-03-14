"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FAQSection from "../../components/FAQSection";

/* ─── Static Data ─── */
const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: "🇳🇬",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  "United States": "🇺🇸",
  UAE: "🇦🇪",
  Japan: "🇯🇵",
  "South Africa": "🇿🇦",
  Kenya: "🇰🇪",
  Ghana: "🇬🇭",
  Singapore: "🇸🇬",
};

type Trader = {
  rank: number;
  username: string;
  country: string;
  asset: string;
  volume: number;
  isYou?: boolean;
};

const TRADERS: Trader[] = [
  { rank: 1, username: "TradeMaster_NG", country: "Nigeria", asset: "XAUUSD", volume: 847.5 },
  { rank: 2, username: "CryptoKing_UK", country: "United Kingdom", asset: "BTCUSD", volume: 723.2 },
  { rank: 3, username: "ForexPro_DE", country: "Germany", asset: "EURUSD", volume: 698.8 },
  { rank: 4, username: "IndexTrader_US", country: "United States", asset: "NAS100", volume: 542.3 },
  { rank: 5, username: "GoldRush_AE", country: "UAE", asset: "XAUUSD", volume: 498.1 },
  { rank: 6, username: "TechTrader_JP", country: "Japan", asset: "NAS100", volume: 456.7 },
  { rank: 7, username: "SwingMaster_ZA", country: "South Africa", asset: "EURUSD", volume: 389.4 },
  { rank: 8, username: "CryptoWave_KE", country: "Kenya", asset: "ETHUSD", volume: 345.2 },
  { rank: 9, username: "ScalpKing_GH", country: "Ghana", asset: "GBPUSD", volume: 312.8 },
  { rank: 10, username: "OilBaron_SG", country: "Singapore", asset: "USOIL", volume: 287.5 },
  { rank: 11, username: "MomentumX_NG", country: "Nigeria", asset: "XAUUSD", volume: 256.3 },
  { rank: 12, username: "TrendRider_US", country: "United States", asset: "SPX500", volume: 234.1 },
  { rank: 13, username: "FXWizard_GB", country: "United Kingdom", asset: "EURUSD", volume: 198.7 },
  { rank: 14, username: "DemoTrader_NG", country: "Nigeria", asset: "BTCUSD", volume: 156.4, isYou: true },
  { rank: 15, username: "AlphaSignals_DE", country: "Germany", asset: "DAX40", volume: 143.2 },
  { rank: 16, username: "PipHunter_AE", country: "UAE", asset: "XAUUSD", volume: 128.9 },
  { rank: 17, username: "MarketMind_JP", country: "Japan", asset: "USDJPY", volume: 112.5 },
  { rank: 18, username: "ChartPro_ZA", country: "South Africa", asset: "XAUUSD", volume: 98.3 },
  { rank: 19, username: "SmartMoney_KE", country: "Kenya", asset: "EURUSD", volume: 87.1 },
  { rank: 20, username: "VolumeKing_GH", country: "Ghana", asset: "GBPJPY", volume: 76.8 },
];

const ASSET_CLASSES: Record<string, string[]> = {
  "All Assets": [],
  Forex: ["EURUSD", "GBPUSD", "USDJPY", "GBPJPY"],
  Crypto: ["BTCUSD", "ETHUSD"],
  Indices: ["NAS100", "SPX500", "DAX40"],
  Commodities: ["XAUUSD", "USOIL"],
};

const COUNTRIES = ["All Countries", ...Object.keys(COUNTRY_FLAGS)];

const PRIZES = [
  { label: "Grand Prize", value: "$5,000", desc: "Cash prize for the #1 trader of the week" },
  { label: "iPhone 16 Pro", value: "$1,199", desc: "Latest iPhone 16 Pro for the runner-up" },
  { label: "Trading Bundle", value: "$500", desc: "Premium tools, VPS & signal access for 3rd place" },
];

const STEPS = [
  { num: "1", title: "Trade Any Market", desc: "Trade any supported market on WorldStreet" },
  { num: "2", title: "Minimum 0.1 Lot", desc: "Minimum trade size: 0.1 lot" },
  { num: "3", title: "Increase Your Score", desc: "Every eligible trade increases your leaderboard score" },
  { num: "4", title: "Track Rankings", desc: "Rankings update in near real-time" },
  { num: "5", title: "Win Weekly", desc: "Winners are announced every week" },
];

const FAQS = [
  { question: "How is ranking calculated?", answer: "Rankings are based on total trading volume (in lots) across all eligible markets during the competition week. The trader with the highest cumulative volume holds the top position." },
  { question: "Who can participate?", answer: "Any registered WorldStreet user with a verified account can participate. Simply trade on any supported market with a minimum trade size of 0.1 lots." },
  { question: "What counts as volume?", answer: "All completed trades of 0.1 lots or more on supported assets count towards your weekly volume. Both buy and sell trades are included." },
  { question: "What happens in a tie?", answer: "In the event of a tie in trading volume, the trader who reached the volume milestone first (by timestamp) will be ranked higher." },
  { question: "Why does time matter?", answer: "Time serves as the tiebreaker. If two traders have the same volume, the one who achieved it earlier in the week gets the higher rank." },
  { question: "Fair play notice", answer: "WorldStreet reserves the right to disqualify any trader suspected of manipulative or fraudulent trading activity. All trades are monitored to ensure a fair competition." },
];

/* ─── Helpers ─── */
function getNextSunday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(23, 59, 59, 999);
  return next;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const target = getNextSunday();
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ─── Sub-components ─── */

function CountdownBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{label}</span>
    </div>
  );
}

function CountdownSep() {
  return <span className="text-2xl md:text-3xl font-bold text-[#FFCC2D] mx-1">:</span>;
}

/* ─── Main Page ─── */
export default function LeaderboardPage() {
  const countdown = useCountdown();
  const [activePrize, setActivePrize] = useState(0);
  const [assetFilter, setAssetFilter] = useState("All Assets");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [sortBy, setSortBy] = useState("volume");

  // Filter & sort
  const filtered = TRADERS.filter((t) => {
    if (assetFilter !== "All Assets" && !ASSET_CLASSES[assetFilter]?.includes(t.asset)) return false;
    if (countryFilter !== "All Countries" && t.country !== countryFilter) return false;
    return true;
  }).sort((a, b) => (sortBy === "volume" ? b.volume - a.volume : a.username.localeCompare(b.username)));

  const top3 = filtered.slice(0, 3);
  const yourPos = TRADERS.find((t) => t.isYou);

  return (
    <main className="flex flex-col w-full relative bg-[#050505] min-h-screen">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 px-6 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#FFCC2D]/8 blur-[160px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md mb-6">
            <svg className="w-4 h-4 text-[#FFCC2D]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span className="text-sm font-medium text-gray-300">Weekly Competition</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Compete. Trade. <span className="text-[#FFCC2D]">Win.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Every week, top traders on WorldStreet compete for glory and rewards. Trade with discipline, climb the leaderboard, and walk away with cash prizes, premium gadgets, and exclusive tools built for champions.
          </p>
        </div>
      </section>

      {/* ══════════ PRIZES ══════════ */}
      <section className="py-16 md:py-24 px-6 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - text */}
            <div>
              <span className="text-[#FFCC2D] text-sm font-semibold uppercase tracking-widest mb-3 block">Weekly Rewards</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Win Big Every Week</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Top 10 traders win incredible prizes. The more you trade, the higher you climb. Join thousands of traders competing for glory and rewards every week.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/register" className="inline-flex items-center gap-2 bg-[#FFCC2D] text-black px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform">
                  Start Trading
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a href="#leaderboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[rgba(255,255,255,0.1)] text-white text-sm font-medium hover:bg-white/5 transition-colors">
                  View Leaderboard
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </a>
              </div>
            </div>

            {/* Right - prize card */}
            <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFCC2D]/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                {/* Prize display */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gray-500">This Week&apos;s Prize</span>
                    <h3 className="text-2xl font-bold text-white mt-1">{PRIZES[activePrize].label}</h3>
                    <span className="text-[#FFCC2D] text-xl font-bold">{PRIZES[activePrize].value}</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#FFCC2D]/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FFCC2D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6">{PRIZES[activePrize].desc}</p>

                {/* Countdown */}
                <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-4 mb-6 border border-[rgba(255,255,255,0.05)]">
                  <span className="text-xs uppercase tracking-widest text-gray-500 block mb-3 text-center">Competition Ends In</span>
                  <div className="flex items-center justify-center gap-1">
                    <CountdownBlock value={pad(countdown.days)} label="Days" />
                    <CountdownSep />
                    <CountdownBlock value={pad(countdown.hours)} label="Hours" />
                    <CountdownSep />
                    <CountdownBlock value={pad(countdown.mins)} label="Mins" />
                    <CountdownSep />
                    <CountdownBlock value={pad(countdown.secs)} label="Secs" />
                  </div>
                </div>

                {/* Prize tabs */}
                <div className="flex gap-2">
                  {PRIZES.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setActivePrize(i)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        activePrize === i
                          ? "bg-[#FFCC2D] text-black"
                          : "bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ LEADERBOARD ══════════ */}
      <section id="leaderboard" className="py-16 md:py-24 px-6 border-t border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-[#FFCC2D] text-sm font-semibold uppercase tracking-widest mb-3 block">Live Rankings</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Weekly Leaderboard</h2>
          </div>

          {/* Timer + Filters bar */}
          <div className="glass rounded-2xl p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Timer */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#FFCC2D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-sm text-gray-400">Time Left This Week</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-sm font-bold text-white tabular-nums">{pad(countdown.days)}d</span>
                  <span className="text-gray-600">:</span>
                  <span className="text-sm font-bold text-white tabular-nums">{pad(countdown.hours)}h</span>
                  <span className="text-gray-600">:</span>
                  <span className="text-sm font-bold text-white tabular-nums">{pad(countdown.mins)}m</span>
                  <span className="text-gray-600">:</span>
                  <span className="text-sm font-bold text-white tabular-nums">{pad(countdown.secs)}s</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFCC2D]/40"
                >
                  {Object.keys(ASSET_CLASSES).map((k) => (
                    <option key={k} value={k} className="bg-[#111]">{k}</option>
                  ))}
                </select>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFCC2D]/40"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#111]">{c}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFCC2D]/40"
                >
                  <option value="volume" className="bg-[#111]">Volume (High to Low)</option>
                  <option value="username" className="bg-[#111]">Username (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 mt-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 font-medium">Live</span>
              <span className="text-xs text-gray-600 ml-1">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
              {[1, 0, 2].map((idx) => {
                const t = top3[idx];
                if (!t) return null;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={t.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`glass rounded-2xl p-4 md:p-6 text-center relative overflow-hidden ${
                      isFirst ? "ring-1 ring-[#FFCC2D]/30 md:-mt-4" : ""
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFCC2D] to-transparent" />
                    )}
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg md:text-2xl font-bold ${
                      idx === 0 ? "bg-[#FFCC2D]/20 text-[#FFCC2D]" : idx === 1 ? "bg-gray-500/20 text-gray-300" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {idx === 0 ? (
                        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="text-lg mb-1">{COUNTRY_FLAGS[t.country]}</div>
                    <h4 className="font-bold text-white text-xs md:text-base truncate">{t.username}</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-2">{t.country}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] md:text-xs text-gray-500">{t.asset}</span>
                      <span className="text-xs md:text-sm font-bold text-[#FFCC2D]">{t.volume} lots</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Your Position */}
          {yourPos && (
            <div className="glass rounded-2xl p-4 mb-6 border-l-2 border-[#FFCC2D]">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#FFCC2D]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span className="text-xs text-gray-400">Your Position</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xl font-bold text-[#FFCC2D]">#{yourPos.rank}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#FFCC2D]/10 text-[#FFCC2D] px-2 py-0.5 rounded-full font-semibold">You</span>
                  <span className="text-sm font-medium text-white">{yourPos.username}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>{COUNTRY_FLAGS[yourPos.country]}</span>
                  <span>{yourPos.country}</span>
                </div>
                <span className="text-xs text-gray-500">{yourPos.asset}</span>
                <span className="text-sm font-bold text-white">{yourPos.volume} lots</span>
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-semibold ml-auto">active</span>
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="glass rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[60px_1fr_1fr_100px_120px_80px] gap-4 px-6 py-3 border-b border-[rgba(255,255,255,0.05)] text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <span>Rank</span>
              <span>Trader</span>
              <span>Country</span>
              <span>Asset</span>
              <span>Volume</span>
              <span>Status</span>
            </div>
            {/* Rows */}
            {filtered.map((t, i) => (
              <motion.div
                key={t.username}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_1fr_100px_120px_80px] gap-2 md:gap-4 px-4 md:px-6 py-3 border-b border-[rgba(255,255,255,0.03)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                  t.isYou ? "bg-[#FFCC2D]/5" : ""
                }`}
              >
                {/* Rank */}
                <span className={`font-bold text-sm ${
                  t.rank === 1 ? "text-[#FFCC2D]" : t.rank === 2 ? "text-gray-300" : t.rank === 3 ? "text-orange-400" : "text-gray-500"
                }`}>
                  {t.rank <= 3 ? (
                    <span className="text-lg">
                      {t.rank === 1 ? "🥇" : t.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : t.rank}
                </span>

                {/* Trader */}
                <div className="flex items-center gap-2 min-w-0">
                  {t.isYou && (
                    <span className="text-[10px] bg-[#FFCC2D]/10 text-[#FFCC2D] px-1.5 py-0.5 rounded font-semibold shrink-0">You</span>
                  )}
                  <span className="text-sm font-medium text-white truncate">{t.username}</span>
                </div>

                {/* Country - desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <span>{COUNTRY_FLAGS[t.country]}</span>
                  <span className="text-sm text-gray-400">{t.country}</span>
                </div>

                {/* Asset - desktop */}
                <span className="hidden md:block text-xs font-medium text-gray-300">{t.asset}</span>

                {/* Volume */}
                <div className="text-right md:text-left">
                  <strong className="text-sm text-white">{t.volume}</strong>
                  <span className="text-xs text-gray-500 ml-1">lots</span>
                </div>

                {/* Status - desktop */}
                <span className="hidden md:block text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-semibold w-fit">active</span>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">No traders match the selected filters.</div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ HOW TO PARTICIPATE ══════════ */}
      <section className="py-16 md:py-24 px-6 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#FFCC2D] text-sm font-semibold uppercase tracking-widest mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How to Participate</h2>
            <p className="text-gray-400 text-lg">Join the competition in 5 simple steps and start climbing the leaderboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s) => (
              <div key={s.num} className="glass rounded-2xl p-6 text-center relative group hover:border-[#FFCC2D]/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FFCC2D]/10 text-[#FFCC2D] flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {s.num}
                </div>
                <h4 className="text-white font-semibold text-sm mb-2">{s.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="/register" className="inline-flex items-center gap-2 bg-[#FFCC2D] text-black px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform">
              Start Trading Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <FAQSection 
        items={FAQS} 
        title="Competition FAQs" 
        subtitle="Common questions about the leaderboard and weekly competition rules." 
      />

      {/* ══════════ CONTACT + DOCUMENTS ══════════ */}
      <section className="py-16 md:py-24 px-6 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Have Any Questions?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 md:p-8">
              <h4 className="text-lg font-bold text-white mb-6">Get In Touch Now</h4>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC2D]/40"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC2D]/40"
                  />
                </div>
                <textarea
                  placeholder="Enter your message....."
                  rows={4}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC2D]/40 resize-none"
                />
                <button
                  type="submit"
                  className="bg-[#FFCC2D] text-black px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Documents */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h4 className="text-lg font-bold text-white mb-6">Read Documents</h4>
              <ul className="space-y-3">
                {[
                  { name: "Privacy Policy", href: "/legal-docs/PRIVACY%20POLICY.docx" },
                  { name: "Client Agreement", href: "/legal-docs/client-agreement.pdf" },
                  { name: "Cookie Policy", href: "/legal-docs/COOKIE%20POLICY%20.pdf" },
                  { name: "Risk Disclosure Statement", href: "/legal-docs/RISK%20DISCLOSURE%20STATEMENT.docx.pdf" },
                ].map((doc) => (
                  <li key={doc.name}>
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors group"
                    >
                      <svg className="w-5 h-5 text-[#FFCC2D] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 3.5L18.5 8H14V3.5zM6 20V4h7v5a1 1 0 001 1h5v10H6z"/></svg>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{doc.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

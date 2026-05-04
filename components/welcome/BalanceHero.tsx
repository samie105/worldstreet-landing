"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Copy, Check,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ChevronDown, TrendingUp, TrendingDown, Banknote, RefreshCw,
} from "lucide-react";
import type { AssetClass } from "./welcome-platforms-data";

// ─── shared ─────────────────────────────────────────────────────────────────

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const truncAddr = (a: string) => (a.length < 14 ? a : `${a.slice(0, 8)}…${a.slice(-6)}`);

const ActionBtn = ({ href, icon: Icon, label, primary }: { href: string; icon: React.ElementType; label: string; primary?: boolean }) => (
  <a
    href={href}
    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-colors ${
      primary
        ? "bg-[#FFCC2D] hover:bg-[#FFCC2D]/90 text-black"
        : "border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </a>
);

// ─── CRYPTO ─────────────────────────────────────────────────────────────────

const CRYPTO_VIEWS = [
  { key: "total", label: "Total", sub: "All accounts" },
  { key: "main", label: "Main", sub: "On-chain wallet" },
  { key: "spot", label: "Spot", sub: "Spot trading" },
  { key: "futures", label: "Futures", sub: "Perp positions" },
] as const;
type CryptoView = (typeof CRYPTO_VIEWS)[number]["key"];

const CRYPTO_BALANCES: Record<CryptoView, number> = {
  total: 284930.54, main: 142340.18, spot: 98640.22, futures: 43950.14,
};

const WALLETS = [
  { chain: "tron" as const, label: "Tron", addr: "TXa9KpQm3R8nE2vL7sB4dW6yH1jZ5fM8sf", icon: "https://coin-images.coingecko.com/coins/images/1094/small/tron-logo.png" },
  { chain: "solana" as const, label: "Solana", addr: "9xQeWp2KsVcT4mNzRf8YuLb6HjA3dBnCpQrXvE5MvTk2", icon: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png" },
  { chain: "ethereum" as const, label: "Ethereum", addr: "0x7c2A8f93dE4B5cFa1928aBcD3eFa5b9CaE6d8420", icon: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png" },
];

function CryptoBalance({ balRef }: { balRef: React.RefObject<HTMLSpanElement | null> }) {
  const [view, setView] = useState<CryptoView>("total");
  const [chain, setChain] = useState<(typeof WALLETS)[number]["chain"]>("tron");
  const [copied, setCopied] = useState(false);
  const active = WALLETS.find((w) => w.chain === chain) ?? WALLETS[0];

  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: CRYPTO_BALANCES[view], duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = formatUSD(obj.v); } });
    return () => { tween.kill(); };
  }, [view, balRef]);

  const handleCopy = () => { navigator.clipboard.writeText(active.addr); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <>
      {/* View tabs */}
      <div className="flex items-center gap-1 mb-5">
        {CRYPTO_VIEWS.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)} className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition-colors ${view === v.key ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/[0.04]"}`}>{v.label}</button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">
            {CRYPTO_VIEWS.find((v) => v.key === view)?.sub}
          </div>
          <span ref={balRef} className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight">$0.00</span>

          {(view === "main" || view === "total") && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full overflow-hidden pointer-events-none">
                  <img src={active.icon} alt="" className="w-full h-full object-cover" />
                </div>
                <select value={chain} onChange={(e) => setChain(e.target.value as typeof chain)} className="appearance-none border border-white/[0.08] bg-white/[0.02] py-1.5 pl-8 pr-7 text-[11px] font-medium text-white outline-none cursor-pointer">
                  {WALLETS.map((w) => <option key={w.chain} value={w.chain} className="bg-[#0a0a0a]">{w.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
              </div>
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                {truncAddr(active.addr)}
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="/deposit" icon={ArrowDownToLine} label="Deposit" primary />
          <ActionBtn href="/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <ActionBtn href="/swap" icon={ArrowLeftRight} label="Convert" />
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] uppercase tracking-widest text-gray-500">Today&apos;s P&amp;L</span></div>
          <div className="text-[18px] md:text-xl font-medium text-emerald-400 tabular-nums">+$2,340.18</div>
          <div className="text-[10px] text-gray-500 mt-0.5">+0.82% · 24h</div>
        </div>
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Active Assets</div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">14</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Across 6 networks</div>
        </div>
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Networks</div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">6</div>
          <div className="text-[10px] text-gray-500 mt-0.5 truncate">SOL · ETH · ARB · TRX · TON · BSC</div>
        </div>
      </div>
    </>
  );
}

// ─── FOREX ───────────────────────────────────────────────────────────────────

const FOREX_BALANCE = 86420.0;

const OPEN_POSITIONS = [
  { pair: "EUR/USD", side: "buy", size: "0.80 lot", pnl: "+$320", pos: true },
  { pair: "GBP/JPY", side: "sell", size: "1.20 lot", pnl: "+$184", pos: true },
  { pair: "USD/CHF", side: "buy", size: "0.50 lot", pnl: "-$48", pos: false },
];

function ForexBalance({ balRef }: { balRef: React.RefObject<HTMLSpanElement | null> }) {
  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: FOREX_BALANCE, duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = formatUSD(obj.v); } });
    return () => { tween.kill(); };
  }, [balRef]);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">All accounts</div>
          <span ref={balRef} className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight">$0.00</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[11px] text-gray-500">Margin used: <span className="text-white">$4,820</span></span>
            <span className="text-[10px] text-gray-700">·</span>
            <span className="text-[11px] text-gray-500">Free margin: <span className="text-emerald-400">$81,600</span></span>
            <span className="text-[10px] text-gray-700">·</span>
            <span className="text-[11px] text-gray-500">Leverage: <span className="text-white">1:100</span></span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="/trading/forex" icon={TrendingUp} label="New Trade" primary />
          <ActionBtn href="/deposit" icon={ArrowDownToLine} label="Fund" />
          <ActionBtn href="/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] uppercase tracking-widest text-gray-500">Floating P&amp;L</span></div>
          <div className="text-[18px] md:text-xl font-medium text-emerald-400 tabular-nums">+$456.00</div>
          <div className="text-[10px] text-gray-500 mt-0.5">3 open positions</div>
        </div>
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Open Trades</div>
          <div className="flex items-center gap-3">
            {OPEN_POSITIONS.map((p) => (
              <div key={p.pair} className="flex flex-col">
                <span className="text-[11px] text-white font-medium">{p.pair}</span>
                <span className={`text-[10px] font-medium ${p.pos ? "text-emerald-400" : "text-rose-400"}`}>{p.pnl}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Win Rate (30d)</div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">64%</div>
          <div className="text-[10px] text-gray-500 mt-0.5">EUR · GBP · USD · JPY</div>
        </div>
      </div>
    </>
  );
}

// ─── FIAT ────────────────────────────────────────────────────────────────────

const FIAT_ACCOUNTS = [
  { key: "usd", label: "USD", flag: "🇺🇸", balance: 28410.0, iban: "WS · **** 4821" },
  { key: "ngn", label: "NGN", flag: "🇳🇬", balance: 19800.0, iban: "WS · **** 9904" },
];

const FIAT_RATES = [
  { from: "USD", to: "NGN", rate: "1,580.40", trend: "up" },
  { from: "GBP", to: "USD", rate: "1.2640", trend: "down" },
  { from: "EUR", to: "USD", rate: "1.0810", trend: "up" },
];

function FiatBalance({ balRef }: { balRef: React.RefObject<HTMLSpanElement | null> }) {
  const [acct, setAcct] = useState("usd");
  const active = FIAT_ACCOUNTS.find((a) => a.key === acct) ?? FIAT_ACCOUNTS[0];

  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: active.balance, duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = formatUSD(obj.v); } });
    return () => { tween.kill(); };
  }, [acct, active.balance, balRef]);

  return (
    <>
      {/* Account tabs */}
      <div className="flex items-center gap-1 mb-5">
        {FIAT_ACCOUNTS.map((a) => (
          <button key={a.key} onClick={() => setAcct(a.key)} className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition-colors flex items-center gap-1.5 ${acct === a.key ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/[0.04]"}`}>
            <span>{a.flag}</span>{a.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">{active.label} Balance</div>
          <span ref={balRef} className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight">$0.00</span>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-500 border border-white/[0.06] px-2 py-1">{active.iban}</span>
            <span className="text-[11px] text-gray-600">· Worldstreet account</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="/deposit" icon={ArrowDownToLine} label="Add Money" primary />
          <ActionBtn href="/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <ActionBtn href="/convert" icon={RefreshCw} label="Convert" />
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Live FX Rates</div>
          <div className="flex flex-col gap-1.5">
            {FIAT_RATES.map((r) => (
              <div key={r.from + r.to} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{r.from}/{r.to}</span>
                <div className="flex items-center gap-1">
                  {r.trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                  <span className="text-[11px] font-medium text-white tabular-nums">{r.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Total (All Currencies)</div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">$48,210</div>
          <div className="text-[10px] text-gray-500 mt-0.5">2 currencies held</div>
        </div>
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Last Transfer</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Banknote className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[12px] text-white">USD → NGN</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">$2,000 · 8 min ago</div>
        </div>
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BalanceHero({ assetClass = "fiat" }: { assetClass?: AssetClass }) {
  const balRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="w-full" key={assetClass}>
      {assetClass === "crypto" && <CryptoBalance balRef={balRef} />}
      {assetClass === "forex" && <ForexBalance balRef={balRef} />}
      {assetClass === "fiat" && <FiatBalance balRef={balRef} />}
    </div>
  );
}

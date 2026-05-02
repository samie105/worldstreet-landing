"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Copy, Check, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ChevronDown } from "lucide-react";
import type { AssetClass } from "./welcome-platforms-data";

const VIEWS = [
  { key: "total", label: "Total", sub: "All accounts" },
  { key: "main", label: "Main", sub: "On-chain wallet" },
  { key: "spot", label: "Spot", sub: "Spot trading" },
  { key: "futures", label: "Futures", sub: "Perp positions" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

// Per-asset-class dummy balances
const BALANCES_BY_ASSET: Record<AssetClass, Record<ViewKey, number>> = {
  crypto: {
    total: 284930.54,
    main: 142340.18,
    spot: 98640.22,
    futures: 43950.14,
  },
  forex: {
    total: 86420.0,
    main: 42140.0,
    spot: 28640.0,
    futures: 15640.0,
  },
  fiat: {
    total: 48210.0,
    main: 32400.0,
    spot: 9810.0,
    futures: 6000.0,
  },
};

const STATS_BY_ASSET: Record<AssetClass, { pnl: string; pnlPct: string; assets: string; assetsSub: string }> = {
  crypto: { pnl: "+$2,340.18", pnlPct: "+0.82% · 24h", assets: "14", assetsSub: "Across 6 networks" },
  forex: { pnl: "+$184.20", pnlPct: "+0.21% · 24h", assets: "7", assetsSub: "Major + minor pairs" },
  fiat: { pnl: "+$48.00", pnlPct: "+0.10% · 24h", assets: "5", assetsSub: "USD · GBP · EUR · NGN · KES" },
};

const WALLETS = [
  {
    chain: "tron" as const,
    label: "Tron",
    addr: "TXa9KpQm3R8nE2vL7sB4dW6yH1jZ5fM8sf",
    icon: "https://coin-images.coingecko.com/coins/images/1094/small/tron-logo.png",
  },
  {
    chain: "solana" as const,
    label: "Solana",
    addr: "9xQeWp2KsVcT4mNzRf8YuLb6HjA3dBnCpQrXvE5MvTk2",
    icon: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",
  },
  {
    chain: "ethereum" as const,
    label: "Ethereum",
    addr: "0x7c2A8f93dE4B5cFa1928aBcD3eFa5b9CaE6d8420",
    icon: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
  },
];

const truncAddr = (a: string) => (a.length < 14 ? a : `${a.slice(0, 8)}…${a.slice(-6)}`);

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export default function BalanceHero({ assetClass = "crypto" }: { assetClass?: AssetClass }) {
  const [view, setView] = useState<ViewKey>("total");
  const [chain, setChain] = useState<(typeof WALLETS)[number]["chain"]>("tron");
  const [copied, setCopied] = useState(false);
  const balanceRef = useRef<HTMLSpanElement>(null);

  const BALANCES = BALANCES_BY_ASSET[assetClass];
  const STATS = STATS_BY_ASSET[assetClass];

  // Count up the balance whenever the view OR asset class changes
  useEffect(() => {
    if (!balanceRef.current) return;
    const el = balanceRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: BALANCES[view],
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = formatUSD(obj.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [view, assetClass, BALANCES]);

  const active = WALLETS.find((w) => w.chain === chain) ?? WALLETS[0];
  const showWallet = view === "main" || view === "total";

  const handleCopy = () => {
    navigator.clipboard.writeText(active.addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full">
      {/* View tabs */}
      <div className="flex items-center gap-1 mb-5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-widest transition-colors ${
              view === v.key
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Balance + actions */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">
            {VIEWS.find((v) => v.key === view)?.sub}
          </div>
          <span
            ref={balanceRef}
            className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight"
          >
            $0.00
          </span>

          {/* Wallet selector — only when Main / Total */}
          {showWallet && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full overflow-hidden pointer-events-none">
                  <img src={active.icon} alt="" className="w-full h-full object-cover" />
                </div>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value as typeof chain)}
                  className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.02] py-1.5 pl-8 pr-7 text-[11px] font-medium text-white outline-none focus:border-white/20 cursor-pointer"
                >
                  {WALLETS.map((w) => (
                    <option key={w.chain} value={w.chain} className="bg-[#0a0a0a]">
                      {w.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {truncAddr(active.addr)}
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/deposit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFCC2D] hover:bg-[#FFCC2D]/90 px-4 py-2.5 text-[12px] font-semibold text-black transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Deposit
          </a>
          <a
            href="/withdraw"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Withdraw
          </a>
          <a
            href="/swap"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Convert
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
              Today&apos;s P&amp;L
            </span>
          </div>
          <div className="text-[18px] md:text-xl font-medium text-emerald-400 tabular-nums">
            {STATS.pnl}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{STATS.pnlPct}</div>
        </div>
        <div className="px-4 py-4 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1.5">
            Active Assets
          </div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">{STATS.assets}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{STATS.assetsSub}</div>
        </div>
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1.5">
            Networks
          </div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">6</div>
          <div className="text-[10px] text-gray-500 mt-0.5 truncate">SOL · ETH · ARB · TRX · TON · BSC</div>
        </div>
      </div>
    </div>
  );
}

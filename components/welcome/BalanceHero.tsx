"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Copy, Check,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ChevronDown, TrendingUp, TrendingDown, Banknote, RefreshCw,
} from "lucide-react";
import type { AssetClass } from "./welcome-platforms-data";
import type { WalletAddresses } from "@/lib/balance-actions";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useHyperliquidBalance } from "@/hooks/useHyperliquidBalance";
import {
  getSpotV2Balance,
  getSpotV2Positions,
  getTokenPrices,
  type LedgerBalance,
  type PositionInfo,
} from "@/lib/spotv2/ledger-actions";
import { getFxRates, type FxRates } from "@/lib/fx-actions";

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

const WALLET_ICONS = {
  tron: "https://coin-images.coingecko.com/coins/images/1094/small/tron-logo.png",
  solana: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",
  ethereum: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
};

function CryptoBalance({
  balRef,
  spotBalance: initialSpotBalance,
  walletAddresses,
}: {
  balRef: React.RefObject<HTMLSpanElement | null>;
  spotBalance: number;
  walletAddresses: WalletAddresses;
}) {
  const [view, setView] = useState<CryptoView>("total");
  const [chain, setChain] = useState<"tron" | "solana" | "ethereum">("tron");
  const [copied, setCopied] = useState(false);

  const wallets = [
    { chain: "tron" as const, label: "Tron", addr: walletAddresses.tron, icon: WALLET_ICONS.tron },
    { chain: "solana" as const, label: "Solana", addr: walletAddresses.solana, icon: WALLET_ICONS.solana },
    { chain: "ethereum" as const, label: "Ethereum", addr: walletAddresses.ethereum, icon: WALLET_ICONS.ethereum },
  ];

  // ── Live data hooks ─────────────────────────────────────────────
  const { balances: onChainBalances } = useWalletBalances();
  const { accountValue: futuresBalance } = useHyperliquidBalance();

  // ── Spot ledger + positions (with prices) ──────────────────────
  const [spotLedger, setSpotLedger] = useState<LedgerBalance[]>([]);
  const [spotPositions, setSpotPositions] = useState<(PositionInfo & { currentPrice: number })[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [balances, positions] = await Promise.all([
          getSpotV2Balance(),
          getSpotV2Positions(),
        ]);
        const tokens = positions.map((p) => p.token);
        const priceMap = tokens.length > 0 ? await getTokenPrices(tokens) : {};
        if (cancelled) return;
        setSpotLedger(balances);
        setSpotPositions(positions.map((p) => ({ ...p, currentPrice: priceMap[p.token] ?? 0 })));
      } catch {
        /* keep last good state */
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // ── Price map for on-chain tokens ──────────────────────────────
  const [onChainPrices, setOnChainPrices] = useState<Record<string, number>>({});
  useEffect(() => {
    const symbols = [...new Set(onChainBalances.map((b) => b.symbol))];
    if (symbols.length === 0) return;
    let cancelled = false;
    getTokenPrices(symbols).then((prices) => {
      if (!cancelled) setOnChainPrices(prices);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [onChainBalances]);

  // ── Computed totals ─────────────────────────────────────────────
  const onChainTotal = useMemo(() => {
    let total = 0;
    for (const b of onChainBalances) {
      const p = onChainPrices[b.symbol] ?? (b.symbol === "USDT" || b.symbol === "USDC" ? 1 : 0);
      total += b.balance * p;
    }
    return total;
  }, [onChainBalances, onChainPrices]);

  const spotBalance = useMemo(() => {
    const ledgerTotal = spotLedger.length > 0
      ? spotLedger.reduce((s, b) => s + b.available + b.locked, 0)
      : initialSpotBalance;
    const posTotal = spotPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
    return ledgerTotal + posTotal;
  }, [spotLedger, spotPositions, initialSpotBalance]);

  const balanceForView: Record<CryptoView, number> = {
    total: onChainTotal + spotBalance + futuresBalance,
    main: onChainTotal,
    spot: spotBalance,
    futures: futuresBalance,
  };

  const active = wallets.find((w) => w.chain === chain) ?? wallets[0];

  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: balanceForView[view], duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = formatUSD(obj.v); } });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, balanceForView[view], balRef]);

  const handleCopy = () => {
    if (!active.addr) return;
    navigator.clipboard.writeText(active.addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
                  {wallets.map((w) => <option key={w.chain} value={w.chain} className="bg-[#0a0a0a]">{w.label}</option>)}
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
          <ActionBtn href="https://dashboard.worldstreetgold.com/deposit" icon={ArrowDownToLine} label="Deposit" primary />
          <ActionBtn href="https://dashboard.worldstreetgold.com/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <ActionBtn href="https://dashboard.worldstreetgold.com/swap" icon={ArrowLeftRight} label="Convert" />
        </div>
      </div>

{(() => {
        const nonZeroOnChain = onChainBalances.filter((b) => b.balance > 0);
        const networks = [...new Set(nonZeroOnChain.map((b) => b.chain.toUpperCase()))];
        const hasOnChain = nonZeroOnChain.length > 0;
        const hasSpot = spotPositions.length > 0;
        if (!hasOnChain && !hasSpot) return null;
        const cells = [
          hasSpot && (
            <div key="pos" className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08] last:border-0">
              <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] uppercase tracking-widest text-gray-500">Spot Positions</span></div>
              <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">{spotPositions.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 truncate">{spotPositions.map((p) => p.token).slice(0, 4).join(" · ")}</div>
            </div>
          ),
          hasOnChain && (
            <div key="assets" className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08] last:border-0">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">On-Chain Assets</div>
              <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">{nonZeroOnChain.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Across {networks.length} {networks.length === 1 ? "network" : "networks"}</div>
            </div>
          ),
          hasOnChain && (
            <div key="nets" className="px-4 py-4 last:border-0">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Networks</div>
              <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">{networks.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 truncate">{networks.join(" · ")}</div>
            </div>
          ),
        ].filter(Boolean);
        return (
          <div className={`grid border-t border-white/[0.08] grid-cols-1 sm:grid-cols-${cells.length}`}>
            {cells}
          </div>
        );
      })()}
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
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] text-gray-500">Margin used: <span className="text-white">$4,820</span></span>
            <span className="text-[10px] text-gray-700 hidden sm:inline">·</span>
            <span className="text-[11px] text-gray-500">Free margin: <span className="text-emerald-400">$81,600</span></span>
            <span className="text-[10px] text-gray-700 hidden sm:inline">·</span>
            <span className="text-[11px] text-gray-500">Leverage: <span className="text-white">1:100</span></span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="https://dashboard.worldstreetgold.com/futures" icon={TrendingUp} label="New Trade" primary />
          <ActionBtn href="https://dashboard.worldstreetgold.com/deposit" icon={ArrowDownToLine} label="Fund" />
          <ActionBtn href="https://dashboard.worldstreetgold.com/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] uppercase tracking-widest text-gray-500">Floating P&amp;L</span></div>
          <div className="text-[18px] md:text-xl font-medium text-emerald-400 tabular-nums">+$456.00</div>
          <div className="text-[10px] text-gray-500 mt-0.5">3 open positions</div>
        </div>
        <div className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Open Trades</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {OPEN_POSITIONS.map((p) => (
              <div key={p.pair} className="flex items-center gap-1.5">
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

const FX_PAIRS: Array<{ key: keyof FxRates; label: string }> = [
  { key: "USD/NGN", label: "USD/NGN" },
  { key: "GBP/USD", label: "GBP/USD" },
  { key: "EUR/USD", label: "EUR/USD" },
];

const formatNGN = (n: number) =>
  "₦" + new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function FiatBalance({
  balRef,
  spotBalance,
}: {
  balRef: React.RefObject<HTMLSpanElement | null>;
  spotBalance: number;
}) {
  const [fxRates, setFxRates] = useState<FxRates | null>(null);
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");

  useEffect(() => {
    let cancelled = false;
    async function loadRates() {
      try {
        const rates = await getFxRates();
        if (!cancelled) setFxRates(rates);
      } catch {
        /* leave null */
      }
    }
    loadRates();
    const id = setInterval(loadRates, 120_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const ngnRate = fxRates?.["USD/NGN"] ?? null;
  const ngnBalance = ngnRate !== null ? spotBalance * ngnRate : null;

  // Animate the hero number whenever balance or currency changes
  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const target = currency === "NGN" && ngnBalance !== null ? ngnBalance : spotBalance;
    const fmt = currency === "NGN" ? formatNGN : formatUSD;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: target,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => { el.textContent = fmt(obj.v); },
    });
    return () => { tween.kill(); };
  }, [spotBalance, ngnBalance, currency, balRef]);

  const hasRates = fxRates !== null && Object.values(fxRates).some((v) => v !== null);
  const availablePairs = FX_PAIRS.filter((p) => fxRates?.[p.key] !== null && fxRates?.[p.key] !== undefined);

  const cells = [
    hasRates && (
      <div key="fx" className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08] last:border-0">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Live FX Rates</div>
        <div className="flex flex-col gap-2">
          {availablePairs.map((p) => {
            const rate = fxRates![p.key]!;
            return (
              <div key={p.key} className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-gray-400 shrink-0">{p.label}</span>
                <span className="text-[12px] font-medium text-white tabular-nums">
                  {p.key === "USD/NGN" ? rate.toLocaleString() : rate.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    <div key="account" className="px-4 py-4 last:border-0">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Account</div>
      <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">
        {currency === "NGN" && ngnBalance !== null ? formatNGN(ngnBalance) : formatUSD(spotBalance)}
      </div>
      {currency === "USD" && ngnBalance !== null && spotBalance > 0 && (
        <div className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
          ≈ {formatNGN(ngnBalance)}
        </div>
      )}
      {currency === "NGN" && spotBalance > 0 && (
        <div className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
          ≈ {formatUSD(spotBalance)}
        </div>
      )}
      <div className="text-[10px] text-gray-500 mt-0.5">USDC spot balance</div>
    </div>,
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          {/* Currency toggle */}
          <div className="flex items-center gap-1 mb-3 w-fit border border-white/[0.08] bg-white/[0.02] p-0.5">
            {(["USD", "NGN"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                disabled={c === "NGN" && ngnRate === null}
                className={`px-3 py-1 text-[11px] font-semibold transition-colors ${
                  currency === c
                    ? "bg-[#FFCC2D] text-black"
                    : "text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">
            Available Balance ({currency === "NGN" ? "NGN" : "USDC"})
          </div>
          <span ref={balRef} className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight">
            {currency === "NGN" && ngnBalance !== null ? formatNGN(ngnBalance) : formatUSD(spotBalance)}
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-gray-600">· Worldstreet spot account</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="https://dashboard.worldstreetgold.com/deposit" icon={ArrowDownToLine} label="Add Money" primary />
          <ActionBtn href="https://dashboard.worldstreetgold.com/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <ActionBtn href="https://dashboard.worldstreetgold.com/swap" icon={RefreshCw} label="Convert" />
        </div>
      </div>

      <div className={`grid border-t border-white/[0.08] grid-cols-1 sm:grid-cols-${cells.length}`}>
        {cells}
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BalanceHero({
  assetClass = "fiat",
  spotBalance = 0,
  walletAddresses = { tron: "", solana: "", ethereum: "" },
}: {
  assetClass?: AssetClass;
  spotBalance?: number;
  walletAddresses?: WalletAddresses;
}) {
  const balRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="w-full" key={assetClass}>
      {assetClass === "crypto" && (
        <CryptoBalance balRef={balRef} spotBalance={spotBalance} walletAddresses={walletAddresses} />
      )}
      {assetClass === "forex" && <ForexBalance balRef={balRef} />}
      {assetClass === "fiat" && <FiatBalance balRef={balRef} spotBalance={spotBalance} />}
    </div>
  );
}

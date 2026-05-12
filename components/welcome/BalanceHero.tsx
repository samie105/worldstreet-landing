"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Copy, Check,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ChevronDown, TrendingUp, RefreshCw,
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
import type { ReltrixForexSnapshot } from "@/lib/reltrix-actions";
import BalanceActionModal, { type BalanceAction } from "./BalanceActionModal";

// ─── shared ─────────────────────────────────────────────────────────────────

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const truncAddr = (a: string) => (a.length < 14 ? a : `${a.slice(0, 8)}…${a.slice(-6)}`);

type ActionBtnProps = {
  icon: React.ElementType;
  label: string;
  primary?: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

const ActionBtn = ({ href, onClick, icon: Icon, label, primary }: ActionBtnProps) => {
  const cls = `inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-colors ${
    primary
      ? "bg-[#FFCC2D] hover:bg-[#FFCC2D]/90 text-black"
      : "border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white"
  }`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  }
  return (
    <a href={href} className={cls}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </a>
  );
};

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
          <div className={`hidden md:grid border-t border-white/[0.08] grid-cols-1 sm:grid-cols-${cells.length}`}>
            {cells}
          </div>
        );
      })()}
    </>
  );
}

// ─── FOREX ───────────────────────────────────────────────────────────────────

function formatIsoMinute(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  return match ? `${match[1]} UTC` : "Just now";
}

function ForexBalance({
  balRef,
  onAction,
  reltrixForexSnapshot,
}: {
  balRef: React.RefObject<HTMLSpanElement | null>;
  onAction: (a: BalanceAction) => void;
  reltrixForexSnapshot?: ReltrixForexSnapshot;
}) {
  const liveSnapshot = reltrixForexSnapshot?.isLive ? reltrixForexSnapshot : null;
  const linkedSnapshot = liveSnapshot?.hasClientMatch ? liveSnapshot : null;
  const animatedBalance = linkedSnapshot?.totalWalletBalance ?? 0;

  useEffect(() => {
    if (!balRef.current) return;
    const el = balRef.current;
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: animatedBalance, duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = formatUSD(obj.v); } });
    return () => { tween.kill(); };
  }, [animatedBalance, balRef]);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-body mb-2">Forex account balance</div>
          <span ref={balRef} className="block text-4xl md:text-5xl lg:text-6xl font-medium text-white tabular-nums tracking-tight">$0.00</span>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] text-gray-500">Client: <span className="text-white">{linkedSnapshot?.client?.name ?? "Connect account"}</span></span>
            <span className="text-[10px] text-gray-700 hidden sm:inline">·</span>
            <span className="text-[11px] text-gray-500">CRM ID: <span className="text-white">{linkedSnapshot?.client?.crmId ?? "—"}</span></span>
            <span className="text-[10px] text-gray-700 hidden sm:inline">·</span>
            <span className="text-[11px] text-gray-500">
              Wallets: <span className="text-white">{linkedSnapshot?.fundedWalletCount ?? 0}</span>
            </span>
            {reltrixForexSnapshot && (
              <>
                <span className="text-[10px] text-gray-700 hidden sm:inline">·</span>
                <span className="text-[11px] text-gray-500">
                  Feed: <span className={linkedSnapshot ? "text-emerald-400" : "text-amber-300"}>{linkedSnapshot ? "linked" : "not linked"}</span>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn href="https://dashboard.worldstreetgold.com/futures" icon={TrendingUp} label="New Trade" primary />
          <ActionBtn onClick={() => onAction("deposit")} icon={ArrowDownToLine} label="Fund" />
          <ActionBtn onClick={() => onAction("withdraw")} icon={ArrowUpFromLine} label="Withdraw" />
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-4 border-t border-white/[0.08]">
        <div className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] uppercase tracking-widest text-gray-500">Funded Accounts</span></div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">{linkedSnapshot?.fundedWalletCount ?? 0}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Wallets attached to this user</div>
        </div>
        <div className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">CRM Profile</div>
          <div className="truncate text-[18px] md:text-xl font-medium text-white">{linkedSnapshot?.client?.name ?? "Not connected"}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{linkedSnapshot?.client ? `CRM #${linkedSnapshot.client.crmId}` : "Link this Clerk ID to a Reltrix CRM ID"}</div>
        </div>
        <div className="px-4 py-4 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Wallets</div>
          <div className="flex flex-col gap-1.5">
            {(linkedSnapshot?.topWallets ?? []).slice(0, 3).map((wallet) => (
              <div key={wallet.crmId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium text-white">{wallet.clientName ?? `CRM #${wallet.crmId}`}</div>
                  <div className="truncate text-[9px] text-gray-600">Wallet balance</div>
                </div>
                <span className="text-[11px] text-emerald-400 tabular-nums">{formatUSD(wallet.balance)}</span>
              </div>
            ))}
            {(!linkedSnapshot || linkedSnapshot.topWallets.length === 0) && (
              <div className="text-[10px] text-gray-500">No wallet balance returned yet.</div>
            )}
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${linkedSnapshot ? "bg-emerald-400" : "bg-amber-300"}`} />
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Account Link</span>
          </div>
          <div className="text-[18px] md:text-xl font-medium text-white tabular-nums">
            {linkedSnapshot?.matchSource ? linkedSnapshot.matchSource.replace("_", " ") : "Needs link"}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {linkedSnapshot
              ? "Matched from saved Clerk identity"
              : "Save the user’s Reltrix CRM ID against their Clerk ID"}
          </div>
          {reltrixForexSnapshot && (
            <div className="mt-2 text-[9px] uppercase tracking-widest text-gray-600 tabular-nums">
              Updated {formatIsoMinute(reltrixForexSnapshot.checkedAt)}
            </div>
          )}
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
  onAction,
}: {
  balRef: React.RefObject<HTMLSpanElement | null>;
  spotBalance: number;
  onAction: (a: BalanceAction) => void;
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
          <ActionBtn onClick={() => onAction("deposit")} icon={ArrowDownToLine} label="Add Money" primary />
          <ActionBtn onClick={() => onAction("withdraw")} icon={ArrowUpFromLine} label="Withdraw" />
          <ActionBtn onClick={() => onAction("convert")} icon={RefreshCw} label="Convert" />
        </div>
      </div>

      <div className={`hidden md:grid border-t border-white/[0.08] grid-cols-1 sm:grid-cols-${cells.length}`}>
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
  reltrixForexSnapshot,
}: {
  assetClass?: AssetClass;
  spotBalance?: number;
  walletAddresses?: WalletAddresses;
  reltrixForexSnapshot?: ReltrixForexSnapshot;
}) {
  const balRef = useRef<HTMLSpanElement>(null);
  const [action, setAction] = useState<BalanceAction | null>(null);
  const handleAction = useCallback((a: BalanceAction) => setAction(a), []);
  const handleClose = useCallback(() => setAction(null), []);

  return (
    <div className="w-full" key={assetClass}>
      {assetClass === "crypto" && (
        <CryptoBalance
          balRef={balRef}
          spotBalance={spotBalance}
          walletAddresses={walletAddresses}
        />
      )}
      {assetClass === "forex" && (
        <ForexBalance balRef={balRef} onAction={handleAction} reltrixForexSnapshot={reltrixForexSnapshot} />
      )}
      {assetClass === "fiat" && (
        <FiatBalance balRef={balRef} spotBalance={spotBalance} onAction={handleAction} />
      )}
      <BalanceActionModal action={action} onClose={handleClose} />
    </div>
  );
}

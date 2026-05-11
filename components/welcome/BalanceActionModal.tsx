"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ChevronDown, RefreshCw, Check, Copy, X, CheckCircle2, Loader2, Plus,
} from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal";

export type BalanceAction = "deposit" | "withdraw" | "convert";

// ── dummy data ──────────────────────────────────────────────────────────────

const CHAINS = [
  { id: "tron"     as const, label: "Tron",     tag: "TRC-20", icon: "https://coin-images.coingecko.com/coins/images/1094/small/tron-logo.png" },
  { id: "solana"   as const, label: "Solana",   tag: "SPL",    icon: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "ethereum" as const, label: "Ethereum", tag: "ERC-20", icon: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png" },
] as const;
type Chain = (typeof CHAINS)[number]["id"];

const TOKENS = [
  { symbol: "USDT", name: "Tether USD",  icon: "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",   price: 1.0   },
  { symbol: "USDC", name: "USD Coin",    icon: "https://coin-images.coingecko.com/coins/images/6319/small/usdc.png",     price: 1.0   },
  { symbol: "BTC",  name: "Bitcoin",     icon: "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",     price: 96420 },
  { symbol: "ETH",  name: "Ethereum",    icon: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",  price: 3280  },
  { symbol: "SOL",  name: "Solana",      icon: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",   price: 168   },
];

const BUY_RATE  = 1548.25; // NGN per USDT (deposit)
const SELL_RATE = 1512.50; // NGN per USDT (withdraw)

interface Bank { bankName: string; accountNumber: string; accountName: string; isDefault?: boolean; }
const SAVED_BANKS: Bank[] = [
  { bankName: "Access Bank", accountNumber: "0123456789", accountName: "John Doe", isDefault: true },
  { bankName: "GTBank",      accountNumber: "9876543210", accountName: "John Doe" },
];

const TREASURY: Record<Chain, string> = {
  tron:     "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  solana:   "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

// ── shared primitives ───────────────────────────────────────────────────────

const LABEL_CLS = "text-[10px] uppercase tracking-widest text-gray-500 font-body mb-1.5 block";

const fmt = (n: number, dec = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });

function Field({ children }: { children: React.ReactNode }) {
  return <div className="border border-white/[0.08] bg-white/[0.02] p-3">{children}</div>;
}

function QRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className={`tabular-nums ${accent ? "text-emerald-400 font-semibold" : "text-white font-medium"}`}>{value}</span>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 bg-[#FFCC2D] py-3 text-[12px] font-bold text-black transition-colors hover:bg-[#FFCC2D]/90 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full py-2.5 text-[12px] font-medium text-gray-400 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}

function AmountInput({ value, onChange, token }: {
  value: string; onChange: (v: string) => void;
  token: { symbol: string; icon: string };
}) {
  return (
    <Field>
      <div className="flex items-center gap-3">
        <input
          type="text" inputMode="decimal" value={value} placeholder="0.00"
          onChange={(e) => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) onChange(e.target.value); }}
          className="flex-1 min-w-0 bg-transparent text-2xl font-semibold text-white outline-none tabular-nums placeholder:text-gray-700"
        />
        <div className="flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 shrink-0">
          <img src={token.icon} alt={token.symbol} className="w-4 h-4 rounded-full" />
          <span className="text-[11px] font-semibold text-white">{token.symbol}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
        <span className="text-[10px] text-gray-600 mr-0.5">Quick:</span>
        {[10, 50, 100, 500].map((v) => (
          <button key={v} onClick={() => onChange(v.toString())}
            className="border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-gray-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            {v}
          </button>
        ))}
      </div>
    </Field>
  );
}

function ChainSelect({ value, onChange }: { value: Chain; onChange: (v: Chain) => void }) {
  const active = CHAINS.find((c) => c.id === value)!;
  return (
    <div className="relative">
      <img src={active.icon} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none" />
      <select value={value} onChange={(e) => onChange(e.target.value as Chain)}
        className="w-full appearance-none border border-white/[0.08] bg-white/[0.02] py-2.5 pl-9 pr-8 text-[12px] font-medium text-white outline-none cursor-pointer"
      >
        {CHAINS.map((c) => <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.label} · {c.tag} USDT</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
    </div>
  );
}

function TokenSelect({ value, onChange, exclude }: { value: string; onChange: (s: string) => void; exclude: string }) {
  const tok = TOKENS.find((t) => t.symbol === value) ?? TOKENS[0];
  return (
    <div className="relative shrink-0">
      <img src={tok.icon} alt={value} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none" />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-white/[0.08] bg-white/[0.04] py-1.5 pl-8 pr-6 text-[11px] font-semibold text-white outline-none cursor-pointer"
      >
        {TOKENS.filter((t) => t.symbol !== exclude).map((t) => (
          <option key={t.symbol} value={t.symbol} className="bg-[#0a0a0a]">{t.symbol}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
    </div>
  );
}

function SuccessState({ title, sub, onRepeat }: { title: string; sub: string; onRepeat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-medium text-white">{title}</p>
        <p className="text-[11px] text-gray-500 mt-1">{sub}</p>
      </div>
      <button onClick={onRepeat} className="text-[11px] text-gray-400 hover:text-white transition-colors underline underline-offset-2">
        Do it again
      </button>
    </div>
  );
}

// ── DEPOSIT ─────────────────────────────────────────────────────────────────

type DepositStep = "form" | "payment" | "processing" | "done";

function DepositTab() {
  const [chain, setChain] = useState<Chain>("tron");
  const [amount, setAmount]   = useState("");
  const [step, setStep]       = useState<DepositStep>("form");

  const parsed      = parseFloat(amount) || 0;
  const ngnPay      = parsed * BUY_RATE;
  const isValid     = parsed >= 1 && parsed <= 5000;
  const activeChain = CHAINS.find((c) => c.id === chain)!;

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#FFCC2D] animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-white">Verifying payment…</p>
        <p className="text-[11px] text-gray-500">Usually arrives in 1–3 minutes</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <SuccessState
        title={`${fmt(parsed)} USDT deposited`}
        sub={`Sent to your ${activeChain.label} wallet`}
        onRepeat={() => { setStep("form"); setAmount(""); }}
      />
    );
  }

  if (step === "payment") {
    return (
      <div className="flex flex-col gap-4">
        {/* Summary strip */}
        <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <QRow label="Deposit amount" value={`${fmt(parsed)} USDT`} />
          <QRow label="You pay"        value={`₦${fmt(ngnPay)}`} accent />
          <QRow label="Rate"           value={`1 USDT = ₦${BUY_RATE.toLocaleString()}`} />
          <QRow label="Network"        value={`${activeChain.label} (${activeChain.tag})`} />
        </div>

        <PrimaryBtn onClick={() => { setStep("processing"); setTimeout(() => setStep("done"), 2200); }}>
          Open Payment Page ↗
        </PrimaryBtn>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">after paying</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <GhostBtn onClick={() => { setStep("processing"); setTimeout(() => setStep("done"), 2200); }}>
          I&apos;ve Paid — Verify Payment
        </GhostBtn>
        <button onClick={() => setStep("form")} className="text-center text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
          ← Cancel and go back
        </button>
      </div>
    );
  }

  // ── form ──
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={LABEL_CLS}>Receive on</span>
        <ChainSelect value={chain} onChange={setChain} />
      </div>

      <div>
        <span className={LABEL_CLS}>You deposit (USDT)</span>
        <AmountInput value={amount} onChange={setAmount} token={TOKENS[0]} />
        <div className="mt-1 text-[10px] text-gray-600 text-right">Min 1 · Max 5,000 USDT</div>
      </div>

      <div>
        <span className={LABEL_CLS}>You pay (NGN)</span>
        <Field>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold tabular-nums">
              {parsed > 0
                ? <span className="text-white">₦{fmt(ngnPay)}</span>
                : <span className="text-gray-700">₦0.00</span>}
            </div>
            <div className="flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 shrink-0">
              <span className="text-[13px] font-bold text-emerald-400">₦</span>
              <span className="text-[11px] font-semibold text-white">NGN</span>
            </div>
          </div>
        </Field>
      </div>

      {parsed > 0 && (
        <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <QRow label="Exchange rate"  value={`1 USDT = ₦${BUY_RATE.toLocaleString()}`} />
          <QRow label="Platform fee"   value="5%" />
          <QRow label="Network"        value={`${activeChain.label} (${activeChain.tag})`} />
          <div className="pt-1.5 border-t border-white/[0.06]">
            <QRow label="Total you pay" value={`₦${fmt(ngnPay)}`} accent />
          </div>
        </div>
      )}

      <PrimaryBtn onClick={() => setStep("payment")} disabled={!isValid}>
        Deposit {parsed > 0 ? `${parsed} USDT` : "USDT"}
      </PrimaryBtn>
    </div>
  );
}

// ── WITHDRAW ─────────────────────────────────────────────────────────────────

type WithdrawStep = "form" | "send" | "processing" | "done";

function WithdrawTab() {
  const [chain, setChain]           = useState<Chain>("tron");
  const [amount, setAmount]         = useState("");
  const [banks, setBanks]           = useState<Bank[]>(SAVED_BANKS);
  const [bankIdx, setBankIdx]       = useState(0);
  const [addingBank, setAddingBank] = useState(false);
  const [newBank, setNewBank]       = useState<Bank>({ bankName: "", accountNumber: "", accountName: "" });
  const [txHash, setTxHash]         = useState("");
  const [copied, setCopied]         = useState(false);
  const [step, setStep]             = useState<WithdrawStep>("form");

  const parsed      = parseFloat(amount) || 0;
  const ngnGet      = parsed * SELL_RATE;
  const isValid     = parsed >= 1 && parsed <= 5000;
  const activeChain = CHAINS.find((c) => c.id === chain)!;
  const selectedBank = banks[bankIdx];
  const treasury     = TREASURY[chain];

  const PROGRESS_STEPS = ["USDT Received", "TX Verified", "Processing", "NGN Sent"];

  function copyAddress() {
    navigator.clipboard.writeText(treasury);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveBank() {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) return;
    const updated = [...banks, newBank];
    setBanks(updated);
    setBankIdx(updated.length - 1);
    setAddingBank(false);
    setNewBank({ bankName: "", accountNumber: "", accountName: "" });
  }

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#FFCC2D] animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-white">Processing withdrawal…</p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-1">
          {PROGRESS_STEPS.map((s, i) => (
            <span key={s} className={`px-2.5 py-0.5 text-[10px] font-medium border ${
              i === 0
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                : "border-white/[0.08] text-gray-600"
            }`}>{s}</span>
          ))}
        </div>
        <p className="text-[11px] text-gray-500">NGN arrives in 5–10 minutes</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <SuccessState
        title={`₦${fmt(ngnGet)} is on its way`}
        sub={`To ${selectedBank?.bankName} ···${selectedBank?.accountNumber.slice(-4)}`}
        onRepeat={() => { setStep("form"); setAmount(""); setTxHash(""); }}
      />
    );
  }

  if (step === "send") {
    return (
      <div className="flex flex-col gap-4">
        <div className="border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[11px] text-amber-400 font-medium">
            Send exactly {fmt(parsed)} USDT ({activeChain.tag}) to:
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Wrong chain or amount may result in permanent loss.
          </p>
        </div>

        <div>
          <span className={LABEL_CLS}>Treasury address ({activeChain.tag})</span>
          <div className="flex items-center gap-2 border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <span className="flex-1 text-[11px] font-mono text-gray-300 break-all">{treasury}</span>
            <button onClick={copyAddress} className="shrink-0 flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <QRow label="You send"    value={`${fmt(parsed)} USDT`} />
          <QRow label="You receive" value={`₦${fmt(ngnGet)}`} accent />
          <QRow label="Bank"        value={`${selectedBank?.bankName} ···${selectedBank?.accountNumber.slice(-4)}`} />
        </div>

        <div>
          <span className={LABEL_CLS}>Paste transaction hash after sending</span>
          <input
            type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x… or transaction signature"
            className="w-full border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[11px] font-mono text-white outline-none placeholder:text-gray-700"
          />
        </div>

        <PrimaryBtn
          onClick={() => { setStep("processing"); setTimeout(() => setStep("done"), 2200); }}
          disabled={!txHash.trim()}
        >
          I&apos;ve Sent the USDT
        </PrimaryBtn>
        <button onClick={() => setStep("form")} className="text-center text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
          ← Cancel and go back
        </button>
      </div>
    );
  }

  // ── form ──
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={LABEL_CLS}>Send USDT from</span>
        <ChainSelect value={chain} onChange={setChain} />
      </div>

      <div>
        <span className={LABEL_CLS}>You withdraw (USDT)</span>
        <AmountInput value={amount} onChange={setAmount} token={TOKENS[0]} />
        <div className="mt-1 text-[10px] text-gray-600 text-right">Min 1 · Max 5,000 USDT</div>
      </div>

      <div>
        <span className={LABEL_CLS}>You receive (NGN)</span>
        <Field>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold tabular-nums">
              {parsed > 0
                ? <span className="text-white">₦{fmt(ngnGet)}</span>
                : <span className="text-gray-700">₦0.00</span>}
            </div>
            <div className="flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 shrink-0">
              <span className="text-[13px] font-bold text-emerald-400">₦</span>
              <span className="text-[11px] font-semibold text-white">NGN</span>
            </div>
          </div>
        </Field>
      </div>

      {/* Bank picker */}
      <div>
        <span className={LABEL_CLS}>Payout bank</span>
        {!addingBank ? (
          <div className="flex flex-col gap-1.5">
            {banks.map((b, i) => (
              <button key={i} onClick={() => setBankIdx(i)}
                className={`flex items-center justify-between border px-3 py-2.5 text-left transition-colors ${
                  bankIdx === i
                    ? "border-[#FFCC2D]/30 bg-[#FFCC2D]/[0.04]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <p className="text-[12px] font-medium text-white">{b.bankName}</p>
                  <p className="text-[10px] text-gray-500">{b.accountName} · ···{b.accountNumber.slice(-4)}</p>
                </div>
                {bankIdx === i && <Check className="w-3.5 h-3.5 text-[#FFCC2D]" />}
              </button>
            ))}
            <button onClick={() => setAddingBank(true)} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-white transition-colors mt-0.5">
              <Plus className="w-3 h-3" /> Add bank account
            </button>
          </div>
        ) : (
          <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
            {[
              { field: "bankName",      placeholder: "Bank name" },
              { field: "accountNumber", placeholder: "Account number (10 digits)" },
              { field: "accountName",   placeholder: "Account name" },
            ].map(({ field, placeholder }) => (
              <input key={field} type="text" placeholder={placeholder}
                value={newBank[field as keyof Bank] as string}
                onChange={(e) => setNewBank((b) => ({ ...b, [field]: e.target.value }))}
                className="w-full border border-white/[0.08] bg-transparent px-3 py-2 text-[12px] text-white outline-none placeholder:text-gray-600"
              />
            ))}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { setAddingBank(false); setNewBank({ bankName: "", accountNumber: "", accountName: "" }); }}
                className="flex-1 border border-white/[0.08] py-1.5 text-[11px] text-gray-400 hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button onClick={saveBank}
                disabled={!newBank.bankName || !newBank.accountNumber || !newBank.accountName}
                className="flex-1 bg-white/[0.06] py-1.5 text-[11px] text-white font-medium hover:bg-white/[0.1] disabled:opacity-40 transition-colors"
              >
                Save account
              </button>
            </div>
          </div>
        )}
      </div>

      {parsed > 0 && (
        <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <QRow label="Sell rate"    value={`1 USDT = ₦${SELL_RATE.toLocaleString()}`} />
          <QRow label="Platform fee" value="2%" />
          <QRow label="Network"      value={`${activeChain.label} (${activeChain.tag})`} />
          <div className="pt-1.5 border-t border-white/[0.06]">
            <QRow label="You receive" value={`₦${fmt(ngnGet)}`} accent />
          </div>
        </div>
      )}

      <PrimaryBtn onClick={() => setStep("send")} disabled={!isValid || !selectedBank}>
        Continue → Get Treasury Address
      </PrimaryBtn>
    </div>
  );
}

// ── CONVERT ──────────────────────────────────────────────────────────────────

function ConvertTab() {
  const [fromSym, setFromSym] = useState("USDT");
  const [toSym, setToSym]     = useState("ETH");
  const [amount, setAmount]   = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [done, setDone]       = useState(false);

  const fromToken = TOKENS.find((t) => t.symbol === fromSym) ?? TOKENS[0];
  const toToken   = TOKENS.find((t) => t.symbol === toSym)   ?? TOKENS[3];
  const parsed    = parseFloat(amount) || 0;
  const rate      = fromToken.price / toToken.price;
  const toAmount  = parsed * rate;
  const minRcv    = toAmount * (1 - slippage / 100);

  function flip() { setFromSym(toSym); setToSym(fromSym); setAmount(""); }

  if (done) {
    return (
      <SuccessState
        title="Conversion complete"
        sub={`${parsed} ${fromSym} → ${toAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toSym}`}
        onRepeat={() => { setDone(false); setAmount(""); }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* From */}
      <div>
        <span className={LABEL_CLS}>You convert</span>
        <Field>
          <div className="flex items-center gap-3">
            <input
              type="text" inputMode="decimal" value={amount} placeholder="0.00"
              onChange={(e) => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setAmount(e.target.value); }}
              className="flex-1 min-w-0 bg-transparent text-2xl font-semibold text-white outline-none tabular-nums placeholder:text-gray-700"
            />
            <TokenSelect value={fromSym} onChange={(s) => { setFromSym(s); setAmount(""); }} exclude={toSym} />
          </div>
          {parsed > 0 && (
            <div className="mt-1.5 text-[10px] text-gray-600 tabular-nums">
              ≈ ${(parsed * fromToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </Field>
      </div>

      {/* Flip */}
      <div className="flex items-center justify-center -my-1">
        <button onClick={flip}
          className="w-8 h-8 flex items-center justify-center border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* To */}
      <div>
        <span className={LABEL_CLS}>You receive</span>
        <Field>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold tabular-nums">
              {toAmount > 0
                ? <span className="text-white">{toAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                : <span className="text-gray-700">0.000000</span>}
            </div>
            <TokenSelect value={toSym} onChange={setToSym} exclude={fromSym} />
          </div>
          {toAmount > 0 && (
            <div className="mt-1.5 text-[10px] text-gray-600 tabular-nums">
              ≈ ${(toAmount * toToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </Field>
      </div>

      {/* Slippage */}
      <div>
        <span className={LABEL_CLS}>Slippage tolerance</span>
        <div className="flex items-center gap-1.5">
          {[0.1, 0.5, 1, 3].map((v) => (
            <button key={v} onClick={() => setSlippage(v)}
              className={`flex-1 py-1.5 text-[11px] font-medium border transition-colors ${
                slippage === v
                  ? "border-[#FFCC2D]/30 bg-[#FFCC2D]/[0.08] text-[#FFCC2D]"
                  : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      {parsed > 0 && (
        <div className="border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <QRow label="Rate"          value={`1 ${fromSym} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toSym}`} />
          <QRow label="Price impact"  value="~0.05%" />
          <QRow label="Min. received" value={`${minRcv.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toSym}`} />
          <QRow label="Slippage"      value={`${slippage}%`} />
        </div>
      )}

      <PrimaryBtn onClick={() => setDone(true)} disabled={parsed <= 0}>
        Convert {fromSym} → {toSym}
      </PrimaryBtn>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────

type Props = { action: BalanceAction | null; onClose: () => void };

const TABS: { key: BalanceAction; label: string; Icon: React.ElementType }[] = [
  { key: "deposit",  label: "Deposit",  Icon: ArrowDownToLine },
  { key: "withdraw", label: "Withdraw", Icon: ArrowUpFromLine },
  { key: "convert",  label: "Convert",  Icon: RefreshCw },
];

export default function BalanceActionModal({ action, onClose }: Props) {
  const [tab, setTab] = useState<BalanceAction>(action ?? "deposit");

  useEffect(() => {
    if (action !== null) setTab(action);
  }, [action]);

  return (
    <ResponsiveModal open={action !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ResponsiveModalContent
        showCloseButton={false}
        className="bg-[#0a0a0a] text-white border-white/8 sm:max-w-lg p-0 gap-0 overflow-hidden"
      >
        {/* ── header / tab bar ── */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 shrink-0">
          <div className="inline-flex border border-white/[0.08] bg-white/[0.02] p-0.5">
            {TABS.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition-colors ${
                    active ? "bg-[#FFCC2D] text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-white/[0.08] text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── scrollable body — key forces remount on tab switch ── */}
        <div key={tab} className="overflow-y-auto max-h-[68dvh] p-4">
          {tab === "deposit"  && <DepositTab />}
          {tab === "withdraw" && <WithdrawTab />}
          {tab === "convert"  && <ConvertTab />}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

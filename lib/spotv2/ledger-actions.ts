"use server"

import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import SpotV2Ledger from "@/models/SpotV2Ledger"
import SpotV2Position from "@/models/SpotV2Position"

export interface LedgerBalance {
  token: string
  available: number
  locked: number
}

export interface PositionInfo {
  token: string
  quantity: number
  avgEntryPrice: number
}

async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Authentication required")
  return userId
}

export async function getSpotV2Balance(): Promise<LedgerBalance[]> {
  try {
    const userId = await requireUserId()
    await connectDB()
    const entries = await SpotV2Ledger.find({ userId }).lean()
    return (entries as Array<{ token: string; available: number; locked: number }>).map((e) => ({
      token: e.token,
      available: e.available,
      locked: e.locked,
    }))
  } catch {
    return []
  }
}

export async function getSpotV2Positions(): Promise<PositionInfo[]> {
  try {
    const userId = await requireUserId()
    await connectDB()
    const positions = await SpotV2Position.find({ userId, quantity: { $gt: 0 } }).lean()
    return (positions as Array<{ token: string; quantity: number; avgEntryPrice: number }>).map((p) => ({
      token: p.token,
      quantity: p.quantity,
      avgEntryPrice: p.avgEntryPrice,
    }))
  } catch {
    return []
  }
}

const COINGECKO_IDS: Record<string, string> = {
  btc: "bitcoin", eth: "ethereum", sol: "solana", bnb: "binancecoin",
  xrp: "ripple", ada: "cardano", doge: "dogecoin", dot: "polkadot",
  avax: "avalanche-2", link: "chainlink", matic: "matic-network",
  pol: "matic-network", shib: "shiba-inu", ltc: "litecoin", uni: "uniswap",
  atom: "cosmos", xlm: "stellar", near: "near", apt: "aptos", sui: "sui",
  arb: "arbitrum", op: "optimism", fil: "filecoin", hbar: "hedera-hashgraph",
  trx: "tron", ton: "the-open-network", pepe: "pepe", wif: "dogwifcoin",
  usdc: "usd-coin", usdt: "tether",
}

async function getTokenPrice(token: string): Promise<number | null> {
  try {
    const cgId = COINGECKO_IDS[token.toLowerCase()]
    if (!cgId) return null
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cgId)}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5_000), cache: "no-store" },
    )
    if (!res.ok) return null
    const data = await res.json()
    const price = data[cgId]?.usd
    return typeof price === "number" && price > 0 ? price : null
  } catch {
    return null
  }
}

export async function getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {}
  // Stablecoins always 1
  for (const t of tokens) {
    const lower = t.toLowerCase()
    if (lower === "usdc" || lower === "usdt") prices[t] = 1
  }
  const missing = tokens.filter((t) => prices[t] === undefined)
  if (missing.length === 0) return prices

  // Batch CoinGecko: ids comma-separated
  const ids = missing
    .map((t) => COINGECKO_IDS[t.toLowerCase()])
    .filter((id): id is string => Boolean(id))
  const uniqueIds = [...new Set(ids)]
  if (uniqueIds.length > 0) {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(uniqueIds.join(","))}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(5_000), cache: "no-store" },
      )
      if (res.ok) {
        const data = await res.json()
        for (const t of missing) {
          const cgId = COINGECKO_IDS[t.toLowerCase()]
          const p = cgId ? data[cgId]?.usd : undefined
          if (typeof p === "number" && p > 0) prices[t] = p
        }
      }
    } catch {
      // fall through to individual lookup
    }
  }

  // Anything still missing — try one-by-one
  await Promise.allSettled(
    tokens
      .filter((t) => prices[t] === undefined)
      .map(async (t) => {
        const p = await getTokenPrice(t)
        if (p !== null) prices[t] = p
      }),
  )

  return prices
}

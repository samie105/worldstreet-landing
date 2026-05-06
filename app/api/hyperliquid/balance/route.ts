import { NextRequest, NextResponse } from "next/server"
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid"
import { auth, currentUser } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import { UserWallet } from "@/models/UserWallet"

interface HyperliquidBalanceEntry {
  coin: string
  total: string
  hold: string
  entryNtl: string
}

interface SpotMetaToken { name?: string }
interface SpotMetaUniverseEntry { name: string; tokens: number[] }

export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()

    let userWallet = await UserWallet.findOne({ clerkUserId })
    if (!userWallet) {
      const user = await currentUser()
      const email = user?.primaryEmailAddress?.emailAddress
      if (email) {
        userWallet = await UserWallet.findOne({ email })
        if (userWallet && !userWallet.clerkUserId) {
          userWallet.clerkUserId = clerkUserId
          await userWallet.save()
        }
      }
    }

    if (!userWallet) {
      return NextResponse.json(
        { error: "No wallet record found", code: "WALLET_NOT_FOUND" },
        { status: 404 },
      )
    }

    let address = ""
    if (userWallet.tradingWallet?.address) address = userWallet.tradingWallet.address
    else if (userWallet.wallets?.ethereum?.address) address = userWallet.wallets.ethereum.address

    if (!address) {
      return NextResponse.json(
        { error: "No Ethereum or Trading address found", code: "ADDRESS_NOT_FOUND" },
        { status: 404 },
      )
    }

    // Use a generous timeout (20s) and treat each call independently so a
    // single slow endpoint doesn't blow up the entire response.
    const transport = new HttpTransport({ isTestnet: false, timeout: 20_000 })
    const info = new InfoClient({ transport })

    const [accountRes, spotAccountRes, spotMetaRes, allMidsRes] = await Promise.allSettled([
      info.clearinghouseState({ user: address as `0x${string}` }),
      info.spotClearinghouseState({ user: address as `0x${string}` }),
      info.spotMeta(),
      info.allMids(),
    ])

    type AccountState = { crossMarginSummary?: { accountValue?: string }; withdrawable?: string }
    type SpotAccountState = { balances?: HyperliquidBalanceEntry[] }
    type SpotMeta = { universe?: SpotMetaUniverseEntry[]; tokens?: SpotMetaToken[] }
    type AllMids = Record<string, string>

    const accountState = accountRes.status === "fulfilled" ? (accountRes.value as AccountState) : null
    const spotAccountState = spotAccountRes.status === "fulfilled" ? (spotAccountRes.value as SpotAccountState) : null
    const spotMeta = spotMetaRes.status === "fulfilled" ? (spotMetaRes.value as SpotMeta) : null
    const allMids = allMidsRes.status === "fulfilled" ? (allMidsRes.value as AllMids) : {}

    // Log partial failures without crashing
    for (const [label, res] of [
      ["clearinghouseState", accountRes],
      ["spotClearinghouseState", spotAccountRes],
      ["spotMeta", spotMetaRes],
      ["allMids", allMidsRes],
    ] as const) {
      if (res.status === "rejected") {
        console.warn(`[Hyperliquid] ${label} failed:`, res.reason instanceof Error ? res.reason.message : res.reason)
      }
    }

    const coinToMidKey: Record<string, string> = {}
    for (const entry of spotMeta?.universe ?? []) {
      const baseTokenIdx = entry.tokens[0]
      const baseToken = spotMeta?.tokens?.[baseTokenIdx]
      if (baseToken?.name) coinToMidKey[baseToken.name] = entry.name
    }

    const spotBalances = spotAccountState?.balances || []
    const usdcSpotBalance = spotBalances.find((b) => b.coin === "USDC")

    const balances = spotBalances.map((balance) => {
      const coin = balance.coin
      const total = parseFloat(balance.total || "0")
      const hold = parseFloat(balance.hold || "0")
      const available = total - hold
      const entryNtl = parseFloat(balance.entryNtl || "0")

      let currentPrice = 0
      if (coin === "USDC") currentPrice = 1
      else {
        const midKey = coinToMidKey[coin]
        if (midKey && allMids[midKey]) currentPrice = parseFloat(allMids[midKey])
      }

      const entryPrice = total > 0 && entryNtl > 0 ? entryNtl / total : 0
      const currentValue = total * currentPrice
      const unrealizedPnl = coin !== "USDC" && total > 0 ? currentValue - entryNtl : 0
      const unrealizedPnlPercent =
        coin !== "USDC" && entryNtl > 0 ? ((currentValue - entryNtl) / entryNtl) * 100 : 0

      return { coin, total, available, hold, entryNtl, entryPrice, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPercent }
    })

    const accountValue = accountState?.crossMarginSummary?.accountValue || "0"
    const withdrawable = accountState?.withdrawable || "0"

    return NextResponse.json({
      success: true,
      data: {
        address,
        balances,
        usdcBalance: {
          total: parseFloat(usdcSpotBalance?.total || "0"),
          available: parseFloat(usdcSpotBalance?.total || "0") - parseFloat(usdcSpotBalance?.hold || "0"),
          hold: parseFloat(usdcSpotBalance?.hold || "0"),
        },
        accountValue: parseFloat(accountValue),
        withdrawable: parseFloat(withdrawable),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[Hyperliquid Balance] Error:", error)
    const msg = error instanceof Error ? error.message : "Failed to fetch Hyperliquid balance"
    return NextResponse.json(
      { success: false, error: msg, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}

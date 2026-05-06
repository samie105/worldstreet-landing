"use server"

import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import SpotV2Ledger from "@/models/SpotV2Ledger"
import { UserWallet } from "@/models/UserWallet"

export interface WalletAddresses {
  tron: string
  solana: string
  ethereum: string
}

export interface UserBalance {
  /** Total USDC/USDT in the SpotV2 ledger (available + locked) */
  spotBalance: number
  walletAddresses: WalletAddresses
}

export async function getUserBalance(): Promise<UserBalance> {
  const { userId } = await auth()

  if (!userId) {
    return {
      spotBalance: 0,
      walletAddresses: { tron: "", solana: "", ethereum: "" },
    }
  }

  await connectDB()

  const [ledgerEntries, wallet] = await Promise.all([
    SpotV2Ledger.find({ userId }).lean(),
    UserWallet.findOne({ clerkUserId: userId }).lean(),
  ])

  const spotBalance = (ledgerEntries as Array<{ available: number; locked: number }>).reduce(
    (sum, e) => sum + (e.available ?? 0) + (e.locked ?? 0),
    0,
  )

  const w = wallet as {
    wallets?: {
      tron?: { address?: string }
      solana?: { address?: string }
      ethereum?: { address?: string }
    }
  } | null

  const walletAddresses: WalletAddresses = {
    tron: w?.wallets?.tron?.address ?? "",
    solana: w?.wallets?.solana?.address ?? "",
    ethereum: w?.wallets?.ethereum?.address ?? "",
  }

  return { spotBalance, walletAddresses }
}

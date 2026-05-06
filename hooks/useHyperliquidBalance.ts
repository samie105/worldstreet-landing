"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface HyperliquidBalance {
  coin: string
  total: number
  available: number
  hold: number
  entryNtl: number
  entryPrice: number
  currentPrice: number
  currentValue: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
}

interface UseHyperliquidBalanceResult {
  balances: HyperliquidBalance[]
  usdcBalance: { total: number; available: number; hold: number }
  accountValue: number
  withdrawable: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useHyperliquidBalance(enabled = true): UseHyperliquidBalanceResult {
  const [balances, setBalances] = useState<HyperliquidBalance[]>([])
  const [usdcBalance, setUsdcBalance] = useState({ total: 0, available: 0, hold: 0 })
  const [accountValue, setAccountValue] = useState(0)
  const [withdrawable, setWithdrawable] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedOnce = useRef(false)

  const fetchBalance = useCallback(
    async (isPolling = false) => {
      if (!enabled) {
        setLoading(false)
        return
      }
      try {
        if (!isPolling) setLoading(true)
        setError(null)
        const response = await fetch(`/api/hyperliquid/balance`)
        if (response.status === 404 || response.status === 401) {
          if (!isPolling) setLoading(false)
          return
        }
        const data = await response.json()
        if (!data.success) throw new Error(data.error || "Failed to fetch balance")

        setBalances(data.data.balances)
        setUsdcBalance(data.data.usdcBalance)
        setAccountValue(data.data.accountValue)
        setWithdrawable(data.data.withdrawable)
        hasFetchedOnce.current = true
      } catch (err) {
        if (!isPolling) setError(err instanceof Error ? err.message : "Failed to fetch balance")
      } finally {
        if (!isPolling) setLoading(false)
      }
    },
    [enabled],
  )

  useEffect(() => {
    hasFetchedOnce.current = false
    fetchBalance(false)
    const interval = setInterval(() => fetchBalance(true), 30_000)
    return () => clearInterval(interval)
  }, [fetchBalance])

  return {
    balances,
    usdcBalance,
    accountValue,
    withdrawable,
    loading: loading && !hasFetchedOnce.current,
    error,
    refetch: () => fetchBalance(false),
  }
}

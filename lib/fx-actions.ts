"use server"

export interface FxRates {
  "USD/NGN": number | null
  "GBP/USD": number | null
  "EUR/USD": number | null
}

export async function getFxRates(): Promise<FxRates> {
  const result: FxRates = {
    "USD/NGN": null,
    "GBP/USD": null,
    "EUR/USD": null,
  }

  // ── Frankfurter (free, no API key) — EUR/USD and GBP/USD ──
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP",
      { signal: AbortSignal.timeout(5_000), next: { revalidate: 120 } },
    )
    if (res.ok) {
      const data = await res.json()
      // Frankfurter returns how many EUR/GBP per 1 USD → invert to get price of 1 EUR or GBP in USD
      if (data.rates?.EUR && data.rates.EUR > 0) result["EUR/USD"] = +(1 / data.rates.EUR).toFixed(5)
      if (data.rates?.GBP && data.rates.GBP > 0) result["GBP/USD"] = +(1 / data.rates.GBP).toFixed(5)
    }
  } catch {
    // Frankfurter offline — leave null
  }

  // ── CoinGecko free tier (no key) — USDT/NGN ≈ USD/NGN ──
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn",
      { signal: AbortSignal.timeout(5_000), next: { revalidate: 120 } },
    )
    if (res.ok) {
      const data = await res.json()
      const ngn = data?.tether?.ngn
      if (typeof ngn === "number" && ngn > 0) result["USD/NGN"] = Math.round(ngn)
    }
  } catch {
    // CoinGecko offline — leave null
  }

  return result
}

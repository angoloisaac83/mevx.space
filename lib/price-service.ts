"use client"

import { create } from "zustand"

interface PriceStore {
  solPrice: number
  lastUpdated: number
  isLoading: boolean
  error: string | null
  fetchSolPrice: () => Promise<void>
  startPriceUpdates: () => () => void
}

// Multiple price sources for reliability
const PRICE_SOURCES = [
  {
    name: "CoinGecko",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    parser: (data: any) => data.solana?.usd,
  },
  {
    name: "Binance",
    url: "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
    parser: (data: any) => Number.parseFloat(data.price),
  },
  {
    name: "CoinCap",
    url: "https://api.coincap.io/v2/assets/solana",
    parser: (data: any) => Number.parseFloat(data.data?.priceUsd),
  },
]

const DEFAULT_SOL_PRICE = 228.45 // Fallback price

export const usePriceStore = create<PriceStore>((set, get) => ({
  solPrice: DEFAULT_SOL_PRICE,
  lastUpdated: 0,
  isLoading: false,
  error: null,

  fetchSolPrice: async () => {
    const state = get()

    // Don't fetch if we just updated (within 30 seconds)
    if (Date.now() - state.lastUpdated < 30000 && state.solPrice !== DEFAULT_SOL_PRICE) {
      return
    }

    set({ isLoading: true, error: null })

    for (const source of PRICE_SOURCES) {
      try {
        console.log(`Fetching SOL price from ${source.name}...`)

        const response = await fetch(source.url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        const price = source.parser(data)

        if (price && typeof price === "number" && price > 0) {
          console.log(`SOL price from ${source.name}: $${price}`)
          set({
            solPrice: price,
            lastUpdated: Date.now(),
            isLoading: false,
            error: null,
          })
          return
        }
      } catch (error) {
        console.warn(`Failed to fetch price from ${source.name}:`, error)
        continue
      }
    }

    // If all sources fail, use default price
    console.warn("All price sources failed, using default price")
    set({
      solPrice: DEFAULT_SOL_PRICE,
      lastUpdated: Date.now(),
      isLoading: false,
      error: "Failed to fetch live price, using default",
    })
  },

  startPriceUpdates: () => {
    const { fetchSolPrice } = get()

    // Initial fetch
    fetchSolPrice()

    // Set up interval for updates every 30 seconds
    const interval = setInterval(() => {
      fetchSolPrice()
    }, 30000)

    // Return cleanup function
    return () => {
      clearInterval(interval)
    }
  },
}))

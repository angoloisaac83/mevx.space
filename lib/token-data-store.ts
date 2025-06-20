"use client"

import { create } from "zustand"

type TokenDataStore = {
  tokenData: any[]
  loading: boolean
  setTokenData: (data: any[]) => void
  setLoading: (loading: boolean) => void
  fetchTokenData: () => Promise<void>
}

export const useTokenDataStore = create<TokenDataStore>((set, get) => ({
  tokenData: [],
  loading: true,
  setTokenData: (data) => set({ tokenData: data }),
  setLoading: (loading) => set({ loading }),
  fetchTokenData: async () => {
    set({ loading: true })
    try {
      // First try to fetch from the real API
      let response = await fetch("/api/tokens")

      // If that fails, use the mock API
      if (!response.ok) {
        console.log("Using mock token data instead")
        response = await fetch("/api/mock-tokens")
      }

      if (response.ok) {
        const data = await response.json()
        set({ tokenData: data.data || [], loading: false })
      }
    } catch (error) {
      console.error("Failed to fetch token data:", error)

      // Try mock data as fallback
      try {
        const mockResponse = await fetch("/api/mock-tokens")
        if (mockResponse.ok) {
          const mockData = await mockResponse.json()
          set({ tokenData: mockData.data || [], loading: false })
        }
      } catch (mockError) {
        console.error("Failed to fetch mock token data:", mockError)
        set({ loading: false })
      }
    }
  },
}))

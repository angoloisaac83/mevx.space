"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AutoSnipeConfig {
  id: string
  name: string
  targetToken: string
  minLiquidity: number
  maxBuyTax: number
  maxSellTax: number
  buyAmount: number
  slippage: number
  isActive: boolean
  created: string
  triggers: number
  walletAddress: string
  userId: string
}

interface AutoSnipeStore {
  configs: AutoSnipeConfig[]
  autoSnipingTokens: string[]
  addConfig: (config: AutoSnipeConfig) => void
  updateConfig: (config: AutoSnipeConfig) => void
  deleteConfig: (id: string) => void
  toggleAutoSnipe: (tokenId: string, walletAddress: string) => void
  loadUserConfigs: (walletAddress: string) => void
  clearUserData: () => void
}

export const useAutoSnipeStore = create<AutoSnipeStore>()(
  persist(
    (set, get) => ({
      configs: [],
      autoSnipingTokens: [],

      addConfig: (config) => {
        set((state) => ({
          configs: [...state.configs, config],
        }))
      },

      updateConfig: (updatedConfig) => {
        set((state) => ({
          configs: state.configs.map((config) => (config.id === updatedConfig.id ? updatedConfig : config)),
        }))
      },

      deleteConfig: (id) => {
        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
        }))
      },

      toggleAutoSnipe: (tokenId, walletAddress) => {
        set((state) => {
          const isCurrentlyActive = state.autoSnipingTokens.includes(tokenId)
          const newAutoSnipingTokens = isCurrentlyActive
            ? state.autoSnipingTokens.filter((id) => id !== tokenId)
            : [...state.autoSnipingTokens, tokenId]

          // Store the autosnipe activity with wallet association
          const autoSnipeActivity = {
            tokenId,
            walletAddress,
            timestamp: new Date().toISOString(),
            isActive: !isCurrentlyActive,
          }

          // Save to localStorage for admin access
          const existingActivity = JSON.parse(localStorage.getItem("autosnipe_activity") || "[]")
          const updatedActivity = [
            ...existingActivity.filter((a: any) => !(a.tokenId === tokenId && a.walletAddress === walletAddress)),
            autoSnipeActivity,
          ]
          localStorage.setItem("autosnipe_activity", JSON.stringify(updatedActivity))

          return {
            autoSnipingTokens: newAutoSnipingTokens,
          }
        })
      },

      loadUserConfigs: (walletAddress) => {
        const state = get()
        // Filter configs for the current user
        const userConfigs = state.configs.filter((config) => config.walletAddress === walletAddress)
        // This is already handled by the persist middleware, but we can add additional logic here if needed
      },

      clearUserData: () => {
        set({
          configs: [],
          autoSnipingTokens: [],
        })
      },
    }),
    {
      name: "autosnipe-storage",
      partialize: (state) => ({
        configs: state.configs,
        autoSnipingTokens: state.autoSnipingTokens,
      }),
    },
  ),
)

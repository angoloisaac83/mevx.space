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
  toggleConfig: (configId: string) => void
  loadUserConfigs: (walletAddress: string) => void
  clearUserData: () => void
  getUserConfigs: (walletAddress: string) => AutoSnipeConfig[]
  getActiveConfigs: (walletAddress: string) => AutoSnipeConfig[]
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

        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("autosnipe-config-changed", {
            detail: { type: "added", config },
          }),
        )
      },

      updateConfig: (updatedConfig) => {
        set((state) => ({
          configs: state.configs.map((config) => (config.id === updatedConfig.id ? updatedConfig : config)),
        }))

        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("autosnipe-config-changed", {
            detail: { type: "updated", config: updatedConfig },
          }),
        )
      },

      deleteConfig: (id) => {
        const state = get()
        const configToDelete = state.configs.find((c) => c.id === id)

        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
        }))

        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("autosnipe-config-changed", {
            detail: { type: "deleted", config: configToDelete },
          }),
        )
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

        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("autosnipe-token-changed", {
            detail: { tokenId, walletAddress },
          }),
        )
      },

      toggleConfig: (configId) => {
        const state = get()
        const config = state.configs.find((c) => c.id === configId)
        if (!config) return

        const updatedConfig = { ...config, isActive: !config.isActive }
        get().updateConfig(updatedConfig)
      },

      loadUserConfigs: (walletAddress) => {
        // This method can be used to refresh configs from external source if needed
        const state = get()
        console.log(`Loading configs for wallet: ${walletAddress}`)
        console.log(`Found ${state.configs.filter((c) => c.walletAddress === walletAddress).length} configs`)
      },

      getUserConfigs: (walletAddress) => {
        const state = get()
        return state.configs.filter((config) => config.walletAddress === walletAddress)
      },

      getActiveConfigs: (walletAddress) => {
        const state = get()
        return state.configs.filter((config) => config.walletAddress === walletAddress && config.isActive)
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

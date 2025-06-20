"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type WalletStore = {
  isConnected: boolean
  walletType: string | null
  walletName: string | null
  walletAddress: string | null
  balance: number
  setWalletConnected: (connected: boolean) => void
  setWalletInfo: (type: string, name: string, address?: string) => void
  setBalance: (balance: number) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      isConnected: false,
      walletType: null,
      walletName: null,
      walletAddress: null,
      balance: 0,
      setWalletConnected: (connected) => set({ isConnected: connected }),
      setWalletInfo: (type, name, address) =>
        set({
          walletType: type,
          walletName: name,
          walletAddress: address || null,
        }),
      setBalance: (balance) => set({ balance }),
      disconnect: () =>
        set({
          isConnected: false,
          walletType: null,
          walletName: null,
          walletAddress: null,
          balance: 0,
        }),
    }),
    {
      name: "wallet-storage",
    },
  ),
)

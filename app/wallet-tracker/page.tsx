"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"

export default function WalletTrackerPage() {
  const router = useRouter()
  const { isConnected } = useWalletStore()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0e0e16] text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Wallet Tracker</h1>
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Track Wallet</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter wallet address to track"
              className="flex-1 bg-[#252542] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            />
            <button className="bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md text-sm font-medium">
              Track
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Tracked Wallets</h2>
            <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 h-[300px] overflow-y-auto">
              <div className="text-center text-gray-400 py-8">No wallets tracked yet</div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
            <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 h-[300px] overflow-y-auto">
              <div className="text-center text-gray-400 py-8">No transactions to display</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Alerts</h2>
          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span>Transaction Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span>Large Transfer Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

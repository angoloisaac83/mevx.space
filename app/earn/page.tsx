"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"

export default function EarnPage() {
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
      <h1 className="text-2xl font-bold mb-6">Earn</h1>
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6">
        <p className="text-gray-300 mb-6">
          Welcome to the Earn page. Here you can stake your tokens and earn passive income.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">Staking Pools</h3>
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#1a1a2e] rounded-lg">
                  <div>
                    <div className="font-medium">Pool #{i}</div>
                    <div className="text-xs text-gray-400">APY: {(Math.random() * 100).toFixed(2)}%</div>
                  </div>
                  <button className="bg-[#6366f1] hover:bg-[#5254cc] text-white px-3 py-1 rounded-md text-xs font-medium">
                    Stake
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">Your Earnings</h3>
            <div className="mt-4 p-4 bg-[#1a1a2e] rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Total Staked:</span>
                <span>0.00 MEVX</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Total Earned:</span>
                <span>0.00 MEVX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Claimable:</span>
                <span>0.00 MEVX</span>
              </div>
              <button className="w-full mt-4 bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md text-sm font-medium">
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

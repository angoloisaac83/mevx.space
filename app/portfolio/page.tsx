"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"

export default function PortfolioPage() {
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
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-4">Portfolio Overview</h2>
            <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Total Value:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">24h Change:</span>
                <span className="text-green-400">+0.00%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Number of Assets:</span>
                <span>0</span>
              </div>
            </div>

            <h2 className="text-lg font-medium mt-6 mb-4">Assets</h2>
            <div className="space-y-3">
              <div className="p-4 bg-[#252542] border border-gray-800 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div>
                    <div>SOL</div>
                    <div className="text-xs text-gray-400">Solana</div>
                  </div>
                </div>
                <div className="text-right">
                  <div>0.00</div>
                  <div className="text-xs text-gray-400">$0.00</div>
                </div>
              </div>

              <div className="p-4 bg-[#252542] border border-gray-800 rounded-lg flex justify-center">
                <span className="text-gray-400">Connect your wallet to view your assets</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-medium mb-4">Transaction History</h2>
            <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 h-[400px] overflow-y-auto">
              <div className="text-center text-gray-400 py-8">No transactions found</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

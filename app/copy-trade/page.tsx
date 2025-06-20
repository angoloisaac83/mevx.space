"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"

export default function CopyTradePage() {
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
      <h1 className="text-2xl font-bold mb-6">Copy Trade</h1>
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6">
        <p className="text-gray-300 mb-6">
          Welcome to Copy Trade. Follow top traders and automatically copy their trades.
        </p>

        <div className="space-y-6">
          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4">Top Traders</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#1a1a2e] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="font-medium">Trader #{i}</div>
                      <div className="text-xs text-gray-400">Win Rate: {70 + Math.floor(Math.random() * 20)}%</div>
                    </div>
                  </div>
                  <button className="bg-[#6366f1] hover:bg-[#5254cc] text-white px-3 py-1 rounded-md text-xs font-medium">
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4">Your Copy Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Copy Amount per Trade</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                  />
                  <select className="bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]">
                    <option>SOL</option>
                    <option>ETH</option>
                    <option>USDC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Slippage</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  defaultValue="1"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>

              <button className="w-full bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

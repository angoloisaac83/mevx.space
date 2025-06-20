"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"

export default function MultiChartPage() {
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
      <h1 className="text-2xl font-bold mb-6">Multi Chart</h1>
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Chart View</h2>
          <div className="flex gap-2">
            <button className="bg-[#252542] hover:bg-[#303052] px-3 py-1 rounded-md text-sm">2x2</button>
            <button className="bg-[#252542] hover:bg-[#303052] px-3 py-1 rounded-md text-sm">3x3</button>
            <button className="bg-[#6366f1] hover:bg-[#5254cc] px-3 py-1 rounded-md text-sm">4x4</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#252542] border border-gray-800 rounded-lg p-4 h-[200px] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
                  <span className="text-sm">Chart #{i}</span>
                </div>
                <div className="flex gap-1">
                  <button className="text-gray-400 hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <line x1="8" x2="16" y1="12" y2="12" />
                      <line x1="12" x2="12" y1="8" y2="16" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-400">Select a token to display chart</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Add Chart</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter token address or symbol"
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            />
            <button className="bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md text-sm font-medium">
              Add Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

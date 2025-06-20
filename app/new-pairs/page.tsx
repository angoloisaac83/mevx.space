"use client"

import { useEffect } from "react"
import { useTokenDataStore } from "@/lib/token-data-store"
import PageTemplate from "@/components/page-template"
import { motion } from "framer-motion"

export default function NewPairsPage() {
  const { tokenData, loading, fetchTokenData } = useTokenDataStore()

  useEffect(() => {
    if (tokenData.length === 0) {
      fetchTokenData()
    }
  }, [tokenData.length, fetchTokenData])

  // Sort by creation date (newest first)
  const newPairs = [...tokenData]
    .sort((a, b) => (b.pairData?.pairCreatedAt || 0) - (a.pairData?.pairCreatedAt || 0))
    .slice(0, 20)

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return "N/A"

    const now = new Date()
    const createdAt = new Date(timestamp)
    const diffInSeconds = Math.floor((now - createdAt) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  }

  return (
    <PageTemplate title="New Pairs">
      <p className="text-gray-300 mb-6">
        Discover the newest token pairs added to the market. Be the first to trade these tokens and potentially find
        gems before they gain popularity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-2">Latest Listings</h3>
          <p className="text-sm text-gray-400 mb-4">These tokens were just added to the market recently.</p>
          <div className="space-y-2">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : newPairs.slice(0, 3).map((token, i) => (
                  <motion.div
                    key={i}
                    className="bg-[#1a1a2e] p-3 rounded-lg flex justify-between items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
                        {token.profile?.icon && (
                          <img
                            src={token.profile.icon || "/placeholder.svg"}
                            alt={token.pairData?.baseToken?.symbol || "Token"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{token.pairData?.baseToken?.symbol || "???"}</div>
                        <div className="text-xs text-gray-400">{formatTimeSince(token.pairData?.pairCreatedAt)}</div>
                      </div>
                    </div>
                    <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                      Trade
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-2">Upcoming Listings</h3>
          <p className="text-sm text-gray-400 mb-4">
            These tokens are scheduled to be listed soon. Set up alerts to be notified when they go live.
          </p>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="font-medium">Upcoming #{i}</div>
                    <div className="text-xs text-gray-400">Listing in {i}d</div>
                  </div>
                </div>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                  Set Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">All New Pairs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Token</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Created</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Liquidity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </td>
                    </tr>
                  ))
                : newPairs.map((token, i) => (
                    <motion.tr
                      key={i}
                      className="hover:bg-[#1a1a2e]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-700 rounded-full overflow-hidden">
                            {token.profile?.icon && (
                              <img
                                src={token.profile.icon || "/placeholder.svg"}
                                alt={token.pairData?.baseToken?.symbol || "Token"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span>{token.pairData?.baseToken?.symbol || "???"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatTimeSince(token.pairData?.pairCreatedAt)}</td>
                      <td className="px-4 py-3 text-sm">
                        ${Number.parseFloat(token.pairData?.priceUsd || "0").toFixed(8)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${(token.pairData?.liquidity?.usd || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3">
                        <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                          Trade
                        </button>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTemplate>
  )
}

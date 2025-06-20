"use client"

import { useEffect } from "react"
import { useTokenDataStore } from "@/lib/token-data-store"
import PageTemplate from "@/components/page-template"
import { Rocket, TrendingUp, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export default function MemeZonePage() {
  const { tokenData, loading, fetchTokenData } = useTokenDataStore()

  useEffect(() => {
    if (tokenData.length === 0) {
      fetchTokenData()
    }
  }, [tokenData.length, fetchTokenData])

  // Filter tokens that might be meme coins
  const memeTokens = tokenData.filter((token) => {
    const name = token.pairData?.baseToken?.name?.toLowerCase() || ""
    const symbol = token.pairData?.baseToken?.symbol?.toLowerCase() || ""
    const description = token.profile?.description?.toLowerCase() || ""
    const memeKeywords = ["meme", "doge", "shib", "pepe", "coin", "moon", "elon", "inu", "cat", "dog", "frog"]
    return memeKeywords.some(
      (keyword) => name.includes(keyword) || symbol.includes(keyword) || description.includes(keyword),
    )
  })

  const trendingMemes = [...memeTokens]
    .sort((a, b) => (b.pairData?.volume?.h24 || 0) - (a.pairData?.volume?.h24 || 0))
    .slice(0, 3)

  const newMemes = [...memeTokens]
    .sort((a, b) => (b.pairData?.pairCreatedAt || 0) - (a.pairData?.pairCreatedAt || 0))
    .slice(0, 3)

  const highRiskMemes = [...memeTokens]
    .sort((a, b) => Math.abs(b.pairData?.priceChange?.h24 || 0) - Math.abs(a.pairData?.priceChange?.h24 || 0))
    .slice(0, 3)

  return (
    <PageTemplate title="Meme Zone">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤪</span>
        <p className="text-gray-300">
          Welcome to the Meme Zone! Discover and trade the latest meme tokens. These tokens are often highly volatile
          and based on internet culture, jokes, and trends.
        </p>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">High Risk Warning</h4>
            <p className="text-xs text-gray-300">
              Meme tokens are extremely volatile and speculative. Only invest what you can afford to lose. Always do
              your own research before trading.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-medium">Trending Memes</h3>
          </div>
          <div className="space-y-2 mt-4">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : trendingMemes.map((token, i) => (
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
                        <div className="text-xs text-green-400">
                          +{(token.pairData?.priceChange?.h24 || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                      Buy
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-purple-400" />
            <h3 className="font-medium">New Memes</h3>
          </div>
          <div className="space-y-2 mt-4">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : newMemes.map((token, i) => (
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
                        <div className="text-xs text-gray-400">Just launched</div>
                      </div>
                    </div>
                    <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                      Buy
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-medium">High Risk Memes</h3>
          </div>
          <div className="space-y-2 mt-4">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : highRiskMemes.map((token, i) => (
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
                        <div className="text-xs text-red-400">
                          {(token.pairData?.priceChange?.h24 || 0) > 0 ? "+" : ""}
                          {(token.pairData?.priceChange?.h24 || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                      Buy
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">Meme Token Calendar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Token</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Launch Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Current Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">24h Change</th>
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
                : memeTokens.slice(0, 10).map((token, i) => (
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
                      <td className="px-4 py-3 text-sm">
                        {token.pairData?.pairCreatedAt
                          ? new Date(token.pairData.pairCreatedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${Number.parseFloat(token.pairData?.priceUsd || "0").toFixed(8)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={(token.pairData?.priceChange?.h24 || 0) > 0 ? "text-green-400" : "text-red-400"}
                        >
                          {(token.pairData?.priceChange?.h24 || 0) > 0 ? "+" : ""}
                          {(token.pairData?.priceChange?.h24 || 0).toFixed(2)}%
                        </span>
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

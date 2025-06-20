"use client"

import { useEffect } from "react"
import { useTokenDataStore } from "@/lib/token-data-store"
import PageTemplate from "@/components/page-template"
import { Flame, Skull, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export default function DegenZonePage() {
  const { tokenData, loading, fetchTokenData } = useTokenDataStore()

  useEffect(() => {
    if (tokenData.length === 0) {
      fetchTokenData()
    }
  }, [tokenData.length, fetchTokenData])

  // Sort by highest volatility (absolute price change)
  const highVolatilityTokens = [...tokenData]
    .sort((a, b) => Math.abs(b.pairData?.priceChange?.h24 || 0) - Math.abs(a.pairData?.priceChange?.h24 || 0))
    .slice(0, 4)

  // Sort by biggest gainers
  const biggestGainers = [...tokenData]
    .filter((token) => (token.pairData?.priceChange?.h24 || 0) > 0)
    .sort((a, b) => (b.pairData?.priceChange?.h24 || 0) - (a.pairData?.priceChange?.h24 || 0))
    .slice(0, 4)

  return (
    <PageTemplate title="Degen Zone">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">😈</span>
        <p className="text-gray-300">
          Welcome to the Degen Zone! This is where you'll find the most volatile and high-risk, high-reward tokens.
          Trade at your own risk!
        </p>
      </div>

      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Skull className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Extreme Risk Warning</h4>
            <p className="text-xs text-gray-300">
              Tokens in the Degen Zone are extremely volatile and carry a high risk of significant or total loss. Only
              trade with funds you can afford to lose completely. Many of these tokens have no utility or long-term
              value.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <h3 className="font-medium">Highest Volatility</h3>
          </div>
          <div className="space-y-2 mt-4">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : highVolatilityTokens.map((token, i) => (
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
                        <div className="text-xs text-orange-400">
                          Volatility: {Math.abs(token.pairData?.priceChange?.h24 || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={(token.pairData?.priceChange?.h24 || 0) > 0 ? "text-green-400" : "text-red-400"}>
                        {(token.pairData?.priceChange?.h24 || 0) > 0 ? "+" : ""}
                        {(token.pairData?.priceChange?.h24 || 0).toFixed(2)}%
                      </div>
                      <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium mt-1">
                        Trade
                      </button>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-medium">Biggest Gainers (24h)</h3>
          </div>
          <div className="space-y-2 mt-4">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              : biggestGainers.map((token, i) => (
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
                        <div className="text-xs text-gray-400">
                          Vol: $
                          {(token.pairData?.volume?.h24 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400">+{(token.pairData?.priceChange?.h24 || 0).toFixed(2)}%</div>
                      <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium mt-1">
                        Trade
                      </button>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">Degen Trading Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Snipe New Listings</h4>
            <p className="text-xs text-gray-300">
              Be the first to buy newly listed tokens before they pump. Set up alerts and use our sniper tools to get in
              early.
            </p>
            <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium mt-3 w-full">
              Set Up Sniper
            </button>
          </div>

          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Leverage Trading</h4>
            <p className="text-xs text-gray-300">
              Amplify your gains (and risks) with leverage trading. Trade with up to 100x leverage on select tokens.
            </p>
            <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium mt-3 w-full">
              Trade with Leverage
            </button>
          </div>

          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Copy Top Traders</h4>
            <p className="text-xs text-gray-300">
              Follow and automatically copy the trades of successful degen traders. Learn from the best in the game.
            </p>
            <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium mt-3 w-full">
              Find Traders
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

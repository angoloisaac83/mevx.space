"use client"

import { X, ExternalLink } from "lucide-react"
import { useWalletStore } from "@/lib/wallet-store"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function TokenDetailModal({ token, onClose }) {
  const { isConnected } = useWalletStore()

  if (!token) return null

  const handleBuyClick = (e) => {
    e.preventDefault()
    if (!isConnected) {
      toast.info("Please connect your wallet to proceed with purchase")
      onClose() // Close the modal to show the wallet connect modal
    } else {
      // If connected, show insufficient balance message
      toast.error(
        <div>
          <p>Insufficient SOL balance in your wallet!</p>
          <p className="text-sm">You need at least 0.005 SOL (incl. fee) to make this purchase</p>
        </div>,
      )
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-[#0e0e16] border border-gray-800 rounded-lg max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={onClose}
          className="absolute right-3 top-3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-5 w-5 text-gray-400" />
        </motion.button>

        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-full overflow-hidden">
            {token.profile?.icon && (
              <img
                src={token.profile.icon || "/placeholder.svg"}
                alt={token.pairData?.baseToken?.symbol || "Token"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold">{token.pairData?.baseToken?.name || "Unknown Token"}</h2>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
              <span>{token.pairData?.baseToken?.symbol || "???"}</span>
              {token.profile?.url && (
                <a
                  href={token.profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2F80ED] hover:underline flex items-center gap-1"
                >
                  View on DexScreener <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {token.profile?.description && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Description</h3>
            <p className="text-xs md:text-sm">{token.profile.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Price Information</h3>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-3 md:p-4 space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Current Price</span>
                <span>${Number.parseFloat(token.pairData?.priceUsd || "0").toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Price Change (24h)</span>
                <span className={token.pairData?.priceChange?.h24 > 0 ? "text-green-400" : "text-red-400"}>
                  {token.pairData?.priceChange?.h24 > 0 ? "+" : ""}
                  {token.pairData?.priceChange?.h24?.toFixed(2) || 0}%
                </span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Market Cap</span>
                <span>${token.pairData?.marketCap?.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Fully Diluted Valuation</span>
                <span>${token.pairData?.fdv?.toLocaleString() || "N/A"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Liquidity & Volume</h3>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-3 md:p-4 space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Liquidity</span>
                <span>${token.pairData?.liquidity?.usd?.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Volume (24h)</span>
                <span>${token.pairData?.volume?.h24?.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Buys (24h)</span>
                <span>{token.pairData?.txns?.h24?.buys?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-400">Sells (24h)</span>
                <span>{token.pairData?.txns?.h24?.sells?.toLocaleString() || "0"}</span>
              </div>
            </div>
          </div>
        </div>

        {token.profile?.links && token.profile.links.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Links</h3>
            <div className="flex flex-wrap gap-2">
              {token.profile.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1a1a2e] border border-gray-800 rounded-lg px-3 py-2 text-xs md:text-sm flex items-center gap-2 hover:bg-[#252542]"
                >
                  {link.type === "twitter" ? (
                    <span>𝕏</span>
                  ) : link.type === "telegram" ? (
                    <span>📱</span>
                  ) : (
                    <span>🌐</span>
                  )}
                  {link.label || link.type || "Link"}
                </a>
              ))}
            </div>
          </div>
        )}

        <motion.button
          className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-4 md:px-6 py-2 rounded-md text-sm font-medium"
          onClick={handleBuyClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Buy {token.pairData?.baseToken?.symbol || "Token"}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

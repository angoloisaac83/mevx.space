"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Plus, Trash2, Edit, Target, Zap, Clock, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import PageTemplate from "@/components/page-template"
import { useWalletStore } from "@/lib/wallet-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import WalletConnectModal from "@/components/wallet-connect-modal"
import { toast } from "@/hooks/use-toast"

interface Token {
  id: string
  symbol: string
  name: string
  price: string | number
  change24h: string | number
  volume24h: string | number
  liquidity: string | number
  marketCap: string | number
  buyTax?: string | number
  sellTax?: string | number
  holders?: string | number
  age?: string
  icon?: string
  address: string
}

interface AutoSnipeConfig {
  id: string
  name: string
  targetToken: string
  minLiquidity: number
  maxBuyTax: number
  maxSellTax: number
  buyAmount: number
  slippage: number
  isActive: boolean
  created: string
  triggers: number
  walletAddress: string
  userId: string
}

export default function AutoSnipePage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AutoSnipeConfig | null>(null)
  const [activeTab, setActiveTab] = useState<"tokens" | "configs">("tokens")

  const { isConnected, walletAddress } = useWalletStore()
  const { configs, autoSnipingTokens, addConfig, updateConfig, deleteConfig, toggleAutoSnipe, loadUserConfigs } =
    useAutoSnipeStore()

  const [newConfig, setNewConfig] = useState({
    name: "",
    targetToken: "",
    minLiquidity: 50,
    maxBuyTax: 5,
    maxSellTax: 5,
    buyAmount: 0.1,
    slippage: 15,
  })

  // Enhanced token data with real-looking information
  const enhancedTokenData = [
    {
      id: "1",
      symbol: "BONK",
      name: "Bonk",
      price: 0.000032,
      change24h: 15.7,
      volume24h: 2847392,
      liquidity: 1250,
      marketCap: 2100000,
      buyTax: 0,
      sellTax: 0,
      holders: 847392,
      age: "2h",
      icon: "🐕",
      address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    },
    {
      id: "2",
      symbol: "WIF",
      name: "Dogwifhat",
      price: 2.67,
      change24h: -3.2,
      volume24h: 1847392,
      liquidity: 890,
      marketCap: 1800000,
      buyTax: 1,
      sellTax: 1,
      holders: 234567,
      age: "4h",
      icon: "🐶",
      address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    },
    {
      id: "3",
      symbol: "PEPE",
      name: "Pepe Solana",
      price: 0.0000045,
      change24h: 8.9,
      volume24h: 987654,
      liquidity: 567,
      marketCap: 890000,
      buyTax: 2,
      sellTax: 2,
      holders: 123456,
      age: "1h",
      icon: "🐸",
      address: "BxNH2gx4qoPrKKp4T5DcwK5W3GJFzkKUNpjjF7VkSVkJ",
    },
    {
      id: "4",
      symbol: "MYRO",
      name: "Myro",
      price: 0.156,
      change24h: 12.4,
      volume24h: 654321,
      liquidity: 432,
      marketCap: 567000,
      buyTax: 0.5,
      sellTax: 0.5,
      holders: 98765,
      age: "3h",
      icon: "🚀",
      address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4",
    },
    {
      id: "5",
      symbol: "SAMO",
      name: "Samoyedcoin",
      price: 0.0234,
      change24h: -1.8,
      volume24h: 432109,
      liquidity: 321,
      marketCap: 345000,
      buyTax: 1.5,
      sellTax: 1.5,
      holders: 76543,
      age: "6h",
      icon: "🐕‍🦺",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    },
  ]

  // Fetch token data
  const fetchTokenData = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use enhanced token data instead of API
      setTokens(enhancedTokenData)
    } catch (error) {
      console.error("Failed to fetch token data:", error)
      // Fallback to enhanced data
      setTokens(enhancedTokenData)
    } finally {
      setLoading(false)
    }
  }

  // Load user configs when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadUserConfigs(walletAddress)
    }
  }, [isConnected, walletAddress, loadUserConfigs])

  // Fetch token data on component mount
  useEffect(() => {
    fetchTokenData()
    // Refresh data every 15 seconds
    const interval = setInterval(() => {
      fetchTokenData()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAutoSnipe = (tokenId: string) => {
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }

    if (!walletAddress) {
      toast.error("Wallet address not found")
      return
    }

    const isCurrentlyActive = autoSnipingTokens.includes(tokenId)
    toggleAutoSnipe(tokenId, walletAddress)

    const token = tokens.find((t) => t.id === tokenId)
    if (token) {
      if (isCurrentlyActive) {
        toast.success(`AutoSnipe disabled for ${token.symbol}`)
      } else {
        toast.warning("Please fund your account with at least 0.8 SOL to enable AutoSnipe")
        toast.success(`AutoSnipe enabled for ${token.symbol}`)
      }
    }
  }

  const toggleConfig = (id: string) => {
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }

    const config = configs.find((c) => c.id === id)
    if (!config) return

    const updatedConfig = { ...config, isActive: !config.isActive }
    updateConfig(updatedConfig)

    if (!config.isActive) {
      toast.warning("Please fund your account with at least 0.8 SOL to enable AutoSnipe")
    }

    toast.success(config.isActive ? "AutoSnipe configuration stopped" : "AutoSnipe configuration started")
  }

  const handleDeleteConfig = (id: string) => {
    deleteConfig(id)
    toast.success("Configuration deleted successfully")
  }

  const saveConfig = () => {
    if (!newConfig.name || !newConfig.targetToken) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    const config: AutoSnipeConfig = {
      ...newConfig,
      id: editingConfig?.id || Date.now().toString(),
      isActive: false,
      created: new Date().toISOString().split("T")[0],
      triggers: editingConfig?.triggers || 0,
      walletAddress,
      userId: walletAddress, // Using wallet address as user ID
    }

    if (editingConfig) {
      updateConfig(config)
      toast.success("Configuration updated successfully")
    } else {
      addConfig(config)
      toast.success("Configuration created successfully")
    }

    setShowConfigModal(false)
    setEditingConfig(null)
    resetNewConfig()
  }

  const resetNewConfig = () => {
    setNewConfig({
      name: "",
      targetToken: "",
      minLiquidity: 50,
      maxBuyTax: 5,
      maxSellTax: 5,
      buyAmount: 0.1,
      slippage: 15,
    })
  }

  const editConfig = (config: AutoSnipeConfig) => {
    setEditingConfig(config)
    setNewConfig({
      name: config.name,
      targetToken: config.targetToken,
      minLiquidity: config.minLiquidity,
      maxBuyTax: config.maxBuyTax,
      maxSellTax: config.maxSellTax,
      buyAmount: config.buyAmount,
      slippage: config.slippage,
    })
    setShowConfigModal(true)
  }

  // Helper functions to safely parse values
  const safeParseFloat = (value: string | number | undefined, defaultValue = 0): number => {
    if (value === undefined || value === null) return defaultValue
    const parsed = typeof value === "string" ? Number.parseFloat(value) : value
    return isNaN(parsed) ? defaultValue : parsed
  }

  const safeParseInt = (value: string | number | undefined, defaultValue = 0): number => {
    if (value === undefined || value === null) return defaultValue
    const parsed = typeof value === "string" ? Number.parseInt(value) : value
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Generate skeleton loading UI
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4 animate-pulse">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-5 w-20 bg-gray-700 rounded"></div>
                  <div className="h-3 w-32 bg-gray-700 rounded mt-1"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-12 bg-gray-700 rounded mb-1"></div>
                      <div className="h-4 w-16 bg-gray-700 rounded"></div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="h-8 w-32 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      ))
  }

  return (
    <PageTemplate title="AutoSnipe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AutoSnipe Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Monitor and automatically snipe promising tokens</p>
          </div>
          <motion.button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            New Config
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Snipes</p>
                <p className="text-xl font-bold text-white">{autoSnipingTokens.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Tokens</p>
                <p className="text-xl font-bold text-white">{loading ? "..." : tokens.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Configs</p>
                <p className="text-xl font-bold text-white">{configs.filter((c) => c.isActive).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-xl font-bold text-white">87%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#1a1a2e] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab("tokens")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "tokens"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Snipable Tokens
          </button>
          <button
            onClick={() => setActiveTab("configs")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "configs"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Configurations ({configs.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "tokens" ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-4">
              {loading ? "Loading tokens..." : `${tokens.length} tokens available for AutoSnipe`}
            </div>

            {loading ? (
              renderSkeletons()
            ) : tokens.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Tokens Available</h3>
                <p className="text-gray-500">No tokens are currently available for AutoSnipe</p>
              </div>
            ) : (
              tokens.map((token) => {
                const price = safeParseFloat(token.price)
                const change24h = safeParseFloat(token.change24h)
                const liquidity = safeParseFloat(token.liquidity)
                const buyTax = safeParseFloat(token.buyTax)
                const sellTax = safeParseFloat(token.sellTax)
                const holders = safeParseInt(token.holders)

                return (
                  <motion.div
                    key={token.id}
                    className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {token.icon || token.symbol?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{token.symbol}</h3>
                            <p className="text-gray-400 text-sm">{token.name}</p>
                          </div>
                          <span className="text-xs text-gray-500">Age: {token.age || "New"}</span>
                          {autoSnipingTokens.includes(token.id) && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                              Auto-Sniping
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Price</p>
                            <p className="text-white font-medium">${price.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">24h Change</p>
                            <p
                              className={`font-medium flex items-center gap-1 ${
                                change24h >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {change24h.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Liquidity</p>
                            <p className="text-white font-medium">{liquidity.toFixed(0)} SOL</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Buy Tax</p>
                            <p className="text-white font-medium">{buyTax.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Sell Tax</p>
                            <p className="text-white font-medium">{sellTax.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Holders</p>
                            <p className="text-white font-medium">{holders.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleAutoSnipe(token.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            autoSnipingTokens.includes(token.id)
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {autoSnipingTokens.includes(token.id) ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {autoSnipingTokens.includes(token.id) ? "Stop AutoSnipe" : "Start AutoSnipe"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {configs.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No AutoSnipe Configurations</h3>
                <p className="text-gray-500 mb-4">Create your first configuration to start auto-sniping tokens</p>
                <motion.button
                  onClick={() => setShowConfigModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Configuration
                </motion.button>
              </div>
            ) : (
              configs.map((config) => (
                <motion.div
                  key={config.id}
                  className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            config.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {config.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Target</p>
                          <p className="text-white font-medium">{config.targetToken}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Min Liquidity</p>
                          <p className="text-white font-medium">{config.minLiquidity} SOL</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Buy Amount</p>
                          <p className="text-white font-medium">{config.buyAmount} SOL</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Triggers</p>
                          <p className="text-white font-medium">{config.triggers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => toggleConfig(config.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          config.isActive
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {config.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {config.isActive ? "Stop" : "Start"}
                      </motion.button>

                      <motion.button
                        onClick={() => editConfig(config)}
                        className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Configuration Modal */}
        {showConfigModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0e0e16] border border-gray-800 rounded-lg max-w-2xl w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6">
                {editingConfig ? "Edit Configuration" : "Create New Configuration"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Configuration Name</label>
                    <input
                      type="text"
                      value={newConfig.name}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Meme Hunter"
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Token Criteria</label>
                    <input
                      type="text"
                      value={newConfig.targetToken}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, targetToken: e.target.value }))}
                      placeholder="e.g., Contains 'PEPE' or Tax < 5%"
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Min Liquidity (SOL)</label>
                    <input
                      type="number"
                      value={newConfig.minLiquidity}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, minLiquidity: Number(e.target.value) }))}
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Buy Tax (%)</label>
                    <input
                      type="number"
                      value={newConfig.maxBuyTax}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, maxBuyTax: Number(e.target.value) }))}
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Sell Tax (%)</label>
                    <input
                      type="number"
                      value={newConfig.maxSellTax}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, maxSellTax: Number(e.target.value) }))}
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Buy Amount (SOL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newConfig.buyAmount}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, buyAmount: Number(e.target.value) }))}
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Slippage (%)</label>
                    <input
                      type="number"
                      value={newConfig.slippage}
                      onChange={(e) => setNewConfig((prev) => ({ ...prev, slippage: Number(e.target.value) }))}
                      className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowConfigModal(false)
                    setEditingConfig(null)
                    resetNewConfig()
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={saveConfig}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-md font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingConfig ? "Update" : "Create"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Wallet Connect Modal */}
        {showWalletModal && (
          <WalletConnectModal onClose={() => setShowWalletModal(false)} onSuccess={() => setShowWalletModal(false)} />
        )}
      </div>
    </PageTemplate>
  )
}

"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Search,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
  AlertTriangle,
  Zap,
  X,
  Filter,
  ArrowUpDown,
  Copy,
} from "lucide-react"
import Link from "next/link"
import WalletConnectModal from "@/components/wallet-connect-modal"
import TokenDetailModal from "@/components/token-detail-modal"
import Footer from "@/components/footer"
import MainMenu from "@/components/main-menu"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import { toast } from "@/hooks/use-toast"
import { AnimatePresence } from "framer-motion"

// Filter types
const FILTER_TYPES = {
  TRENDING: "TRENDING",
  NEW_PAIRS: "NEW_PAIRS",
  MEME_ZONE: "MEME_ZONE",
  DEGEN_ZONE: "DEGEN_ZONE",
}

// Time periods
const TIME_PERIODS = {
  M5: "5M",
  H1: "1H",
  H6: "6H",
  H24: "24H",
}

// Navigation items for desktop
const NAV_ITEMS = [
  { label: "TRENDING", path: "/" },
  { label: "NEW PAIRS", path: "/new-pairs" },
  { label: "MEME ZONE", path: "/meme-zone" },
  { label: "DEGEN ZONE", path: "/degen-zone" },
  { label: "FAVORITES", path: "/favorites" },
  { label: "SNIPE", path: "/snipe/raydium", hasDropdown: true },
  { label: "AUTOSNIPE", path: "/autosnipe" },
  { label: "PORTFOLIO", path: "/portfolio" },
  { label: "TOOLS", path: "/multi-chart", hasDropdown: true },
]

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showInfoBanner, setShowInfoBanner] = useState(true)
  const router = useRouter()
  const { isConnected } = useWalletStore()
  const [tokenData, setTokenData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.TRENDING)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [activePeriod, setActivePeriod] = useState(TIME_PERIODS.H24)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [minLiquidity, setMinLiquidity] = useState(0)
  const [maxLiquidity, setMaxLiquidity] = useState(1000000)
  const [selectedExchange, setSelectedExchange] = useState("All")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Ref for search results dropdown
  const searchRef = useRef(null)
  const filterRef = useRef(null)

  useEffect(() => {
    // Close search results when clicking outside
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // First try to fetch from the real API
        let response = await fetch("/api/tokens")

        // If that fails, use the mock API
        if (!response.ok) {
          console.log("Using mock token data instead")
          response = await fetch("/api/mock-tokens")
        }

        if (response.ok) {
          const data = await response.json()
          setTokenData(data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch token data:", error)

        // Try mock data as fallback
        try {
          const mockResponse = await fetch("/api/mock-tokens")
          if (mockResponse.ok) {
            const mockData = await mockResponse.json()
            setTokenData(mockData.data || [])
          }
        } catch (mockError) {
          console.error("Failed to fetch mock token data:", mockError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [])

  const handleNavClick = (path) => {
    if (!isConnected) {
      toast.warning("Connect your wallet first", {
        description: "You need to connect your wallet to access this feature.",
      })
      setShowWalletModal(true)
    } else {
      router.push(path)
    }
  }

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return tokenData
      .filter(
        (token) =>
          token.pairData?.baseToken?.name?.toLowerCase().includes(query) ||
          token.pairData?.baseToken?.symbol?.toLowerCase().includes(query) ||
          token.profile?.tokenAddress?.toLowerCase().includes(query),
      )
      .slice(0, 5) // Limit to 5 results for dropdown
  }, [tokenData, searchQuery])

  // Get the appropriate volume and txns data based on the selected time period
  const getTimeData = (token, dataType) => {
    if (!token || !token.pairData) return 0

    const periodKey = activePeriod.toLowerCase()

    if (dataType === "volume") {
      return token.pairData.volume?.[periodKey] || 0
    } else if (dataType === "txns") {
      return token.pairData.txns?.[periodKey] || 0
    } else if (dataType === "priceChange") {
      return token.pairData.priceChange?.[periodKey] || 0
    }

    return 0
  }

  // Filter and search logic for main table
  const filteredTokens = useMemo(() => {
    // First apply search filter
    let filtered = tokenData
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = tokenData.filter(
        (token) =>
          token.pairData?.baseToken?.name?.toLowerCase().includes(query) ||
          token.pairData?.baseToken?.symbol?.toLowerCase().includes(query) ||
          token.profile?.tokenAddress?.toLowerCase().includes(query),
      )
    }

    // Apply liquidity filter
    filtered = filtered.filter((token) => {
      const liquidity = token.pairData?.liquidity?.usd || 0
      return liquidity >= minLiquidity && liquidity <= maxLiquidity
    })

    // Apply exchange filter if not "All"
    if (selectedExchange !== "All") {
      filtered = filtered.filter((token) => token.pairData?.dexId?.toLowerCase() === selectedExchange.toLowerCase())
    }

    // Then apply tab filter
    switch (activeFilter) {
      case FILTER_TYPES.TRENDING:
        // Sort by volume for the selected time period
        return [...filtered].sort((a, b) => getTimeData(b, "volume") - getTimeData(a, "volume"))
      case FILTER_TYPES.NEW_PAIRS:
        // Sort by creation date (newest first)
        return [...filtered].sort((a, b) => (b.pairData?.pairCreatedAt || 0) - (a.pairData?.pairCreatedAt || 0))
      case FILTER_TYPES.MEME_ZONE:
        // Filter tokens that might be meme coins (based on name or description)
        return filtered.filter((token) => {
          const name = token.pairData?.baseToken?.name?.toLowerCase() || ""
          const symbol = token.pairData?.baseToken?.symbol?.toLowerCase() || ""
          const description = token.profile?.description?.toLowerCase() || ""
          const memeKeywords = ["meme", "doge", "shib", "pepe", "coin", "moon", "elon", "inu", "cat", "dog", "frog"]
          return memeKeywords.some(
            (keyword) => name.includes(keyword) || symbol.includes(keyword) || description.includes(keyword),
          )
        })
      case FILTER_TYPES.DEGEN_ZONE:
        // Sort by price change for the selected time period
        return [...filtered].sort((a, b) => getTimeData(b, "priceChange") - getTimeData(a, "priceChange"))
      default:
        return filtered
    }
  }, [tokenData, activeFilter, searchQuery, activePeriod, minLiquidity, maxLiquidity, selectedExchange])

  // Pagination logic
  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage)
  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTokens.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTokens, currentPage, itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBuyClick = (e, token) => {
    e.stopPropagation()
    if (!isConnected) {
      toast.info("Please connect your wallet to proceed with purchase")
      setShowWalletModal(true)
    } else {
      // If connected, show insufficient balance message
      toast.error(
        <div>
          <p>Insufficient SOL balance in your wallet!</p>
          <p className="text-sm">You need at least 3 SOL (incl. fee) to make this purchase</p>
        </div>,
      )
    }
  }

  const handleWalletConnectSuccess = () => {
    toast.success(
      <div>
        <p>Wallet connected successfully</p>
        <p className="text-sm">You need at least 3 SOL (incl. fee) to make purchases</p>
      </div>,
    )
    setShowWalletModal(false)
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchResults(true)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim()) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
    setCurrentPage(1) // Reset to first page on search
  }

  const handleSearchResultClick = (token) => {
    setSelectedToken(token)
    setShowSearchResults(false)
  }

  const handleTimePeriodChange = (period) => {
    setActivePeriod(period)
    setCurrentPage(1) // Reset to first page on period change
  }

  const handleFilterClick = () => {
    setShowFilterModal(!showFilterModal)
  }

  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    setShowFilterModal(false)
  }

  const resetFilters = () => {
    setMinLiquidity(0)
    setMaxLiquidity(1000000)
    setSelectedExchange("All")
    setCurrentPage(1)
    setShowFilterModal(false)
  }

  // Function to format time since creation
  const formatTimeSince = (timestamp) => {
    if (!timestamp) return "N/A"

    const now = new Date()
    const createdAt = new Date(timestamp)
    const diffInSeconds = Math.floor((now - createdAt) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 2592000)}mo`
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Link href="/" className="flex items-center">
            <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-8 w-auto" />
          </Link>

          {/* Search bar directly beside logo */}
          <div className="relative w-48 md:w-56" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search or Snipe"
              className="bg-[#1a1a1e] rounded-full pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />

            {/* Search results dropdown */}
            <AnimatePresence>
              {showSearchResults && (
                <div className="fixed z-[100] mt-1 w-screen max-w-md left-0 top-[3.5rem] bg-[#1a1a1e] border border-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-800 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Search Results</span>
                    <button onClick={() => setShowSearchResults(false)} className="text-gray-400 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((token, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-[#252530] cursor-pointer border-b border-gray-800 last:border-0"
                          onClick={() => handleSearchResultClick(token)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                              {token.profile?.icon && (
                                <img
                                  src={token.profile.icon || "/placeholder.svg"}
                                  alt={token.pairData?.baseToken?.symbol || "Token"}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm truncate">
                                {token.pairData?.baseToken?.name || "Unknown Token"}
                              </div>
                              <div className="text-xs text-gray-400">{token.pairData?.baseToken?.symbol || "???"}</div>
                            </div>
                            <div className="ml-auto">
                              <span
                                className={`text-xs ${getTimeData(token, "priceChange") > 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {getTimeData(token, "priceChange") > 0 ? "+" : ""}
                                {getTimeData(token, "priceChange")?.toFixed(2) || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // No results error message - same as in the table
                      <div className="py-6 text-center text-red-400 animate-pulse">
                        Error node lost, make sure your wallet is connected and substantially funded with at least 3 SOL
                        and try again
                        <br />
                        <span className="text-xs">Note: minimum 3 SOL required for trading operations</span>
                      </div>
                    )}
                  </div>
                  {searchResults.length > 4 && (
                    <div className="p-2 text-center border-t border-gray-800">
                      <button
                        className="text-xs text-[#2F80ED] hover:underline"
                        onClick={() => {
                          setShowSearchResults(false)
                          document.getElementById("market-overview")?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        View all results
                      </button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 ml-4">
            {NAV_ITEMS.map((item, index) => (
              <NavItem
                key={index}
                label={item.label}
                hasDropdown={item.hasDropdown}
                onClick={() => handleNavClick(item.path)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1 text-sm">
            <span className="text-gray-300">SOL</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="bg-[#1a1a1e] border border-gray-700 hover:border-[#2F80ED] px-3 py-1.5 rounded-md text-xs md:text-sm flex items-center gap-2 transition-colors"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="hidden md:inline">Wallet Connected</span>
                <span className="md:hidden">Connected</span>
              </Link>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white px-3 py-1.5 text-xs md:text-sm md:px-4 rounded-md font-medium"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <button
              className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white px-3 py-1.5 text-xs md:text-sm md:px-4 rounded-md font-medium"
              onClick={() => setShowWalletModal(true)}
            >
              Connect
            </button>
          )}

          <button className="text-gray-300 md:hidden" onClick={() => setShowMainMenu(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Menu - Only for Mobile */}
      <MainMenu isOpen={showMainMenu} onClose={() => setShowMainMenu(false)} />

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-4">
        {/* Info Banner */}
        {showInfoBanner && (
          <div className="bg-[#1a1a1e] border border-[#2F80ED]/30 rounded-lg p-3 mb-4 flex items-start gap-3">
            <div className="text-[#2F80ED] mt-0.5">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">Welcome to MEVX - The Ultimate Trading Platform</h3>
              <p className="text-xs text-gray-300 mb-2">
                MEVX provides advanced tools for trading on Solana and other blockchains. Connect your wallet to access
                all features.
              </p>
              <div className="flex gap-2">
                <button
                  className="text-xs bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] px-3 py-1 rounded"
                  onClick={() => setShowWalletModal(true)}
                >
                  Connect Wallet
                </button>
                <button
                  className="text-xs bg-transparent hover:bg-gray-800 px-3 py-1 rounded border border-gray-700"
                  onClick={() => setShowInfoBanner(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty space where Platform Introduction was */}
        <div className="mb-6"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          <PoolSection
            title="Trending Pools"
            icon="🔥"
            data={tokenData.sort((a, b) => getTimeData(b, "volume") - getTimeData(a, "volume")).slice(0, 15)}
            loading={loading}
            onTokenClick={setSelectedToken}
            timePeriod={activePeriod}
          />

          <PoolSection
            title="New Pools"
            icon="🚀"
            data={tokenData
              .sort((a, b) => (b.pairData?.pairCreatedAt || 0) - (a.pairData?.pairCreatedAt || 0))
              .slice(0, 15)}
            loading={loading}
            onTokenClick={setSelectedToken}
            timePeriod={activePeriod}
          />

          <PoolSection
            title="Top Gainers"
            icon="🏆"
            data={[...tokenData]
              .sort((a, b) => getTimeData(b, "priceChange") - getTimeData(a, "priceChange"))
              .slice(0, 15)}
            loading={loading}
            onTokenClick={setSelectedToken}
            timePeriod={activePeriod}
          />
        </div>

        {/* Market Overview Section - just the anchor */}
        <div className="mt-6 mb-4" id="market-overview"></div>

        {/* Tabs - Matching the screenshot */}
        <div className="flex overflow-x-auto pb-2 gap-2 mb-4">
          <TabButton
            label="TRENDING"
            icon="🔥"
            active={activeFilter === FILTER_TYPES.TRENDING}
            onClick={() => {
              setActiveFilter(FILTER_TYPES.TRENDING)
              setCurrentPage(1)
            }}
          />
          <TabButton
            label="NEW PAIRS"
            icon="🚀"
            active={activeFilter === FILTER_TYPES.NEW_PAIRS}
            onClick={() => {
              setActiveFilter(FILTER_TYPES.NEW_PAIRS)
              setCurrentPage(1)
            }}
          />
          <TabButton
            label="MEME ZONE"
            icon="😜"
            active={activeFilter === FILTER_TYPES.MEME_ZONE}
            onClick={() => {
              setActiveFilter(FILTER_TYPES.MEME_ZONE)
              setCurrentPage(1)
            }}
          />
          <TabButton
            label="DEGEN ZONE"
            icon="😈"
            active={activeFilter === FILTER_TYPES.DEGEN_ZONE}
            onClick={() => {
              setActiveFilter(FILTER_TYPES.DEGEN_ZONE)
              setCurrentPage(1)
            }}
          />
        </div>

        {/* Time period filters */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 bg-[#1a1a1e] px-3 py-1.5 rounded-md text-xs">
              <span>Exchange</span>
              <ArrowUpDown className="h-3 w-3 text-[#2F80ED]" />
            </button>
            <button
              className={`px-2 py-1 rounded-md text-xs ${activePeriod === TIME_PERIODS.M5 ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white" : "bg-[#1a1a1e] text-gray-300"}`}
              onClick={() => handleTimePeriodChange(TIME_PERIODS.M5)}
            >
              5M
            </button>
            <button
              className={`px-2 py-1 rounded-md text-xs ${activePeriod === TIME_PERIODS.H1 ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white" : "bg-[#1a1a1e] text-gray-300"}`}
              onClick={() => handleTimePeriodChange(TIME_PERIODS.H1)}
            >
              1H
            </button>
            <button
              className={`px-2 py-1 rounded-md text-xs ${activePeriod === TIME_PERIODS.H6 ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white" : "bg-[#1a1a1e] text-gray-300"}`}
              onClick={() => handleTimePeriodChange(TIME_PERIODS.H6)}
            >
              6H
            </button>
            <button
              className={`px-2 py-1 rounded-md text-xs ${activePeriod === TIME_PERIODS.H24 ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white" : "bg-[#1a1a1e] text-gray-300"}`}
              onClick={() => handleTimePeriodChange(TIME_PERIODS.H24)}
            >
              24H
            </button>
          </div>
          <div className="relative" ref={filterRef}>
            <button
              className="flex items-center gap-1 bg-[#1a1a1e] px-3 py-1.5 rounded-md text-xs"
              onClick={handleFilterClick}
            >
              <span>Filter</span>
              <Filter className="h-3 w-3 text-[#2F80ED]" />
            </button>

            {/* Filter Modal */}
            {showFilterModal && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1e] border border-gray-800 rounded-lg shadow-lg z-50 w-64">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="font-medium text-sm">Filter Options</h3>
                </div>
                <div className="p-3 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Exchange</label>
                    <select
                      className="w-full bg-[#252530] text-white text-xs rounded p-2 border border-gray-700"
                      value={selectedExchange}
                      onChange={(e) => setSelectedExchange(e.target.value)}
                    >
                      <option value="All">All Exchanges</option>
                      <option value="pumpswap">PumpSwap</option>
                      <option value="raydium">Raydium</option>
                      <option value="orca">Orca</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Liquidity Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-full bg-[#252530] text-white text-xs rounded p-2 border border-gray-700"
                        placeholder="Min"
                        value={minLiquidity}
                        onChange={(e) => setMinLiquidity(Number(e.target.value))}
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        className="w-full bg-[#252530] text-white text-xs rounded p-2 border border-gray-700"
                        placeholder="Max"
                        value={maxLiquidity}
                        onChange={(e) => setMaxLiquidity(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      className="bg-transparent hover:bg-gray-800 text-xs px-3 py-1.5 rounded border border-gray-700"
                      onClick={resetFilters}
                    >
                      Reset
                    </button>
                    <button
                      className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white text-xs px-3 py-1.5 rounded"
                      onClick={applyFilters}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Header - Matching the screenshot */}
        <div className="grid grid-cols-7 md:grid-cols-9 gap-1 text-sm text-gray-400 px-2 py-2 border-b border-gray-800 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1 col-span-2">
            PAIR INFO
            <button className="p-1 rounded-full bg-[#252530]">
              <Search className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-center">CREATED</div>
          <div className="flex items-center justify-center">LIQUIDITY</div>
          <div className="hidden md:flex items-center justify-center">MCAP</div>
          <div className="hidden md:flex items-center justify-center">TXNS</div>
          <div className="flex items-center justify-center">VOLUME</div>
          <div className="flex items-center justify-center">{activePeriod}</div>
          <div className="flex items-center justify-center">QUICK BUY</div>
        </div>

        {/* Table Rows - Matching the screenshot */}
        <div>
          {loading ? (
            // Loading state
            [...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 md:grid-cols-9 gap-1 border-b border-gray-800 p-2 animate-pulse">
                <div className="col-span-2 h-10 bg-gray-800 rounded"></div>
                <div className="h-10 bg-gray-800 rounded"></div>
                <div className="h-10 bg-gray-800 rounded"></div>
                <div className="hidden md:block h-10 bg-gray-800 rounded"></div>
                <div className="hidden md:block h-10 bg-gray-800 rounded"></div>
                <div className="h-10 bg-gray-800 rounded"></div>
                <div className="h-10 bg-gray-800 rounded"></div>
                <div className="h-10 bg-gray-800 rounded"></div>
              </div>
            ))
          ) : paginatedTokens.length > 0 ? (
            // Data rows
            paginatedTokens.map((token, i) => (
              <div
                key={i}
                className="grid grid-cols-7 md:grid-cols-9 gap-1 border-b border-gray-800 p-2 hover:bg-[#1a1a1e] cursor-pointer text-sm"
                onClick={() => setSelectedToken(token)}
              >
                {/* Pair Info */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-full overflow-hidden flex-shrink-0">
                    {token.profile?.icon && (
                      <img
                        src={token.profile.icon || "/placeholder.svg"}
                        alt={token.pairData?.baseToken?.symbol || "Token"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      <span className="text-white">{token.pairData?.baseToken?.symbol || "???"}</span>
                      <span className="text-gray-500">/SOL</span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 truncate max-w-[80px]">
                      {token.profile?.tokenAddress?.substring(0, 6)}...
                      <button className="text-[#2F80ED]">
                        <Copy className="h-2 w-2" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div className="flex items-center justify-center">{formatTimeSince(token.pairData?.pairCreatedAt)}</div>

                {/* Liquidity */}
                <div className="flex flex-col items-center justify-center text-[10px]">
                  <span className="text-[#2F80ED]">
                    ≈${(token.pairData?.liquidity?.usd || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-gray-400">${token.pairData?.price?.toFixed(4) || "0.00"}</span>
                </div>

                {/* MCAP - Hidden on mobile */}
                <div className="hidden md:flex flex-col items-center justify-center text-[10px]">
                  <span className="text-white">
                    ${(token.pairData?.marketCap || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                </div>

                {/* TXNS - Hidden on mobile */}
                <div className="hidden md:flex flex-col items-center justify-center text-[10px]">
                  <span className="text-green-500">{formatTxns(getTimeData(token, "txns"))}</span>
                  <span className="text-gray-400">txns</span>
                </div>

                {/* Volume */}
                <div className="flex flex-col items-center justify-center text-[10px]">
                  <span className="text-white">
                    ${(getTimeData(token, "volume") || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                </div>

                {/* Price Change */}
                <div className="flex items-center justify-center">
                  <span
                    className={`${
                      getTimeData(token, "priceChange") > 0 ? "text-green-500" : "text-red-500"
                    } font-medium`}
                  >
                    {getTimeData(token, "priceChange") > 0 ? "+" : ""}
                    {getTimeData(token, "priceChange")?.toFixed(2) || 0}%
                  </span>
                </div>

                {/* Quick Buy */}
                <div className="flex items-center justify-center">
                  <button
                    className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] p-1 rounded flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBuyClick(e, token)
                    }}
                  >
                    <Zap className="h-3 w-3" />
                    <span className="hidden md:inline">Buy</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            // No data state - Custom error message for no search results
            <div className="py-8 text-center text-sm text-red-400 animate-pulse col-span-7 md:col-span-9">
              Error node lost, make sure your wallet is connected and substantially funded with at least 3 SOL and try
              again
              <br />
              <span className="text-xs">Note: minimum 3 SOL required for trading operations</span>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTokens.length > 0 && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 md:p-2 rounded-md bg-[#1a1a1e] text-gray-400 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1

                  // Show fewer pages on mobile
                  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
                  if (isMobile) {
                    if (pageNum === 1 || pageNum === totalPages || pageNum === currentPage) {
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white"
                              : "bg-[#1a1a1e] text-gray-400 hover:bg-[#252530]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                    if (
                      (pageNum === currentPage - 1 && currentPage > 2) ||
                      (pageNum === currentPage + 1 && currentPage < totalPages - 1)
                    ) {
                      return (
                        <span key={i} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  // Desktop view - show more pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white"
                            : "bg-[#1a1a1e] text-gray-400 hover:bg-[#252530]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }

                  // Show ellipsis for skipped pages
                  if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={i} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-400">
                        ...
                      </span>
                    )
                  }

                  return null
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 md:p-2 rounded-md bg-[#1a1a1e] text-gray-400 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Trading Guide Section */}
        <div className="mt-8 bg-[#1a1a1e] border border-gray-800 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
            How to Trade on MEVX
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#252530] p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#2F80ED] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
                  Connect Your Wallet
                </h3>
              </div>
              <p className="text-xs text-gray-300">
                Click the "Connect" button in the top right corner to connect your cryptocurrency wallet. MEVX supports
                Phantom, MetaMask, and other popular wallets.
              </p>
            </div>

            <div className="bg-[#252530] p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#2F80ED] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
                  Find Tokens
                </h3>
              </div>
              <p className="text-xs text-gray-300">
                Browse trending tokens, search for specific tokens, or use our filters to discover new opportunities.
                Click on any token to view detailed information.
              </p>
            </div>

            <div className="bg-[#252530] p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#2F80ED] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
                  Trade & Snipe
                </h3>
              </div>
              <p className="text-xs text-gray-300">
                Use the "BUY" button to quickly purchase tokens, or set up advanced sniping strategies to automatically
                trade when specific conditions are met.
              </p>
            </div>
          </div>

          <div className="bg-[#121212] border border-gray-800 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Risk Warning</h4>
              <p className="text-xs text-gray-300">
                Cryptocurrency trading involves significant risk. Always do your own research (DYOR) before investing.
                MEVX provides tools and information, but does not offer financial advice.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            <FaqItem
              question="What is MEVX?"
              answer="MEVX is a comprehensive cryptocurrency trading platform that provides real-time market data, advanced trading tools, and token sniping capabilities across multiple blockchains."
            />

            <FaqItem
              question="How do I connect my wallet?"
              answer="Click the 'Connect' button in the top right corner of the page. You'll be prompted to select your wallet provider (Phantom, MetaMask, etc.) and authorize the connection."
            />

            <FaqItem
              question="What is token sniping?"
              answer="Token sniping refers to the practice of buying new tokens as soon as they become available for trading, often within seconds of liquidity being added. MEVX provides tools to automate this process."
            />

            <FaqItem
              question="Is MEVX safe to use?"
              answer="MEVX employs industry-standard security practices to protect user data and funds. However, always exercise caution when trading cryptocurrencies and never invest more than you can afford to lose."
            />

            <FaqItem
              question="Which blockchains does MEVX support?"
              answer="MEVX currently supports Solana, Ethereum, and Binance Smart Chain, with plans to add more blockchains in the future."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <WalletConnectModal onClose={() => setShowWalletModal(false)} onSuccess={handleWalletConnectSuccess} />
      )}

      {/* Token Detail Modal */}
      {selectedToken && <TokenDetailModal token={selectedToken} onClose={() => setSelectedToken(null)} />}
    </div>
  )
}

function NavItem({ label, hasDropdown = false, onClick }) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-300 hover:text-white cursor-pointer" onClick={onClick}>
      {label}
      {hasDropdown && <ChevronDown className="h-3 w-3" />}
    </div>
  )
}

function MobileNavItem({ label, onClick }) {
  return (
    <div
      className="py-2 px-1 text-xs text-gray-300 hover:text-white border-b border-gray-800 last:border-0 cursor-pointer"
      onClick={onClick}
    >
      {label}
    </div>
  )
}

function TabButton({ label, icon, active = false, onClick }) {
  return (
    <button
      className={`flex items-center gap-1 md:gap-2 px-3 py-2 rounded-md text-xs ${
        active
          ? "bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white"
          : "bg-[#1a1a1e] text-gray-300 hover:bg-[#252530]"
      }`}
      onClick={onClick}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#1a1a1e] border border-gray-800 rounded-lg p-3">
      <div className="mb-2">{icon}</div>
      <h3 className="font-medium text-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
        {title}
      </h3>
      <p className="text-xs text-gray-300">{description}</p>
    </div>
  )
}

function PoolSection({
  title,
  icon,
  data = [],
  loading,
  onTokenClick,
  emptyMessage = "No data available",
  timePeriod,
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 5
  const totalPages = Math.ceil((data.length || 5) / itemsPerPage)

  // For swipe functionality
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
    // Add visual feedback during swipe
    if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 20) {
      e.currentTarget.style.transform = `translateX(${(e.targetTouches[0].clientX - touchStart) / 10}px)`
      e.currentTarget.style.transition = "transform 0.1s"
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    // Reset transform
    const element = document.getElementById(`pool-section-${title.replace(/\s+/g, "-").toLowerCase()}`)
    if (element) {
      element.style.transform = ""
      element.style.transition = "transform 0.3s"
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextPage()
    }
    if (isRightSwipe) {
      prevPage()
    }
  }

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  // Get current items
  const currentItems = data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  // Format price to K or M
  const formatPrice = (price) => {
    if (!price) return "$0"
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(3)}M`
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(3)}K`
    }
    return `$${price.toFixed(2)}`
  }

  // Get the appropriate data based on the selected time period
  const getTimeData = (token, dataType) => {
    if (!token || !token.pairData) return 0

    const periodKey = timePeriod.toLowerCase()

    if (dataType === "volume") {
      return token.pairData.volume?.[periodKey] || 0
    } else if (dataType === "txns") {
      return token.pairData.txns?.[periodKey] || 0
    } else if (dataType === "priceChange") {
      return token.pairData.priceChange?.[periodKey] || 0
    }

    return 0
  }

  // In the formatPrice function or anywhere else transaction data might be rendered
  const formatTxns = (txns) => {
    if (!txns) return "0"
    if (typeof txns === "object") {
      return (txns.buys || 0) + (txns.sells || 0)
    }
    return txns.toString()
  }

  return (
    <div
      id={`pool-section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className="bg-[#ffffff0d] rounded-lg overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-base font-medium text-[#9945FF]">{title}</h2>
        </div>
        <div className="rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-gray-400 text-xs">?</span>
        </div>
      </div>

      <div className="p-0 bg-transparent" key={currentPage}>
        {loading
          ? // Loading state
            [1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center gap-2 px-3 py-[2px]">
                <span className="text-sm text-gray-400 w-5 text-center">{num}</span>
                <div className="h-4 rounded w-full animate-pulse"></div>
              </div>
            ))
          : currentItems.length > 0
            ? // Data rows
              currentItems.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-[2px] cursor-pointer hover:bg-[#ffffff0d]"
                  onClick={() => onTokenClick(token)}
                >
                  <div className="flex items-center gap-[4px]">
                    <span className="text-sm text-white w-5 text-center">{currentPage * itemsPerPage + index + 1}</span>
                    <div className="w-7 h-7 bg-gray-700 rounded-full flex-shrink-0 overflow-hidden">
                      {token.profile?.icon && (
                        <img
                          src={token.profile.icon || "/placeholder.svg"}
                          alt={token.pairData?.baseToken?.symbol || "Token"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-white text-sm font-medium">
                        {token.pairData?.baseToken?.symbol || token.profile?.tokenAddress?.substring(0, 6) || "???"}
                      </span>
                      <span className="text-gray-500 text-xs">/SOL</span>
                      <button className="ml-1 bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center">
                        <Search className="h-2 w-2 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#2F80ED] text-sm font-medium">
                      {formatPrice(token.pairData?.liquidity?.usd || 0)}
                    </span>
                    <span
                      className={`${
                        getTimeData(token, "priceChange") > 0 ? "text-green-500" : "text-red-500"
                      } text-sm font-medium`}
                    >
                      {getTimeData(token, "priceChange") > 0 ? "+" : ""}
                      {getTimeData(token, "priceChange")?.toFixed(2) || 0}%
                    </span>
                  </div>
                </div>
              ))
            : // No data state
              [1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400 w-5 text-center">{num}</span>
                  <div className="text-gray-500 text-xs">{emptyMessage}</div>
                </div>
              ))}
      </div>

      {/* Navigation dots and arrows */}
      <div className="flex justify-center items-center py-3 gap-3">
        <button onClick={prevPage} className="text-gray-400 hover:text-white" aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full ${currentPage === i ? "bg-[#2F80ED]" : "bg-gray-700"} transition-colors`}
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        <button onClick={nextPage} className="text-gray-400 hover:text-white" aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-[#1a1a1e] border border-gray-800 rounded-lg overflow-hidden">
      <button className="w-full text-left p-3 flex items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-medium text-sm bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
          {question}
        </h3>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && <div className="p-3 border-t border-gray-800 text-xs text-gray-300">{answer}</div>}
      </AnimatePresence>
    </div>
  )
}

// Function to format time since creation
const formatTimeSince = (timestamp) => {
  if (!timestamp) return "-"

  const now = new Date()
  const createdAt = new Date(timestamp)
  const diffInSeconds = Math.floor((now - createdAt) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 2592000)}mo`
}

// Function to format transaction counts
const formatTxns = (txns) => {
  if (!txns) return "0"
  if (typeof txns === "object") {
    return (txns.buys || 0) + (txns.sells || 0)
  }
  return txns.toString()
}

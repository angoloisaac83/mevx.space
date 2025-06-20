"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import { Search, ChevronDown, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import WalletConnectModal from "@/components/wallet-connect-modal"
import { toast } from "@/hooks/use-toast"

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

export default function Navbar() {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { isConnected } = useWalletStore()

  const handleNavClick = (path: string) => {
    if (
      !isConnected &&
      path !== "/" &&
      !path.includes("privacy") &&
      !path.includes("terms") &&
      !path.includes("docs")
    ) {
      toast({
        title: "Wallet Connection Required",
        description: "You need to connect your wallet to access this feature.",
        variant: "destructive",
      })
      setShowWalletModal(true)
    } else {
      router.push(path)
      setShowMobileMenu(false)
    }
  }

  const handleWalletConnectSuccess = () => {
    toast({
      title: "Wallet Connected Successfully!",
      description: "You need at least 1.5 SOL (incl. fee) to make purchases",
    })
    setShowWalletModal(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-3 lg:px-6 max-w-full">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Link href="/" className="flex items-center flex-shrink-0">
              <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-6 md:h-8 w-auto" />
            </Link>

            {/* Search bar */}
            <div className="relative w-32 sm:w-48 md:w-56 lg:w-64 flex-shrink min-w-0">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 md:h-4 w-3 md:w-4" />
              <input
                type="text"
                placeholder="Search"
                className="bg-[#1a1a1e] rounded-full pl-7 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#2F80ED] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-4 ml-4">
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

          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm">
              <span className="text-gray-300">SOL</span>
              <ChevronDown className="h-3 md:h-4 w-3 md:w-4 text-gray-400" />
            </div>

            {isConnected ? (
              <div className="flex items-center gap-1 md:gap-2">
                <Link
                  href="/dashboard"
                  className="bg-[#1a1a1e] border border-gray-700 hover:border-[#2F80ED] px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs flex items-center gap-1 md:gap-2 transition-colors"
                >
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden sm:inline text-xs md:text-sm">Connected</span>
                  <span className="sm:hidden text-xs">•</span>
                </Link>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">•••</span>
                </button>
              </div>
            ) : (
              <button
                className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-white px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm rounded-md font-medium hover:opacity-90 transition-opacity"
                onClick={() => setShowWalletModal(true)}
              >
                Connect
              </button>
            )}

            <button className="text-gray-300 xl:hidden p-1" onClick={() => setShowMobileMenu(true)}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 z-50 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-[85%] max-w-xs bg-[#121212] border-l border-gray-800 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-6 w-auto" />
                  <span className="text-lg font-bold text-white">MEVX</span>
                </div>
                <button onClick={() => setShowMobileMenu(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.path)}
                    className="w-full text-left px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1e] rounded-md transition-colors border-b border-gray-800/50 last:border-b-0"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <WalletConnectModal onClose={() => setShowWalletModal(false)} onSuccess={handleWalletConnectSuccess} />
      )}
    </>
  )
}

function NavItem({ label, hasDropdown = false, onClick }) {
  return (
    <motion.button
      className="flex items-center gap-1 text-xs text-gray-300 hover:text-white cursor-pointer px-2 py-1 rounded-md transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.05, color: "#ffffff" }}
      transition={{ duration: 0.2 }}
    >
      {label}
      {hasDropdown && <ChevronDown className="h-3 w-3" />}
    </motion.button>
  )
}

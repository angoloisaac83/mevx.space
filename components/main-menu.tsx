"use client"

import { useState } from "react"
import type React from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletStore } from "@/lib/wallet-store"
import WalletConnectModal from "@/components/wallet-connect-modal"

interface MainMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MainMenu({ isOpen, onClose }: MainMenuProps) {
  const router = useRouter()
  const { isConnected } = useWalletStore()

  // Add state for the wallet modal and redirect path
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [redirectPath, setRedirectPath] = useState("")

  // Update the handleNavigation function to show the wallet connect modal
  const handleNavigation = (path: string) => {
    if (
      !isConnected &&
      path !== "/" &&
      !path.includes("privacy") &&
      !path.includes("terms") &&
      !path.includes("docs")
    ) {
      setShowWalletModal(true)
      setRedirectPath(path)
      return
    }

    router.push(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="fixed right-0 top-0 h-full w-[80%] max-w-md bg-[#121212] overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-white">MEVX</span>
              </div>
              <button onClick={onClose} className="p-2">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              {/* Chain Selection */}
              <div className="bg-[#252A3D] rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="#14F195" />
                      <path d="M12 22L20 18V6L12 2" fill="#9945FF" />
                      <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="#14F195" />
                      <path d="M12 10L4 6V18L12 22V10Z" fill="#A7F2D1" />
                      <path d="M12 10L20 6V18L12 22V10Z" fill="#7C3AED" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">SOL</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Language Selection */}
              <div className="bg-[#252A3D] rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="#1A47B8" />
                      <path d="M2 8H22V16H2V8Z" fill="#F93939" />
                      <path d="M2 8H22V16H2V8Z" fill="white" />
                      <path d="M13.5 8L22 8V16H13.5V8Z" fill="#1A47B8" />
                      <path d="M2 8L10.5 8V16H2L2 8Z" fill="#1A47B8" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">English</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 gap-2">
                <MenuButton label="DASHBOARD" onClick={() => handleNavigation("/dashboard")} />
                <MenuButton label="TRENDING" onClick={() => handleNavigation("/")} />
                <MenuButton label="NEW PAIRS" onClick={() => handleNavigation("/new-pairs")} />
                <MenuButton label="MEME ZONE" onClick={() => handleNavigation("/meme-zone")} />
                <MenuButton label="DEGEN ZONE" onClick={() => handleNavigation("/degen-zone")} />
                <MenuButton label="FAVORITES" onClick={() => handleNavigation("/favorites")} />
                <MenuButton label="SNIPE RAYDIUM" onClick={() => handleNavigation("/snipe/raydium")} />
                <MenuButton label="SNIPE LAUNCHLAB" onClick={() => handleNavigation("/snipe/launchlab")} />
                <MenuButton label="SNIPE PUMPFUN" onClick={() => handleNavigation("/snipe/pumpfun")} />
                <MenuButton label="SNIPE MOONSHOT" onClick={() => handleNavigation("/snipe/moonshot")} />
                <MenuButton label="AIRDROP" onClick={() => handleNavigation("/airdrop")} />
                <MenuButton label="REFERRAL" onClick={() => handleNavigation("/referral")} />
                <MenuButton label="CLAIM SOL" onClick={() => handleNavigation("/claim-sol")} />
                <MenuButton label="COPY TRADE" onClick={() => handleNavigation("/copy-trade")} />
                <MenuButton label="PORTFOLIO" onClick={() => handleNavigation("/portfolio")} />
                <MenuButton label="MULTI CHART" onClick={() => handleNavigation("/multi-chart")} />
                <MenuButton label="WALLET TRACKER" onClick={() => handleNavigation("/wallet-tracker")} />
                <MenuButton label="AUTOSNIPE" onClick={() => handleNavigation("/autosnipe")} />
              </div>

              <div className="border-t border-gray-700 my-3"></div>

              {/* Footer Links */}
              <div className="space-y-3">
                <FooterLink
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 20V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V20"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  label="Claim Your SOL"
                  onClick={() => handleNavigation("/claim-sol")}
                />
                <FooterLink
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  label="Privacy Policy"
                  onClick={() => handleNavigation("/privacy-policy")}
                />
                <FooterLink
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.09 9.00001C9.3251 8.33167 9.78915 7.76811 10.4 7.40914C11.0108 7.05016 11.7289 6.91894 12.4272 7.03872C13.1255 7.15849 13.7588 7.52153 14.2151 8.06353C14.6713 8.60554 14.9211 9.29153 14.92 10C14.92 12 11.92 13 11.92 13"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 17H12.01"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  label="Terms Of Use"
                  onClick={() => handleNavigation("/terms-of-use")}
                />
                <FooterLink
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  label="Docs"
                  onClick={() => handleNavigation("/docs")}
                />
              </div>
            </div>
          </motion.div>
          {showWalletModal && (
            <WalletConnectModal
              onClose={() => setShowWalletModal(false)}
              onSuccess={() => {
                setShowWalletModal(false)
                if (redirectPath) {
                  router.push(redirectPath)
                  onClose()
                }
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="bg-[#252A3D] hover:bg-[#2F3650] text-[#A8B3CF] text-xs font-medium py-3 px-2 rounded-lg text-center transition-colors"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function FooterLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-2 w-full hover:bg-[#252A3D] p-2 rounded-lg transition-colors"
      onClick={onClick}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white text-xs font-medium">{label}</span>
    </button>
  )
}

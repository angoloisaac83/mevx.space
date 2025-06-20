import { Connection, type PublicKey, Keypair } from "@solana/web3.js"
import * as bip39 from "bip39"
import { derivePath } from "ed25519-hd-key"

export interface WalletValidationResult {
  isValid: boolean
  publicKey?: string
  balance?: number
  error?: string
}

export class WalletValidator {
  private connection: Connection

  constructor(rpcUrl = "https://api.mainnet-beta.solana.com") {
    this.connection = new Connection(rpcUrl)
  }

  async validatePhantomWallet(passphrase?: string, recoveryPhrase?: string): Promise<WalletValidationResult> {
    try {
      // First try direct Phantom connection if available
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: false })
          const balance = await this.getBalance(response.publicKey)

          return {
            isValid: true,
            publicKey: response.publicKey.toString(),
            balance,
          }
        } catch (error) {
          console.log("Direct Phantom connection failed, trying other methods...")
        }
      }

      // Try recovery phrase validation
      if (recoveryPhrase?.trim()) {
        const recoveryResult = await this.validateRecoveryPhrase(recoveryPhrase.trim())
        if (recoveryResult.isValid) {
          return recoveryResult
        }
      }

      // Try private key validation
      if (passphrase?.trim()) {
        const keyResult = await this.validatePrivateKey(passphrase.trim())
        if (keyResult.isValid) {
          return keyResult
        }
      }

      return {
        isValid: false,
        error: "No valid wallet credentials provided",
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message || "Wallet validation failed",
      }
    }
  }

  async validateRecoveryPhrase(recoveryPhrase: string): Promise<WalletValidationResult> {
    try {
      // Validate mnemonic format
      if (!bip39.validateMnemonic(recoveryPhrase)) {
        return {
          isValid: false,
          error: "Invalid recovery phrase format",
        }
      }

      // Generate wallet from recovery phrase
      const seed = await bip39.mnemonicToSeed(recoveryPhrase)
      const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key
      const keypair = Keypair.fromSeed(derivedSeed)

      // Check if wallet exists on blockchain (has any transaction history)
      const publicKey = keypair.publicKey
      const balance = await this.getBalance(publicKey)

      // Get transaction history to verify wallet exists
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 1 })

      return {
        isValid: true,
        publicKey: publicKey.toString(),
        balance,
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Invalid recovery phrase or wallet not found on blockchain",
      }
    }
  }

  async validatePrivateKey(privateKeyString: string): Promise<WalletValidationResult> {
    try {
      let keypair: Keypair

      // Try different private key formats
      try {
        // Try as JSON array format
        const privateKeyBytes = new Uint8Array(JSON.parse(privateKeyString))
        keypair = Keypair.fromSecretKey(privateKeyBytes)
      } catch {
        try {
          // Try as base58 format
          const bs58 = require("bs58")
          const privateKeyBytes = bs58.decode(privateKeyString)
          keypair = Keypair.fromSecretKey(privateKeyBytes)
        } catch {
          // Try as hex format
          const privateKeyBytes = new Uint8Array(
            privateKeyString.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [],
          )
          keypair = Keypair.fromSecretKey(privateKeyBytes)
        }
      }

      const balance = await this.getBalance(keypair.publicKey)

      return {
        isValid: true,
        publicKey: keypair.publicKey.toString(),
        balance,
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Invalid private key format",
      }
    }
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey)
      return balance / 1000000000 // Convert lamports to SOL
    } catch (error) {
      console.error("Error getting balance:", error)
      return 0
    }
  }

  async checkWalletActivity(publicKey: PublicKey): Promise<boolean> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 1 })
      return signatures.length > 0
    } catch (error) {
      console.error("Error checking wallet activity:", error)
      return false
    }
  }
}

// Global wallet validator instance
export const walletValidator = new WalletValidator()

"use client"

import { useWalletStore } from "@/lib/wallet-store"
import { useUserStore } from "@/lib/user-store"
import { Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function WalletBalanceDisplay() {
  const { isConnected, walletName, walletAddress } = useWalletStore()
  const { currentUser } = useUserStore()

  if (!isConnected || !currentUser) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Wallet className="h-4 w-4" />
        <span className="text-sm">Not Connected</span>
      </div>
    )
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-blue-400" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{walletName}</span>
          <span className="text-xs text-gray-400">{formatAddress(walletAddress || "")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm font-medium">{currentUser.balance.toFixed(4)} SOL</div>
          <div className="text-xs text-gray-400">Balance</div>
        </div>

        {currentUser.isVip && (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20 text-xs">VIP</Badge>
        )}
      </div>
    </div>
  )
}

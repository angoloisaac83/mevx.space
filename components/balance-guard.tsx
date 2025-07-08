"use client"

import type { ReactNode } from "react"
import { useUserStore } from "@/lib/user-store"
import { validateBalance, MINIMUM_BALANCE } from "@/lib/balance-validator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Wallet } from "lucide-react"

interface BalanceGuardProps {
  children: ReactNode
  requiredAmount?: number
  operation: string
  showCard?: boolean
  fallbackMessage?: string
}

export default function BalanceGuard({
  children,
  requiredAmount = MINIMUM_BALANCE,
  operation,
  showCard = true,
  fallbackMessage,
}: BalanceGuardProps) {
  const { currentUser } = useUserStore()
  const currentBalance = currentUser?.balance || 0
  const validation = validateBalance(currentBalance, requiredAmount)

  if (validation.isValid) {
    return <>{children}</>
  }

  if (!showCard) {
    return <div className="opacity-50 pointer-events-none">{children}</div>
  }

  return (
    <Card className="bg-red-500/10 border-red-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Insufficient Balance for {operation}
        </CardTitle>
        <CardDescription>{fallbackMessage || validation.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Balance:</span>
            <span className="text-white">{currentBalance.toFixed(4)} SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Required:</span>
            <span className="text-red-400">{requiredAmount} SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Shortfall:</span>
            <span className="text-red-400">{validation.shortfall.toFixed(4)} SOL</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="border-red-500 text-red-400 bg-transparent">
              <Wallet className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

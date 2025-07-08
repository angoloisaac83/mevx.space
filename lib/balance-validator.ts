"use client"

import { toast } from "@/hooks/use-toast"

export const MINIMUM_BALANCE = 0.5 // Minimum SOL balance required

export interface BalanceValidation {
  isValid: boolean
  message: string
  requiredAmount: number
  currentAmount: number
  shortfall: number
}

export function validateBalance(currentBalance: number, requiredAmount: number = MINIMUM_BALANCE): BalanceValidation {
  const isValid = currentBalance >= requiredAmount
  const shortfall = Math.max(0, requiredAmount - currentBalance)

  return {
    isValid,
    message: isValid
      ? "Balance sufficient"
      : `Insufficient balance. Need ${requiredAmount} SOL, have ${currentBalance.toFixed(4)} SOL`,
    requiredAmount,
    currentAmount: currentBalance,
    shortfall,
  }
}

export function checkBalanceAndShowError(currentBalance: number, requiredAmount: number, operation: string): boolean {
  const validation = validateBalance(currentBalance, requiredAmount)

  if (!validation.isValid) {
    toast({
      title: "Insufficient Balance",
      description: `You need at least ${requiredAmount} SOL to ${operation}. Current balance: ${currentBalance.toFixed(4)} SOL`,
      variant: "destructive",
    })
    return false
  }

  return true
}

export function getBalanceStatus(currentBalance: number): {
  status: "sufficient" | "low" | "insufficient"
  message: string
  color: string
} {
  if (currentBalance >= MINIMUM_BALANCE) {
    return {
      status: "sufficient",
      message: "Balance sufficient for all features",
      color: "text-green-400",
    }
  } else if (currentBalance >= MINIMUM_BALANCE * 0.8) {
    return {
      status: "low",
      message: "Balance is getting low",
      color: "text-yellow-400",
    }
  } else {
    return {
      status: "insufficient",
      message: `Need ${(MINIMUM_BALANCE - currentBalance).toFixed(4)} more SOL`,
      color: "text-red-400",
    }
  }
}

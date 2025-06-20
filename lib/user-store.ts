import { create } from "zustand"

export interface User {
  id: string
  walletAddress: string
  walletType: string
  walletName: string
  balance: number
  profitLoss: number
  totalTrades: number
  joinDate: string
  lastActive: string
  status: "active" | "inactive" | "suspended" | "banned"
  isVip: boolean
  tradingLimit: number
  dailyTradingVolume: number
  monthlyTradingVolume: number
  referralCode: string
  referredBy?: string
  kycStatus: "pending" | "verified" | "rejected"
  riskLevel: "low" | "medium" | "high"
  notes: string
}

interface UserStore {
  users: User[]
  addUser: (walletAddress: string, walletType: string, walletName: string) => void
  updateUserBalance: (userId: string, newBalance: number) => void
  toggleUserStatus: (userId: string) => void
  toggleVipStatus: (userId: string) => void
  deleteUser: (userId: string) => void
  updateTradingLimit: (userId: string, limit: number) => void
  updateKycStatus: (userId: string, status: "pending" | "verified" | "rejected") => void
  updateRiskLevel: (userId: string, level: "low" | "medium" | "high") => void
  addUserNotes: (userId: string, notes: string) => void
  banUser: (userId: string) => void
  unbanUser: (userId: string) => void
  resetUserPassword: (userId: string) => void
  getUserStats: () => {
    totalUsers: number
    activeUsers: number
    bannedUsers: number
    vipUsers: number
    totalBalance: number
    totalVolume: number
  }
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  addUser: (walletAddress: string, walletType: string, walletName: string) => {
    const existingUser = get().users.find((u) => u.walletAddress === walletAddress)
    if (existingUser) {
      // Update last active for existing user
      set((state) => ({
        users: state.users.map((user) =>
          user.walletAddress === walletAddress ? { ...user, lastActive: new Date().toISOString() } : user,
        ),
      }))
      return
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      walletType,
      walletName,
      balance: 0,
      profitLoss: 0,
      totalTrades: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: "active",
      isVip: false,
      tradingLimit: 1000,
      dailyTradingVolume: 0,
      monthlyTradingVolume: 0,
      referralCode: `REF_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      kycStatus: "pending",
      riskLevel: "low",
      notes: "",
    }

    set((state) => ({
      users: [...state.users, newUser],
    }))
  },
  updateUserBalance: (userId: string, newBalance: number) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, balance: newBalance } : user)),
    }))
  },
  toggleUserStatus: (userId: string) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    }))
  },
  toggleVipStatus: (userId: string) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, isVip: !user.isVip } : user)),
    }))
  },
  deleteUser: (userId: string) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    }))
  },
  updateTradingLimit: (userId: string, limit: number) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, tradingLimit: limit } : user)),
    }))
  },

  updateKycStatus: (userId: string, status: "pending" | "verified" | "rejected") => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, kycStatus: status } : user)),
    }))
  },

  updateRiskLevel: (userId: string, level: "low" | "medium" | "high") => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, riskLevel: level } : user)),
    }))
  },

  addUserNotes: (userId: string, notes: string) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, notes } : user)),
    }))
  },

  banUser: (userId: string) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, status: "banned" as const } : user)),
    }))
  },

  unbanUser: (userId: string) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === userId ? { ...user, status: "active" as const } : user)),
    }))
  },

  resetUserPassword: (userId: string) => {
    // This would typically trigger a password reset email
    console.log(`Password reset initiated for user ${userId}`)
  },

  getUserStats: () => {
    const users = get().users
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active").length,
      bannedUsers: users.filter((u) => u.status === "banned").length,
      vipUsers: users.filter((u) => u.isVip).length,
      totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
      totalVolume: users.reduce((sum, u) => sum + u.monthlyTradingVolume, 0),
    }
  },
}))

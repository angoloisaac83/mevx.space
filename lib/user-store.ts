"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  walletAddress: string
  walletType: string
  walletName: string
  balance: number
  totalDeposited: number
  totalWithdrawn: number
  autoSnipeConfigs: number
  activeSnipes: number
  totalTrades: number
  profitLoss: number
  lastActive: string
  joinDate: string
  status: "active" | "inactive" | "suspended" | "banned"
  isVip: boolean
  connectionMethod: string
}

type UserStore = {
  users: User[]
  currentUser: User | null
  addUser: (userData: Partial<User>) => User
  updateUser: (userId: string, updates: Partial<User>) => void
  updateUserBalance: (userId: string, newBalance: number) => void
  toggleUserStatus: (userId: string) => void
  toggleVipStatus: (userId: string) => void
  setCurrentUser: (user: User | null) => void
  getUserByWallet: (walletAddress: string) => User | null
  deleteUser: (userId: string) => void
  getAllUsers: () => User[]
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      addUser: (userData) => {
        console.log("Adding user to store:", userData)

        // Check if user already exists
        const existingUser = get().users.find((u) => u.walletAddress === userData.walletAddress)
        if (existingUser) {
          console.log("User already exists, updating last active:", existingUser)
          // Update existing user's last active time
          set((state) => ({
            users: state.users.map((user) =>
              user.walletAddress === userData.walletAddress ? { ...user, lastActive: new Date().toISOString() } : user,
            ),
            currentUser: { ...existingUser, lastActive: new Date().toISOString() },
          }))
          return existingUser
        }

        const newUser: User = {
          id: Date.now().toString(),
          walletAddress: userData.walletAddress || "",
          walletType: userData.walletType || "",
          walletName: userData.walletName || "",
          balance: 0, // Default balance is always 0
          totalDeposited: 0,
          totalWithdrawn: 0,
          autoSnipeConfigs: 0,
          activeSnipes: 0,
          totalTrades: 0,
          profitLoss: 0,
          lastActive: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          status: "active",
          isVip: false,
          connectionMethod: userData.connectionMethod || "",
          ...userData,
          balance: 0, // Ensure balance is always 0 regardless of input
        }

        console.log("Created new user:", newUser)

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }))

        console.log("Users after adding:", get().users)
        return newUser
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  ...updates,
                  lastActive: new Date().toISOString(),
                }
              : user,
          ),
          currentUser:
            state.currentUser?.id === userId
              ? {
                  ...state.currentUser,
                  ...updates,
                  lastActive: new Date().toISOString(),
                }
              : state.currentUser,
        }))
      },

      updateUserBalance: (userId, newBalance) => {
        set((state) => {
          const user = state.users.find((u) => u.id === userId)
          if (!user) return state

          const balanceDiff = newBalance - user.balance
          const updatedUser = {
            ...user,
            balance: newBalance,
            totalDeposited: balanceDiff > 0 ? user.totalDeposited + balanceDiff : user.totalDeposited,
            totalWithdrawn: balanceDiff < 0 ? user.totalWithdrawn + Math.abs(balanceDiff) : user.totalWithdrawn,
            lastActive: new Date().toISOString(),
          }

          return {
            users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
            currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
          }
        })
      },

      toggleUserStatus: (userId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: user.status === "active" ? "suspended" : "active",
                  lastActive: new Date().toISOString(),
                }
              : user,
          ),
        }))
      },

      toggleVipStatus: (userId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  isVip: !user.isVip,
                  lastActive: new Date().toISOString(),
                }
              : user,
          ),
        }))
      },

      setCurrentUser: (user) => {
        set({ currentUser: user })
      },

      getUserByWallet: (walletAddress) => {
        return get().users.find((user) => user.walletAddress === walletAddress) || null
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
          currentUser: state.currentUser?.id === userId ? null : state.currentUser,
        }))
      },

      getAllUsers: () => {
        return get().users
      },
    }),
    {
      name: "user-storage",
    },
  ),
)

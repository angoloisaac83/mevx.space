"use client"

import { create } from "zustand"
import {
  storeUserData,
  getAllUsers as getFirestoreUsers,
  updateUserInFirestore,
  deleteUserFromFirestore,
  subscribeToUsers,
  checkUserExists,
} from "./firebase"

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
  firestoreId?: string
}

type UserStore = {
  users: User[]
  currentUser: User | null
  loading: boolean
  addUser: (userData: Partial<User>) => Promise<User>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>
  toggleUserStatus: (userId: string) => Promise<void>
  toggleVipStatus: (userId: string) => Promise<void>
  setCurrentUser: (user: User | null) => void
  getUserByWallet: (walletAddress: string) => User | null
  deleteUser: (userId: string) => Promise<void>
  getAllUsers: () => User[]
  loadUsersFromFirestore: () => Promise<void>
  subscribeToRealtimeUpdates: () => () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,

  addUser: async (userData) => {
    console.log("Adding user to store:", userData)

    try {
      // Check if user already exists in Firestore
      const existingUser = await checkUserExists(userData.walletAddress || "")
      if (existingUser) {
        console.log("User already exists in Firestore, updating last active:", existingUser)

        // Update existing user's last active time
        await updateUserInFirestore(existingUser.id, {
          lastActive: new Date().toISOString(),
        })

        // Update local store
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

      // Store in Firestore
      const firestoreId = await storeUserData(newUser)
      newUser.firestoreId = firestoreId

      // Update local store
      set((state) => ({
        users: [...state.users, newUser],
        currentUser: newUser,
      }))

      console.log("Users after adding:", get().users)
      return newUser
    } catch (error) {
      console.error("Error adding user:", error)
      throw error
    }
  },

  updateUser: async (userId, updates) => {
    try {
      // Update in Firestore
      await updateUserInFirestore(userId, updates)

      // Update local store
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
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },

  updateUserBalance: async (userId, newBalance) => {
    try {
      const user = get().users.find((u) => u.id === userId)
      if (!user) return

      const balanceDiff = newBalance - user.balance
      const updates = {
        balance: newBalance,
        totalDeposited: balanceDiff > 0 ? user.totalDeposited + balanceDiff : user.totalDeposited,
        totalWithdrawn: balanceDiff < 0 ? user.totalWithdrawn + Math.abs(balanceDiff) : user.totalWithdrawn,
        lastActive: new Date().toISOString(),
      }

      // Update in Firestore
      await updateUserInFirestore(userId, updates)

      // Update local store
      set((state) => {
        const updatedUser = {
          ...user,
          ...updates,
        }

        return {
          users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
          currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
        }
      })
    } catch (error) {
      console.error("Error updating user balance:", error)
      throw error
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const user = get().users.find((u) => u.id === userId)
      if (!user) return

      const newStatus = user.status === "active" ? "suspended" : "active"

      await get().updateUser(userId, { status: newStatus })
    } catch (error) {
      console.error("Error toggling user status:", error)
      throw error
    }
  },

  toggleVipStatus: async (userId) => {
    try {
      const user = get().users.find((u) => u.id === userId)
      if (!user) return

      await get().updateUser(userId, { isVip: !user.isVip })
    } catch (error) {
      console.error("Error toggling VIP status:", error)
      throw error
    }
  },

  setCurrentUser: (user) => {
    set({ currentUser: user })
  },

  getUserByWallet: (walletAddress) => {
    return get().users.find((user) => user.walletAddress === walletAddress) || null
  },

  deleteUser: async (userId) => {
    try {
      // Delete from Firestore
      await deleteUserFromFirestore(userId)

      // Update local store
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        currentUser: state.currentUser?.id === userId ? null : state.currentUser,
      }))
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  },

  getAllUsers: () => {
    return get().users
  },

  loadUsersFromFirestore: async () => {
    try {
      set({ loading: true })
      console.log("Loading users from Firestore...")

      const firestoreUsers = await getFirestoreUsers()
      console.log("Loaded users from Firestore:", firestoreUsers)

      set({
        users: firestoreUsers,
        loading: false,
      })
    } catch (error) {
      console.error("Error loading users from Firestore:", error)
      set({ loading: false })
    }
  },

  subscribeToRealtimeUpdates: () => {
    console.log("Subscribing to real-time user updates...")

    const unsubscribe = subscribeToUsers((users) => {
      console.log("Received real-time user update:", users)
      set({ users })
    })

    return unsubscribe
  },
}))

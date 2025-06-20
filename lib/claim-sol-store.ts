import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ClaimData {
  lastClaimDate: string | null
  currentStreak: number
  weekStartDate: string | null
  claimedDays: number[]
  totalClaimed: number
  claimHistory: Array<{
    date: string
    amount: number
    type: "daily" | "task"
    description: string
  }>
}

interface ClaimSolStore extends ClaimData {
  canClaim: () => boolean
  getNextClaimTime: () => number
  claimDailyReward: () => { success: boolean; amount: number; message: string }
  completeTask: (taskId: string, amount: number, description: string) => void
  resetWeeklyProgress: () => void
  getDaysUntilReset: () => number
  getCurrentWeekDay: () => number
}

const DAILY_REWARDS = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.05] // SOL amounts for each day

export const useClaimSolStore = create<ClaimSolStore>()(
  persist(
    (set, get) => ({
      lastClaimDate: null,
      currentStreak: 0,
      weekStartDate: null,
      claimedDays: [],
      totalClaimed: 0,
      claimHistory: [],

      canClaim: () => {
        const state = get()
        const today = new Date().toDateString()
        return state.lastClaimDate !== today
      },

      getNextClaimTime: () => {
        const state = get()
        if (state.canClaim()) return 0

        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)

        return tomorrow.getTime() - now.getTime()
      },

      getCurrentWeekDay: () => {
        const state = get()
        if (!state.weekStartDate) return 0

        const weekStart = new Date(state.weekStartDate)
        const now = new Date()
        const diffTime = now.getTime() - weekStart.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        return Math.min(diffDays, 6) // 0-6 for days of the week
      },

      claimDailyReward: () => {
        const state = get()

        if (!state.canClaim()) {
          return { success: false, amount: 0, message: "Already claimed today!" }
        }

        const today = new Date().toDateString()
        const now = new Date()

        // Initialize week if not set or if week has passed
        let weekStartDate = state.weekStartDate
        let claimedDays = [...state.claimedDays]
        let currentStreak = state.currentStreak

        if (!weekStartDate) {
          // First time claiming - start new week
          weekStartDate = today
          claimedDays = []
          currentStreak = 0
        } else {
          const weekStart = new Date(weekStartDate)
          const daysSinceWeekStart = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))

          // Reset if more than 7 days have passed
          if (daysSinceWeekStart >= 7) {
            weekStartDate = today
            claimedDays = []
            currentStreak = 0
          }
        }

        // Calculate current day in the week (0-6)
        const weekStart = new Date(weekStartDate)
        const currentDay = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))

        if (currentDay >= 7) {
          return { success: false, amount: 0, message: "Week has ended. Starting new week..." }
        }

        // Check if this day was already claimed
        if (claimedDays.includes(currentDay)) {
          return { success: false, amount: 0, message: "Already claimed for this day!" }
        }

        const rewardAmount = DAILY_REWARDS[currentDay] || 0.01
        claimedDays.push(currentDay)
        currentStreak = claimedDays.length

        const newClaimEntry = {
          date: today,
          amount: rewardAmount,
          type: "daily" as const,
          description: `Day ${currentDay + 1} Daily Reward`,
        }

        set({
          lastClaimDate: today,
          currentStreak,
          weekStartDate,
          claimedDays,
          totalClaimed: state.totalClaimed + rewardAmount,
          claimHistory: [newClaimEntry, ...state.claimHistory].slice(0, 50), // Keep last 50 entries
        })

        return {
          success: true,
          amount: rewardAmount,
          message: `Claimed ${rewardAmount} SOL! Day ${currentDay + 1} of 7 complete.`,
        }
      },

      completeTask: (taskId: string, amount: number, description: string) => {
        const state = get()
        const today = new Date().toDateString()

        const newClaimEntry = {
          date: today,
          amount,
          type: "task" as const,
          description,
        }

        set({
          totalClaimed: state.totalClaimed + amount,
          claimHistory: [newClaimEntry, ...state.claimHistory].slice(0, 50),
        })
      },

      resetWeeklyProgress: () => {
        const today = new Date().toDateString()
        set({
          weekStartDate: today,
          claimedDays: [],
          currentStreak: 0,
        })
      },

      getDaysUntilReset: () => {
        const state = get()
        if (!state.weekStartDate) return 7

        const weekStart = new Date(state.weekStartDate)
        const now = new Date()
        const daysSinceStart = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))

        return Math.max(0, 7 - daysSinceStart)
      },
    }),
    {
      name: "claim-sol-storage",
    },
  ),
)

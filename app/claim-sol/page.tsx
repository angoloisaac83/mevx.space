"use client"

import { useState, useEffect } from "react"
import PageTemplate from "@/components/page-template"
import { Coins, Gift, Clock, CheckCircle, Calendar, Trophy, Zap } from "lucide-react"
import { useClaimSolStore } from "@/lib/claim-sol-store"
import { toast } from "@/hooks/use-toast"

export default function ClaimSolPage() {
  const {
    totalClaimed,
    claimedDays,
    currentStreak,
    claimHistory,
    canClaim,
    getNextClaimTime,
    claimDailyReward,
    completeTask,
    getDaysUntilReset,
    getCurrentWeekDay,
  } = useClaimSolStore()

  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilNextClaim(getNextClaimTime())
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [getNextClaimTime])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const handleClaimDaily = () => {
    const result = claimDailyReward()
    if (result.success) {
      toast.success(`Successfully claimed ${result.amount} SOL!`)
    } else {
      toast.warning(result.message)
    }
  }

  const handleCompleteTask = (taskId: string, amount: number, description: string) => {
    if (completedTasks.includes(taskId)) {
      toast.warning("Task already completed!")
      return
    }

    completeTask(taskId, amount, description)
    setCompletedTasks([...completedTasks, taskId])
    toast.success(`Task completed! Earned ${amount} SOL`)
  }

  const DAILY_REWARDS = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.05]
  const currentWeekDay = getCurrentWeekDay()

  return (
    <PageTemplate title="Claim SOL">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="h-6 w-6 text-[#2F80ED]" />
        <p className="text-gray-300">
          Complete daily check-ins and tasks to earn free SOL. Weekly rewards reset every 7 days.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-5 w-5 text-[#2F80ED]" />
            <span className="text-sm text-gray-400">Total Earned</span>
          </div>
          <div className="text-2xl font-bold">{totalClaimed.toFixed(3)} SOL</div>
          <div className="text-xs text-gray-400">≈ ${(totalClaimed * 150).toFixed(2)}</div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Current Streak</span>
          </div>
          <div className="text-2xl font-bold">{currentStreak}/7</div>
          <div className="text-xs text-gray-400">Days this week</div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-400">Week Resets In</span>
          </div>
          <div className="text-2xl font-bold">{getDaysUntilReset()}</div>
          <div className="text-xs text-gray-400">Days remaining</div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-400">Next Claim</span>
          </div>
          <div className="text-lg font-bold">{canClaim() ? "Available!" : formatTime(timeUntilNextClaim)}</div>
          <div className="text-xs text-gray-400">{canClaim() ? "Ready to claim" : "Time remaining"}</div>
        </div>
      </div>

      {/* Daily Claim Section */}
      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-medium mb-1">Daily SOL Reward</h3>
            <div className="text-3xl font-bold">{currentWeekDay < 7 ? DAILY_REWARDS[currentWeekDay] : 0} SOL</div>
            <div className="text-xs text-gray-400">
              Day {Math.min(currentWeekDay + 1, 7)} of 7 • Week resets in {getDaysUntilReset()} days
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleClaimDaily}
              disabled={!canClaim() || currentWeekDay >= 7}
              className="bg-[#2F80ED] hover:bg-[#2D74D6] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {canClaim() && currentWeekDay < 7 ? "Claim Daily Reward" : "Already Claimed"}
            </button>
            {!canClaim() && timeUntilNextClaim > 0 && (
              <div className="text-xs text-center text-gray-400">Next claim: {formatTime(timeUntilNextClaim)}</div>
            )}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-[#1a1a2e] p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-3">Weekly Progress</h4>
          <div className="grid grid-cols-7 gap-2">
            {DAILY_REWARDS.map((amount, day) => (
              <div
                key={day}
                className={`p-3 rounded-lg text-center transition-all ${
                  claimedDays.includes(day)
                    ? "bg-[#2F80ED]/20 border border-[#2F80ED]/30"
                    : day === currentWeekDay && canClaim()
                      ? "bg-yellow-500/20 border border-yellow-500/30 animate-pulse"
                      : day < currentWeekDay
                        ? "bg-red-500/20 border border-red-500/30"
                        : "bg-[#252542] border border-gray-700"
                }`}
              >
                <div className="font-medium mb-1">Day {day + 1}</div>
                <div className="text-sm">{amount} SOL</div>
                {claimedDays.includes(day) && (
                  <div className="mt-2 text-xs text-green-400 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Claimed</span>
                  </div>
                )}
                {day === currentWeekDay && canClaim() && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center justify-center gap-1">
                    <Gift className="h-3 w-3" />
                    <span>Ready</span>
                  </div>
                )}
                {day > currentWeekDay && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Locked</span>
                  </div>
                )}
                {day < currentWeekDay && !claimedDays.includes(day) && (
                  <div className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1">
                    <span>Missed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-4">Complete Tasks to Earn SOL</h3>
        <div className="space-y-3">
          {[
            {
              id: "connect-wallet",
              title: "Connect Your Wallet",
              description: "Connect your wallet to MEVX",
              reward: 0.01,
              completed: true,
            },
            {
              id: "complete-profile",
              title: "Complete Your Profile",
              description: "Fill out your profile information",
              reward: 0.02,
              completed: false,
            },
            {
              id: "first-trade",
              title: "Make Your First Trade",
              description: "Complete a trade on MEVX",
              reward: 0.05,
              completed: false,
            },
            {
              id: "refer-friend",
              title: "Refer a Friend",
              description: "Invite a friend to join MEVX",
              reward: 0.1,
              completed: false,
            },
          ].map((task) => (
            <div key={task.id} className="bg-[#1a1a2e] p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.completed || completedTasks.includes(task.id)
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[#2F80ED]/20 text-[#2F80ED]"
                    }`}
                  >
                    {task.completed || completedTasks.includes(task.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{task.id.split("-")[0][0].toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{task.reward} SOL</div>
                  {task.completed || completedTasks.includes(task.id) ? (
                    <div className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded">Completed</div>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task.id, task.reward, task.title)}
                      className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim History */}
      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">Recent Claims</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {claimHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No claims yet. Start by claiming your daily reward!</div>
          ) : (
            claimHistory.map((claim, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  {claim.type === "daily" ? (
                    <Gift className="h-4 w-4 text-[#2F80ED]" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  <span>{claim.description}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">+{claim.amount} SOL</div>
                  <div className="text-xs text-gray-400">{claim.date}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTemplate>
  )
}

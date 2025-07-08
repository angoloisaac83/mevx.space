"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import { useUserStore } from "@/lib/user-store"
import { usePriceStore } from "@/lib/price-service"
import { validateBalance, MINIMUM_BALANCE, checkBalanceAndShowError } from "@/lib/balance-validator"
import BalanceGuard from "@/components/balance-guard"
import {
  User,
  Wallet,
  TrendingUp,
  History,
  Settings,
  Bell,
  Copy,
  Eye,
  EyeOff,
  Plus,
  BarChart3,
  Zap,
  RefreshCw,
  ExternalLink,
  Filter,
  Download,
  Target,
  AlertTriangle,
  Play,
  Pause,
  Edit,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const { isConnected, walletName, walletAddress, disconnect } = useWalletStore()
  const {
    configs,
    autoSnipingTokens,
    loadUserConfigs,
    toggleConfig,
    updateConfig,
    deleteConfig,
    getUserConfigs,
    getActiveConfigs,
  } = useAutoSnipeStore()
  const {
    currentUser,
    getUserByWallet,
    updateUser,
    loading,
    subscribeToRealtimeUpdates,
    syncCurrentUser,
    updateUserTradingStats,
  } = useUserStore()
  const { solPrice, fetchSolPrice, startPriceUpdates } = usePriceStore()

  const [activeTab, setActiveTab] = useState("overview")
  const [showBalance, setShowBalance] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Real data only - no mock data
  const [alerts, setAlerts] = useState([])
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [showNewApiKey, setShowNewApiKey] = useState(false)
  const [apiKeys, setApiKeys] = useState([])

  // Balance validation
  const currentBalance = currentUser?.balance || 0
  const hasMinimumBalance = currentBalance >= MINIMUM_BALANCE
  const balanceValidation = validateBalance(currentBalance)

  // Get user's AutoSnipe configurations with real-time updates
  const userConfigs = getUserConfigs(walletAddress || "")
  const activeAutoSnipeConfigs = getActiveConfigs(walletAddress || "").length

  // Load and sync user data when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      console.log("Dashboard: Loading user data for wallet:", walletAddress)

      // Get user from store
      const user = getUserByWallet(walletAddress)
      if (user) {
        console.log("Found user in store:", user)
      }

      // Sync current user data
      syncCurrentUser(walletAddress)

      // Load user's AutoSnipe configurations
      loadUserConfigs(walletAddress)

      // Subscribe to real-time updates
      const unsubscribe = subscribeToRealtimeUpdates()

      return () => {
        console.log("Dashboard: Unsubscribing from real-time updates")
        unsubscribe()
      }
    }
  }, [isConnected, walletAddress, getUserByWallet, syncCurrentUser, subscribeToRealtimeUpdates, loadUserConfigs])

  // Listen for AutoSnipe configuration changes
  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      console.log("AutoSnipe config changed:", event.detail)
      // Force re-render by updating user stats
      if (currentUser && walletAddress) {
        const userConfigs = getUserConfigs(walletAddress)
        const activeConfigs = getActiveConfigs(walletAddress)

        updateUserTradingStats(currentUser.id, {
          autoSnipeConfigs: userConfigs.length,
          activeSnipes: activeConfigs.length,
        })
      }
    }

    window.addEventListener("autosnipe-config-changed", handleConfigChange as EventListener)
    window.addEventListener("autosnipe-token-changed", handleConfigChange as EventListener)

    return () => {
      window.removeEventListener("autosnipe-config-changed", handleConfigChange as EventListener)
      window.removeEventListener("autosnipe-token-changed", handleConfigChange as EventListener)
    }
  }, [currentUser, walletAddress, getUserConfigs, getActiveConfigs, updateUserTradingStats])

  // Start price updates
  useEffect(() => {
    const stopPriceUpdates = startPriceUpdates()
    return stopPriceUpdates
  }, [startPriceUpdates])

  // Update user's AutoSnipe stats when configs change
  useEffect(() => {
    if (currentUser && walletAddress) {
      const userConfigsCount = userConfigs.length
      const activeConfigsCount = activeAutoSnipeConfigs

      // Update user stats if they've changed
      if (currentUser.autoSnipeConfigs !== userConfigsCount || currentUser.activeSnipes !== activeConfigsCount) {
        updateUserTradingStats(currentUser.id, {
          autoSnipeConfigs: userConfigsCount,
          activeSnipes: activeConfigsCount,
        })
      }
    }
  }, [userConfigs.length, activeAutoSnipeConfigs, currentUser, walletAddress, updateUserTradingStats])

  // Log current user changes
  useEffect(() => {
    if (currentUser) {
      console.log("Dashboard: Current user updated:", currentUser)
    }
  }, [currentUser])

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
      toast({
        title: "Access Denied",
        description: "Please connect your wallet to access the dashboard",
        variant: "destructive",
      })
    }
  }, [isConnected, router])

  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const generateApiKey = () => {
    if (!checkBalanceAndShowError(currentBalance, 0, "API key generation")) {
      return
    }

    if (!newApiKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key name",
        variant: "destructive",
      })
      return
    }

    const newKey = {
      id: Date.now(),
      name: newApiKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    }

    setApiKeys((prev) => [...prev, newKey])
    setNewApiKeyName("")
    setShowNewApiKey(false)
    toast({
      title: "Success",
      description: "API key generated successfully",
    })
  }

  const toggleAlert = (id: number) => {
    if (!checkBalanceAndShowError(currentBalance, 0, "alert management")) {
      return
    }
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)))
  }

  const refreshUserData = async () => {
    setRefreshing(true)
    try {
      if (walletAddress) {
        syncCurrentUser(walletAddress)
        loadUserConfigs(walletAddress)
      }
      await fetchSolPrice()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Dashboard data refreshed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleAutoSnipeToggle = (configId: string) => {
    if (!checkBalanceAndShowError(currentBalance, 0.1, "AutoSnipe")) {
      return
    }

    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Wallet address not found",
        variant: "destructive",
      })
      return
    }

    toggleConfig(configId)

    const config = configs.find((c) => c.id === configId)
    if (config) {
      toast({
        title: config.isActive ? "AutoSnipe Stopped" : "AutoSnipe Started",
        description: `Configuration "${config.name}" ${config.isActive ? "deactivated" : "activated"}`,
      })
    }
  }

  const handleDeleteConfig = (configId: string) => {
    if (!checkBalanceAndShowError(currentBalance, 0, "configuration management")) {
      return
    }

    deleteConfig(configId)
    toast({
      title: "Success",
      description: "Configuration deleted successfully",
    })
  }

  const handleQuickBuy = () => {
    if (!checkBalanceAndShowError(currentBalance, 0.1, "token purchase")) {
      return
    }

    toast({
      title: "Feature Coming Soon",
      description: "Quick buy functionality will be available soon",
    })
  }

  const handleQuickSell = () => {
    if (!checkBalanceAndShowError(currentBalance, 0, "token sale")) {
      return
    }

    toast({
      title: "Feature Coming Soon",
      description: "Quick sell functionality will be available soon",
    })
  }

  // Calculate portfolio value with live SOL price
  const portfolioValue = currentBalance * solPrice

  // Real trades only - empty array until real trades are implemented
  const recentTrades = []

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">MEVX</span>
            </Link>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </Badge>
            {currentUser?.isVip && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">VIP</Badge>}
            {!hasMinimumBalance && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Balance
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-sm text-gray-400">SOL: ${solPrice.toFixed(2)}</div>
            <Button variant="outline" size="sm" onClick={refreshUserData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Trading</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Wallet Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Welcome back, {currentUser?.walletName || walletName} •
            <span className="block sm:inline">
              {currentUser?.walletAddress
                ? ` ${currentUser.walletAddress.substring(0, 6)}...${currentUser.walletAddress.substring(-6)}`
                : walletAddress
                  ? ` ${walletAddress.substring(0, 6)}...${walletAddress.substring(-6)}`
                  : ""}
            </span>
          </p>
        </div>

        {/* Balance Warning */}
        {!hasMinimumBalance && (
          <Card className="bg-red-500/10 border-red-500/20 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-400 text-base sm:text-lg">
                <AlertTriangle className="h-5 w-5" />
                Insufficient Balance Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-300 mb-3">
                Your current balance ({currentBalance.toFixed(4)} SOL) is below the minimum required balance of{" "}
                {MINIMUM_BALANCE} SOL. Most platform features are disabled until you add more funds.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="border-red-500 text-red-400 bg-transparent">
                  Add Funds
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                  View Markets
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 bg-[#1a1a1e] h-auto">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Wallet className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <History className="h-4 w-4" />
              <span className="text-xs sm:text-sm">History</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Zap className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Bots</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <User className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Balance</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0"
                  >
                    {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {showBalance ? `$${portfolioValue.toLocaleString()}` : "****"}
                  </div>
                  <p className="text-xs text-green-400 mt-1">
                    {currentUser?.profitLoss >= 0 ? "+" : ""}
                    {currentUser?.profitLoss?.toFixed(2) || "0.00"}% P&L
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">SOL Balance</CardTitle>
                  <div className="text-lg sm:text-2xl">🟣</div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {showBalance ? `${currentUser?.balance?.toFixed(4) || "0.0000"} SOL` : "****"}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ ${showBalance ? portfolioValue.toLocaleString() : "****"}
                  </p>
                  {!hasMinimumBalance && (
                    <p className="text-xs text-red-400 mt-1">Below minimum ({MINIMUM_BALANCE} SOL)</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">AutoSnipe Bots</CardTitle>
                  <Target className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{activeAutoSnipeConfigs}</div>
                  <p className="text-xs text-blue-400 mt-1">{userConfigs.length} total configs</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Total Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentUser?.totalTrades || 0}</div>
                  <p className="text-xs text-gray-400">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={currentUser?.status === "active" ? "default" : "destructive"}>
                      {currentUser?.status || "active"}
                    </Badge>
                    {currentUser?.isVip && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">VIP</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Member since {currentUser?.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : "N/A"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Deposits & Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Deposited:{" "}
                      <span className="text-green-400">{currentUser?.totalDeposited?.toFixed(4) || "0.0000"} SOL</span>
                    </p>
                    <p className="text-sm">
                      Withdrawn:{" "}
                      <span className="text-red-400">{currentUser?.totalWithdrawn?.toFixed(4) || "0.0000"} SOL</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Last Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {currentUser?.lastActive ? new Date(currentUser.lastActive).toLocaleString() : "Never"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AutoSnipe Status - show user's configurations */}
            {userConfigs.length > 0 ? (
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your AutoSnipe Configurations
                  </CardTitle>
                  <CardDescription>Manage your automated trading bots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userConfigs.slice(0, 5).map((config) => (
                      <div
                        key={config.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#252530] rounded-lg gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${config.isActive ? "bg-green-400" : "bg-gray-400"}`}
                          ></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{config.name}</p>
                            <p className="text-sm text-gray-400 truncate">{config.targetToken}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={config.isActive ? "default" : "secondary"} className="text-xs">
                            {config.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-400 whitespace-nowrap">{config.buyAmount} SOL</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAutoSnipeToggle(config.id)}
                              disabled={!hasMinimumBalance}
                              className="h-8 w-8 p-0"
                            >
                              {config.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push("/autosnipe")}
                              disabled={!hasMinimumBalance}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConfig(config.id)}
                              disabled={!hasMinimumBalance}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {userConfigs.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm" onClick={() => router.push("/autosnipe")}>
                          View All Configurations ({userConfigs.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    AutoSnipe Configurations
                  </CardTitle>
                  <CardDescription>No AutoSnipe configurations found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No AutoSnipe Configurations</h3>
                    <p className="text-gray-500 mb-4">Create your first configuration to start auto-sniping tokens</p>
                    <BalanceGuard requiredAmount={0.1} operation="AutoSnipe creation" showCard={false}>
                      <Button onClick={() => router.push("/autosnipe")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Configuration
                      </Button>
                    </BalanceGuard>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <BalanceGuard requiredAmount={0.1} operation="AutoSnipe" showCard={false}>
                    <Button
                      className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B] text-sm"
                      onClick={() => router.push("/autosnipe")}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      AutoSnipe
                    </Button>
                  </BalanceGuard>

                  <BalanceGuard requiredAmount={0} operation="browsing new pairs" showCard={false}>
                    <Button variant="outline" onClick={() => router.push("/new-pairs")} className="text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Pairs
                    </Button>
                  </BalanceGuard>

                  <Button variant="outline" onClick={() => router.push("/portfolio")} className="text-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Portfolio
                  </Button>

                  <Button
                    variant="outline"
                    onClick={refreshUserData}
                    disabled={refreshing}
                    className="text-sm bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - only show if there are real trades */}
            {recentTrades.length > 0 ? (
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTrades.slice(0, 3).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-[#252530] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${trade.type === "buy" ? "bg-green-400" : "bg-red-400"}`}
                          ></div>
                          <div>
                            <p className="font-medium">
                              {trade.type.toUpperCase()} {trade.token}
                            </p>
                            <p className="text-sm text-gray-400">
                              {trade.amount.toLocaleString()} @ ${trade.price}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${trade.value.toFixed(2)}</p>
                          <p className="text-sm text-gray-400">{new Date(trade.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <History className="h-12 w-12 mx-auto mb-4" />
                    <p>No recent activity</p>
                    <p className="text-sm">Your trading activity will appear here when you start trading</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Asset Breakdown</CardTitle>
                <CardDescription>Your current token holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#252530] rounded-lg gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🟣</div>
                      <div>
                        <p className="font-medium">Solana</p>
                        <p className="text-sm text-gray-400">SOL</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium">
                        {showBalance ? currentUser?.balance?.toFixed(4) || "0.0000" : "****"} SOL
                      </p>
                      <p className="text-sm text-gray-400">${showBalance ? portfolioValue.toFixed(2) : "****"}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-green-400 font-medium">+2.5%</p>
                      <p className="text-sm text-gray-400">24h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <BalanceGuard requiredAmount={0.1} operation="trading">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#1a1a1e] border-gray-800">
                  <CardHeader>
                    <CardTitle>Quick Buy</CardTitle>
                    <CardDescription>Buy tokens instantly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="buy-token">Token</Label>
                      <Input
                        id="buy-token"
                        placeholder="Enter token symbol or address"
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="buy-amount">Amount (SOL)</Label>
                      <Input
                        id="buy-amount"
                        type="number"
                        placeholder="0.0"
                        className="bg-[#252530] border border-gray-700 rounded-md"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]"
                      onClick={handleQuickBuy}
                      disabled={!hasMinimumBalance}
                    >
                      Buy Token
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a1e] border-gray-800">
                  <CardHeader>
                    <CardTitle>Quick Sell</CardTitle>
                    <CardDescription>Sell your tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sell-token">Token</Label>
                      <select
                        className="w-full p-2 bg-[#252530] border border-gray-700 rounded-md"
                        disabled={!hasMinimumBalance}
                      >
                        <option>Select token to sell</option>
                        <option value="SOL">Solana ({currentUser?.balance?.toFixed(4) || "0.0000"} SOL)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sell-percentage">Percentage</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                          25%
                        </Button>
                        <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                          50%
                        </Button>
                        <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                          75%
                        </Button>
                        <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                          100%
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                      onClick={handleQuickSell}
                      disabled={!hasMinimumBalance}
                    >
                      Sell Token
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </BalanceGuard>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Your complete trading history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <History className="h-12 w-12 mx-auto mb-4" />
                  <p>No trade history</p>
                  <p className="text-sm">Your trades will appear here when you start trading</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Total Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentUser?.totalTrades || 0}</div>
                  <p className="text-xs text-gray-400">All time</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {currentUser?.totalTrades > 0 ? "68.5%" : "0%"}
                  </div>
                  <p className="text-xs text-gray-400">Estimated</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Total P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${(currentUser?.profitLoss || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {(currentUser?.profitLoss || 0) >= 0 ? "+" : ""}${(currentUser?.profitLoss || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400">All time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bots Tab */}
          <TabsContent value="bots" className="space-y-6">
            <BalanceGuard requiredAmount={0.1} operation="AutoSnipe management">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">AutoSnipe Configurations</CardTitle>
                  <CardDescription>Manage your automated trading bots</CardDescription>
                </CardHeader>
                <CardContent>
                  {userConfigs.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No AutoSnipe Configurations</h3>
                      <p className="text-gray-500 mb-4">Create your first configuration to start auto-sniping tokens</p>
                      <Button onClick={() => router.push("/autosnipe")} disabled={!hasMinimumBalance}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Configuration
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#252530] rounded-lg gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${config.isActive ? "bg-green-400" : "bg-gray-400"}`}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{config.name}</p>
                              <p className="text-sm text-gray-400 truncate">
                                {config.targetToken} • {config.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                              <p className="font-medium">{config.buyAmount} SOL</p>
                              <p className="text-sm text-gray-400">Buy amount</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoSnipeToggle(config.id)}
                                disabled={!hasMinimumBalance}
                              >
                                {config.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/autosnipe")}
                                disabled={!hasMinimumBalance}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/autosnipe")}
                          disabled={!hasMinimumBalance}
                        >
                          Manage All Configurations
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BalanceGuard>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <BalanceGuard requiredAmount={0} operation="alert management">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle>Price Alerts</CardTitle>
                  <CardDescription>Get notified when prices hit your targets</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Bell className="h-12 w-12 mx-auto mb-4" />
                      <p>No price alerts set</p>
                      <p className="text-sm">Create alerts to get notified of price changes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={alert.enabled}
                              onCheckedChange={() => toggleAlert(alert.id)}
                              disabled={!hasMinimumBalance}
                            />
                            <div>
                              {alert.type === "price" ? (
                                <p className="font-medium">
                                  {alert.token} {alert.condition} ${alert.value}
                                </p>
                              ) : (
                                <p className="font-medium">{alert.message}</p>
                              )}
                              <p className="text-sm text-gray-400">{alert.type} alert</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled={!hasMinimumBalance}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </BalanceGuard>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#252530] rounded-lg gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔑</div>
                      <div>
                        <p className="font-medium">API Keys</p>
                        <p className="text-sm text-gray-400">Manage your API keys</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <Button variant="outline" size="sm" onClick={() => setShowNewApiKey(!showNewApiKey)}>
                        {showNewApiKey ? "Cancel" : "Add New API Key"}
                      </Button>
                    </div>
                  </div>
                  {showNewApiKey && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#252530] rounded-lg gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🏷️</div>
                        <div>
                          <Label htmlFor="new-api-key-name">Name</Label>
                          <Input
                            id="new-api-key-name"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            placeholder="Enter API key name"
                            className="bg-[#252530] border-gray-700"
                            disabled={!hasMinimumBalance}
                          />
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <Button variant="outline" size="sm" onClick={generateApiKey} disabled={!hasMinimumBalance}>
                          Generate API Key
                        </Button>
                      </div>
                    </div>
                  )}
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-4 bg-[#252530] rounded-lg gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🔑</div>
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="text-sm text-gray-400">{apiKey.key}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

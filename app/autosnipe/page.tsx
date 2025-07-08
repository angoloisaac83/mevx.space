"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import { useUserStore } from "@/lib/user-store"
import { usePriceStore } from "@/lib/price-service"
import { MINIMUM_BALANCE, checkBalanceAndShowError } from "@/lib/balance-validator"
import BalanceGuard from "@/components/balance-guard"
import {
  Target,
  Plus,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Save,
  X,
  Check,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AutoSnipePage() {
  const router = useRouter()
  const { isConnected, walletAddress } = useWalletStore()
  const { configs, addConfig, updateConfig, deleteConfig, toggleConfig, getUserConfigs, getActiveConfigs } =
    useAutoSnipeStore()
  const { currentUser, syncCurrentUser, updateUserTradingStats } = useUserStore()
  const { solPrice } = usePriceStore()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Form state for creating/editing configurations
  const [formData, setFormData] = useState({
    name: "",
    targetToken: "",
    minLiquidity: 10000,
    maxBuyTax: 10,
    maxSellTax: 10,
    buyAmount: 0.1,
    slippage: 5,
  })

  // Balance validation
  const currentBalance = currentUser?.balance || 0
  const hasMinimumBalance = currentBalance >= MINIMUM_BALANCE

  // Get user's configurations
  const userConfigs = getUserConfigs(walletAddress || "")
  const activeConfigs = getActiveConfigs(walletAddress || "")

  // Load user data when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      syncCurrentUser(walletAddress)
    }
  }, [isConnected, walletAddress, syncCurrentUser])

  // Listen for configuration changes and update user stats
  useEffect(() => {
    const handleConfigChange = () => {
      if (currentUser && walletAddress) {
        const userConfigsCount = getUserConfigs(walletAddress).length
        const activeConfigsCount = getActiveConfigs(walletAddress).length

        updateUserTradingStats(currentUser.id, {
          autoSnipeConfigs: userConfigsCount,
          activeSnipes: activeConfigsCount,
        })
      }
    }

    window.addEventListener("autosnipe-config-changed", handleConfigChange)
    window.addEventListener("autosnipe-token-changed", handleConfigChange)

    return () => {
      window.removeEventListener("autosnipe-config-changed", handleConfigChange)
      window.removeEventListener("autosnipe-token-changed", handleConfigChange)
    }
  }, [currentUser, walletAddress, getUserConfigs, getActiveConfigs, updateUserTradingStats])

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
      toast({
        title: "Access Denied",
        description: "Please connect your wallet to access AutoSnipe",
        variant: "destructive",
      })
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading AutoSnipe...</p>
        </div>
      </div>
    )
  }

  const handleCreateConfig = () => {
    if (!checkBalanceAndShowError(currentBalance, 0.1, "AutoSnipe configuration creation")) {
      return
    }

    if (!formData.name.trim() || !formData.targetToken.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newConfig = {
      id: Date.now().toString(),
      name: formData.name,
      targetToken: formData.targetToken,
      minLiquidity: formData.minLiquidity,
      maxBuyTax: formData.maxBuyTax,
      maxSellTax: formData.maxSellTax,
      buyAmount: formData.buyAmount,
      slippage: formData.slippage,
      isActive: false,
      created: new Date().toISOString(),
      triggers: 0,
      walletAddress: walletAddress || "",
      userId: currentUser?.id || "",
    }

    addConfig(newConfig)
    setShowCreateForm(false)
    setFormData({
      name: "",
      targetToken: "",
      minLiquidity: 10000,
      maxBuyTax: 10,
      maxSellTax: 10,
      buyAmount: 0.1,
      slippage: 5,
    })

    toast({
      title: "Success",
      description: "AutoSnipe configuration created successfully",
    })
  }

  const handleUpdateConfig = () => {
    if (!editingConfig) return

    if (!checkBalanceAndShowError(currentBalance, 0, "configuration update")) {
      return
    }

    const updatedConfig = {
      ...editingConfig,
      ...formData,
    }

    updateConfig(updatedConfig)
    setEditingConfig(null)
    setFormData({
      name: "",
      targetToken: "",
      minLiquidity: 10000,
      maxBuyTax: 10,
      maxSellTax: 10,
      buyAmount: 0.1,
      slippage: 5,
    })

    toast({
      title: "Success",
      description: "Configuration updated successfully",
    })
  }

  const handleToggleConfig = (configId: string) => {
    if (!checkBalanceAndShowError(currentBalance, 0.1, "AutoSnipe activation")) {
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
    if (!checkBalanceAndShowError(currentBalance, 0, "configuration deletion")) {
      return
    }

    deleteConfig(configId)
    toast({
      title: "Success",
      description: "Configuration deleted successfully",
    })
  }

  const startEditing = (config: any) => {
    setEditingConfig(config)
    setFormData({
      name: config.name,
      targetToken: config.targetToken,
      minLiquidity: config.minLiquidity,
      maxBuyTax: config.maxBuyTax,
      maxSellTax: config.maxSellTax,
      buyAmount: config.buyAmount,
      slippage: config.slippage,
    })
  }

  const cancelEditing = () => {
    setEditingConfig(null)
    setFormData({
      name: "",
      targetToken: "",
      minLiquidity: 10000,
      maxBuyTax: 10,
      maxSellTax: 10,
      buyAmount: 0.1,
      slippage: 5,
    })
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      if (walletAddress) {
        syncCurrentUser(walletAddress)
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Data refreshed successfully",
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
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Target className="h-3 w-3 mr-1" />
              AutoSnipe
            </Badge>
            {!hasMinimumBalance && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Balance
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-sm text-gray-400">SOL: ${solPrice.toFixed(2)}</div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">AutoSnipe Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your automated token sniping configurations</p>
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
                {MINIMUM_BALANCE} SOL. AutoSnipe features are disabled until you add more funds.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="border-red-500 text-red-400 bg-transparent">
                  Add Funds
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 bg-[#1a1a1e] h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Target className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="configurations"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Configurations</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Plus className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Create New</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Configs</CardTitle>
                  <Settings className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{userConfigs.length}</div>
                  <p className="text-xs text-gray-400 mt-1">All configurations</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Bots</CardTitle>
                  <Play className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-400">{activeConfigs.length}</div>
                  <p className="text-xs text-gray-400 mt-1">Currently running</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Triggers</CardTitle>
                  <Target className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {userConfigs.reduce((sum, config) => sum + (config.triggers || 0), 0)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Success Rate</CardTitle>
                  <Check className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-400">85%</div>
                  <p className="text-xs text-gray-400 mt-1">Estimated</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Configurations */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active AutoSnipe Configurations
                </CardTitle>
                <CardDescription>Currently running automated trading bots</CardDescription>
              </CardHeader>
              <CardContent>
                {activeConfigs.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Active Configurations</h3>
                    <p className="text-gray-500 mb-4">Start a configuration to begin auto-sniping</p>
                    <BalanceGuard requiredAmount={0.1} operation="AutoSnipe activation" showCard={false}>
                      <Button onClick={() => setActiveTab("configurations")}>View Configurations</Button>
                    </BalanceGuard>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#252530] rounded-lg gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{config.name}</p>
                            <p className="text-sm text-gray-400 truncate">
                              Target: {config.targetToken} • Buy: {config.buyAmount} SOL
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Active</Badge>
                          <span className="text-sm text-gray-400">{config.triggers || 0} triggers</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleConfig(config.id)}
                            disabled={!hasMinimumBalance}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Recent AutoSnipe Activity</CardTitle>
                <CardDescription>Latest triggers and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>No recent activity</p>
                  <p className="text-sm">AutoSnipe triggers will appear here when they occur</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurations Tab */}
          <TabsContent value="configurations" className="space-y-6">
            <BalanceGuard requiredAmount={0.1} operation="AutoSnipe management">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Your AutoSnipe Configurations</CardTitle>
                    <CardDescription>Manage all your automated trading configurations</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab("create")} disabled={!hasMinimumBalance}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </CardHeader>
                <CardContent>
                  {userConfigs.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No Configurations</h3>
                      <p className="text-gray-500 mb-4">Create your first AutoSnipe configuration</p>
                      <Button onClick={() => setActiveTab("create")} disabled={!hasMinimumBalance}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Configuration
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userConfigs.map((config) => (
                        <div key={config.id} className="p-4 bg-[#252530] rounded-lg">
                          {editingConfig?.id === config.id ? (
                            // Edit form
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-name">Configuration Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-[#1a1a1e] border-gray-700"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-target">Target Token</Label>
                                  <Input
                                    id="edit-target"
                                    value={formData.targetToken}
                                    onChange={(e) => setFormData({ ...formData, targetToken: e.target.value })}
                                    placeholder="Token symbol or address"
                                    className="bg-[#1a1a1e] border-gray-700"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-buy-amount">Buy Amount (SOL)</Label>
                                  <Input
                                    id="edit-buy-amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.buyAmount}
                                    onChange={(e) =>
                                      setFormData({ ...formData, buyAmount: Number.parseFloat(e.target.value) || 0 })
                                    }
                                    className="bg-[#1a1a1e] border-gray-700"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-slippage">Slippage (%)</Label>
                                  <Input
                                    id="edit-slippage"
                                    type="number"
                                    value={formData.slippage}
                                    onChange={(e) =>
                                      setFormData({ ...formData, slippage: Number.parseInt(e.target.value) || 0 })
                                    }
                                    className="bg-[#1a1a1e] border-gray-700"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateConfig} size="sm">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={cancelEditing} size="sm">
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Display view
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${config.isActive ? "bg-green-400" : "bg-gray-400"}`}
                                ></div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{config.name}</p>
                                  <p className="text-sm text-gray-400 truncate">
                                    {config.targetToken} • {config.buyAmount} SOL • {config.slippage}% slippage
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Created: {new Date(config.created).toLocaleDateString()} • Triggers:{" "}
                                    {config.triggers || 0}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={config.isActive ? "default" : "secondary"} className="text-xs">
                                  {config.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleConfig(config.id)}
                                    disabled={!hasMinimumBalance}
                                  >
                                    {config.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditing(config)}
                                    disabled={!hasMinimumBalance}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteConfig(config.id)}
                                    disabled={!hasMinimumBalance}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </BalanceGuard>
          </TabsContent>

          {/* Create New Tab */}
          <TabsContent value="create" className="space-y-6">
            <BalanceGuard requiredAmount={0.1} operation="AutoSnipe configuration creation">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle>Create New AutoSnipe Configuration</CardTitle>
                  <CardDescription>Set up a new automated trading bot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Configuration Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., PEPE Sniper"
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-token">Target Token *</Label>
                      <Input
                        id="target-token"
                        value={formData.targetToken}
                        onChange={(e) => setFormData({ ...formData, targetToken: e.target.value })}
                        placeholder="Token symbol or contract address"
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="buy-amount">Buy Amount (SOL) *</Label>
                      <Input
                        id="buy-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.buyAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, buyAmount: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="slippage">Slippage (%)</Label>
                      <Input
                        id="slippage"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.slippage}
                        onChange={(e) => setFormData({ ...formData, slippage: Number.parseInt(e.target.value) || 5 })}
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-liquidity">Min Liquidity ($)</Label>
                      <Input
                        id="min-liquidity"
                        type="number"
                        value={formData.minLiquidity}
                        onChange={(e) =>
                          setFormData({ ...formData, minLiquidity: Number.parseInt(e.target.value) || 0 })
                        }
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-buy-tax">Max Buy Tax (%)</Label>
                      <Input
                        id="max-buy-tax"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.maxBuyTax}
                        onChange={(e) => setFormData({ ...formData, maxBuyTax: Number.parseInt(e.target.value) || 0 })}
                        className="bg-[#252530] border-gray-700"
                        disabled={!hasMinimumBalance}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleCreateConfig}
                      disabled={!hasMinimumBalance || !formData.name.trim() || !formData.targetToken.trim()}
                      className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: "",
                          targetToken: "",
                          minLiquidity: 10000,
                          maxBuyTax: 10,
                          maxSellTax: 10,
                          buyAmount: 0.1,
                          slippage: 5,
                        })
                      }}
                      disabled={!hasMinimumBalance}
                    >
                      Reset Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </BalanceGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

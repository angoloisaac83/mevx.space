"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import { useUserStore } from "@/lib/user-store"
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
  Shield,
  Key,
  RefreshCw,
  ExternalLink,
  Filter,
  Download,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const { isConnected, walletName, walletAddress, disconnect } = useWalletStore()
  const { configs, autoSnipingTokens } = useAutoSnipeStore()
  const [activeTab, setActiveTab] = useState("overview")
  const [showBalance, setShowBalance] = useState(true)

  const mockBotStrategies = [
    { id: 1, name: "DCA Strategy", status: "active", profit: 156.78, trades: 24, enabled: true },
    { id: 2, name: "Scalping Bot", status: "paused", profit: -23.45, trades: 8, enabled: false },
    { id: 3, name: "Trend Following", status: "active", profit: 89.32, trades: 12, enabled: true },
  ]

  const mockAlerts = [
    { id: 1, type: "price", token: "SOL", condition: "above", value: 250, enabled: true },
    { id: 2, type: "trade", message: "Bot executed trade", enabled: true },
    { id: 3, type: "price", token: "BONK", condition: "below", value: 0.00003, enabled: false },
  ]

  const [botStrategies, setBotStrategies] = useState(mockBotStrategies)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [showNewApiKey, setShowNewApiKey] = useState(false)
  const { currentUser } = useUserStore()

  const [walletData, setWalletData] = useState({
    address: walletAddress || "",
    solBalance: currentUser?.balance || 0,
    usdBalance: (currentUser?.balance || 0) * 228.45, // SOL price approximation
    totalValue: (currentUser?.balance || 0) * 228.45,
    assets: [
      {
        symbol: "SOL",
        name: "Solana",
        balance: currentUser?.balance || 0,
        value: (currentUser?.balance || 0) * 228.45,
        change: 0,
        icon: "🟣",
      },
    ],
    recentTrades: [],
    apiKeys: [],
  })

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
      toast.error("Please connect your wallet to access the dashboard")
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const generateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast.error("Please enter an API key name")
      return
    }

    const newKey = {
      id: Date.now(),
      name: newApiKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}...`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    }

    setWalletData((prev) => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey],
    }))

    setNewApiKeyName("")
    setShowNewApiKey(false)
    toast.success("API key generated successfully")
  }

  const toggleBotStrategy = (id: number) => {
    setBotStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id
          ? { ...strategy, enabled: !strategy.enabled, status: !strategy.enabled ? "active" : "paused" }
          : strategy,
      ),
    )
  }

  const toggleAlert = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)))
  }

  // Get active AutoSnipe configurations count
  const activeAutoSnipeConfigs = configs.filter((config) => config.isActive).length

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="https://mevx.io/logo.svg" alt="MEVX Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">MEVX</span>
            </Link>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Back to Trading
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Wallet Dashboard</h1>
          <p className="text-gray-400">Manage your portfolio, trading strategies, and account settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 bg-[#1a1a1e]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Bots</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {showBalance ? `$${walletData.totalValue.toLocaleString()}` : "****"}
                  </div>
                  <p className="text-xs text-green-400 mt-1">+5.2% from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SOL Balance</CardTitle>
                  <div className="text-2xl">🟣</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{showBalance ? `${walletData.solBalance} SOL` : "****"}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ ${showBalance ? walletData.usdBalance.toLocaleString() : "****"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AutoSnipe Bots</CardTitle>
                  <Target className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeAutoSnipeConfigs}</div>
                  <p className="text-xs text-blue-400 mt-1">{configs.length} total configs</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">+$156.78</div>
                  <p className="text-xs text-green-400 mt-1">+5.02%</p>
                </CardContent>
              </Card>
            </div>

            {/* AutoSnipe Status */}
            {configs.length > 0 && (
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    AutoSnipe Status
                  </CardTitle>
                  <CardDescription>Your active AutoSnipe configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {configs.slice(0, 3).map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 bg-[#252530] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${config.isActive ? "bg-green-400" : "bg-gray-400"}`}
                          ></div>
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <p className="text-sm text-gray-400">{config.targetToken}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.isActive ? "default" : "secondary"}>
                            {config.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-400">{config.triggers} triggers</span>
                        </div>
                      </div>
                    ))}
                    {configs.length > 3 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm" onClick={() => router.push("/autosnipe")}>
                          View All Configurations ({configs.length})
                        </Button>
                      </div>
                    )}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    className="bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]"
                    onClick={() => router.push("/autosnipe")}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    AutoSnipe
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/new-pairs")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Pairs
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/portfolio")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Portfolio
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData.recentTrades.slice(0, 3).map((trade) => (
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
                  {walletData.assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{asset.icon}</div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-gray-400">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {showBalance ? asset.balance.toLocaleString() : "****"} {asset.symbol}
                        </p>
                        <p className="text-sm text-gray-400">${showBalance ? asset.value.toFixed(2) : "****"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${asset.change > 0 ? "text-green-400" : "text-red-400"}`}>
                          {asset.change > 0 ? "+" : ""}
                          {asset.change}%
                        </p>
                        <p className="text-sm text-gray-400">24h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="buy-amount">Amount (SOL)</Label>
                    <Input id="buy-amount" type="number" placeholder="0.0" className="bg-[#252530] border-gray-700" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#9945FF] via-[#43B4CA] to-[#19FB9B]">
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
                    <select className="w-full p-2 bg-[#252530] border border-gray-700 rounded-md">
                      <option>Select token to sell</option>
                      {walletData.assets.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>
                          {asset.name} ({asset.balance.toLocaleString()} {asset.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sell-percentage">Percentage</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        25%
                      </Button>
                      <Button variant="outline" size="sm">
                        50%
                      </Button>
                      <Button variant="outline" size="sm">
                        75%
                      </Button>
                      <Button variant="outline" size="sm">
                        100%
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">
                    Sell Token
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Market Data */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Market Data</CardTitle>
                <CardDescription>Real-time price information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Market charts will be displayed here</p>
                  <p className="text-sm">Integration with TradingView or similar charting library</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Your complete trading history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData.recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{trade.token}</p>
                          <p className="text-sm text-gray-400">{new Date(trade.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trade.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">@ ${trade.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${trade.value.toFixed(2)}</p>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">68.5%</div>
                  <p className="text-xs text-gray-400">87 profitable trades</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Total P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">+$2,847.32</div>
                  <p className="text-xs text-gray-400">All time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bots Tab */}
          <TabsContent value="bots" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>AutoSnipe Configurations</CardTitle>
                <CardDescription>Manage your automated trading bots</CardDescription>
              </CardHeader>
              <CardContent>
                {configs.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No AutoSnipe Configurations</h3>
                    <p className="text-gray-500 mb-4">Create your first configuration to start auto-sniping tokens</p>
                    <Button onClick={() => router.push("/autosnipe")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Configuration
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-2 h-2 rounded-full ${config.isActive ? "bg-green-400" : "bg-gray-400"}`}
                          ></div>
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <p className="text-sm text-gray-400">
                              {config.triggers} triggers • {config.isActive ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{config.buyAmount} SOL</p>
                          <p className="text-sm text-gray-400">Buy amount</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push("/autosnipe")}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="outline" onClick={() => router.push("/autosnipe")}>
                        Manage All Configurations
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Configure your risk parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-position">Max Position Size (%)</Label>
                    <Input id="max-position" type="number" defaultValue="10" className="bg-[#252530] border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                    <Input id="stop-loss" type="number" defaultValue="5" className="bg-[#252530] border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="take-profit">Take Profit (%)</Label>
                    <Input id="take-profit" type="number" defaultValue="15" className="bg-[#252530] border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="daily-loss">Daily Loss Limit ($)</Label>
                    <Input id="daily-loss" type="number" defaultValue="500" className="bg-[#252530] border-gray-700" />
                  </div>
                </div>
                <Button className="w-full">Save Risk Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>Get notified when prices hit your targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                      <div className="flex items-center gap-4">
                        <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
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
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create New Alert */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Create New Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="alert-token">Token</Label>
                    <Input id="alert-token" placeholder="SOL, BONK, etc." className="bg-[#252530] border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="alert-condition">Condition</Label>
                    <select className="w-full p-2 bg-[#252530] border border-gray-700 rounded-md">
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="alert-price">Price ($)</Label>
                    <Input id="alert-price" type="number" placeholder="0.00" className="bg-[#252530] border-gray-700" />
                  </div>
                </div>
                <Button className="w-full">Create Alert</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Wallet Information */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Your connected wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                  <div>
                    <p className="font-medium">Wallet Address</p>
                    <p className="text-sm text-gray-400 font-mono">
                      {walletAddress
                        ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(-8)}`
                        : "Not available"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => walletAddress && copyToClipboard(walletAddress)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                  <div>
                    <p className="font-medium">Wallet Type</p>
                    <p className="text-sm text-gray-400">{walletName || "Unknown"}</p>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* API Key Management */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for integrations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowNewApiKey(!showNewApiKey)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Key
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {showNewApiKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-[#252530] rounded-lg space-y-3"
                    >
                      <div>
                        <Label htmlFor="api-key-name">API Key Name</Label>
                        <Input
                          id="api-key-name"
                          value={newApiKeyName}
                          onChange={(e) => setNewApiKeyName(e.target.value)}
                          placeholder="e.g., Trading Bot, Portfolio Tracker"
                          className="bg-[#1a1a1e] border-gray-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={generateApiKey} size="sm">
                          Generate Key
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowNewApiKey(false)}>
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {walletData.apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium">{apiKey.name}</p>
                        <p className="text-sm text-gray-400 font-mono">{apiKey.key}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Created: {apiKey.created}</p>
                      <p className="text-sm text-gray-400">Last used: {apiKey.lastUsed}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-[#1a1a1e] border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Protect your account and funds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                  <div>
                    <p className="font-medium">Transaction Notifications</p>
                    <p className="text-sm text-gray-400">Get notified of all transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252530] rounded-lg">
                  <div>
                    <p className="font-medium">Auto-lock Wallet</p>
                    <p className="text-sm text-gray-400">Lock wallet after inactivity</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Wallet,
  Activity,
  TrendingUp,
  Settings,
  Shield,
  DollarSign,
  Bot,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/lib/user-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import PageLayout from "@/components/page-layout"
import Link from "next/link"

export default function AdminDashboard() {
  const { users } = useUserStore()
  const { configs } = useAutoSnipeStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    suspendedUsers: users.filter((u) => u.status === "suspended").length,
    vipUsers: users.filter((u) => u.isVip).length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalDeposited: users.reduce((sum, u) => sum + u.totalDeposited, 0),
    totalWithdrawn: users.reduce((sum, u) => sum + u.totalWithdrawn, 0),
    totalTrades: users.reduce((sum, u) => sum + u.totalTrades, 0),
    activeSnipes: configs.filter((c) => c.isActive).length,
    totalConfigs: configs.length,
  }

  const recentUsers = users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 5)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
  }

  if (loading) {
    return (
      <PageLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full"
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout showFooter={false}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-red-400" />
            <Badge className="bg-red-500/20 text-red-400 border-red-500/20">ADMIN</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage users, monitor activity, and control platform settings</p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/users">
            <Card className="bg-[#1a1a2e] border-gray-800 hover:bg-[#252542] transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                  Manage Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-400">Total registered users</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-[#1a1a2e] border-gray-800 hover:bg-[#252542] transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-purple-400 transition-colors">
                Platform Settings
              </CardTitle>
              <Settings className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Config</div>
              <p className="text-xs text-gray-400">System configuration</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800 hover:bg-[#252542] transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-green-400 transition-colors">
                AutoSnipe Monitor
              </CardTitle>
              <Bot className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSnipes}</div>
              <p className="text-xs text-gray-400">Active snipe bots</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
              <p className="text-xs text-gray-400">
                {stats.suspendedUsers > 0 && <span className="text-red-400">{stats.suspendedUsers} suspended</span>}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBalance.toFixed(2)} SOL</div>
              <p className="text-xs text-gray-400">Platform balances</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.vipUsers}</div>
              <p className="text-xs text-gray-400">Premium members</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-gray-400">All time trades</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest wallet connections</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No users connected yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatAddress(user.walletAddress)}</p>
                          <p className="text-xs text-gray-400">{user.walletName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === "active" ? "default" : "destructive"} className="text-xs">
                          {user.status}
                        </Badge>
                        {user.isVip && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20 text-xs">VIP</Badge>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(user.joinDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Database Connection</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Online</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">AutoSnipe Service</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Running</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">API Rate Limits</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">Warning</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Wallet Connections</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Stable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <Card className="bg-[#1a1a2e] border-gray-800 mt-6">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Platform financial metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalDeposited.toFixed(2)} SOL</div>
                <p className="text-sm text-gray-400">Total Deposited</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.totalWithdrawn.toFixed(2)} SOL</div>
                <p className="text-sm text-gray-400">Total Withdrawn</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {(stats.totalDeposited - stats.totalWithdrawn).toFixed(2)} SOL
                </div>
                <p className="text-sm text-gray-400">Net Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

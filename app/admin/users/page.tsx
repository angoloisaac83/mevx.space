"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Wallet,
  Edit,
  Search,
  Download,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useUserStore, type User } from "@/lib/user-store"
import { useAutoSnipeStore } from "@/lib/autosnipe-store"
import PageLayout from "@/components/page-layout"
import Link from "next/link"

export default function AdminUsersPage() {
  const { users, updateUserBalance, toggleUserStatus, toggleVipStatus, deleteUser } = useUserStore()
  const { configs } = useAutoSnipeStore()

  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBalance, setEditingBalance] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize with current users
    setFilteredUsers(users)
    setLoading(false)
  }, [users])

  useEffect(() => {
    // Filter users based on search and status
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.walletType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.walletName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, statusFilter])

  const handleEditBalance = () => {
    if (!selectedUser || !editingBalance) return

    const newBalance = Number.parseFloat(editingBalance)
    if (isNaN(newBalance) || newBalance < 0) {
      toast({
        title: "Invalid Balance",
        description: "Please enter a valid balance amount",
        variant: "destructive",
      })
      return
    }

    updateUserBalance(selectedUser.id, newBalance)
    toast({
      title: "Balance Updated",
      description: `User balance updated to ${newBalance.toFixed(4)} SOL`,
    })
    setShowEditModal(false)
    setSelectedUser(null)
    setEditingBalance("")
  }

  const handleToggleStatus = (userId: string) => {
    toggleUserStatus(userId)
    const user = users.find((u) => u.id === userId)
    toast({
      title: "Status Updated",
      description: `User status changed to ${user?.status === "active" ? "suspended" : "active"}`,
    })
  }

  const handleToggleVip = (userId: string) => {
    toggleVipStatus(userId)
    const user = users.find((u) => u.id === userId)
    toast({
      title: "VIP Status Updated",
      description: `User ${user?.isVip ? "removed from" : "added to"} VIP`,
    })
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(userId)
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
  }

  const getActiveSnipesForUser = (walletAddress: string) => {
    return configs.filter((config) => config.walletAddress === walletAddress && config.isActive).length
  }

  const getTotalConfigsForUser = (walletAddress: string) => {
    return configs.filter((config) => config.walletAddress === walletAddress).length
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    bannedUsers: users.filter((u) => u.status === "banned").length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalTrades: users.reduce((sum, u) => sum + u.totalTrades, 0),
    vipUsers: users.filter((u) => u.isVip).length,
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
          <div className="flex items-center gap-2 mb-4">
            <Link href="/admin" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-400 mt-2">Manage user accounts, balances, and trading activity</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-[#1a1a2e] border-gray-700 hover:bg-[#252542]">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats.bannedUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBalance.toFixed(2)} SOL</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.vipUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1a1a2e] border-gray-800 mb-6">
          <CardHeader>
            <CardTitle>Filters & Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by wallet address, type, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#252542] border-gray-700"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252542] border border-gray-700 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 bg-[#252542] border border-gray-700 rounded-md text-sm"
                  onChange={(e) => {
                    if (e.target.value === "vip") {
                      setFilteredUsers(users.filter((u) => u.isVip))
                    } else if (e.target.value === "kyc-verified") {
                      setFilteredUsers(users.filter((u) => u.kycStatus === "verified"))
                    } else {
                      setFilteredUsers(users)
                    }
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="vip">VIP Only</option>
                  <option value="kyc-verified">KYC Verified</option>
                </select>
              </div>
              <div>
                <Button onClick={() => setFilteredUsers([...users])} className="w-full" variant="outline">
                  Refresh Users
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle>Connected Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Users who have successfully connected their wallets</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Users Found</h3>
                <p className="text-sm text-gray-500">
                  {users.length === 0
                    ? "No users have connected their wallets yet."
                    : "No users match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Balance</th>
                      <th className="text-left p-4">Trading</th>
                      <th className="text-left p-4">AutoSnipe</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        className="border-b border-gray-800 hover:bg-[#252542]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{formatAddress(user.walletAddress)}</p>
                              <p className="text-sm text-gray-400 capitalize">{user.walletName}</p>
                              <p className="text-xs text-gray-500">Joined: {formatDate(user.joinDate)}</p>
                            </div>
                            {user.isVip && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">VIP</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.balance.toFixed(4)} SOL</p>
                            <p className="text-sm text-gray-400">
                              P&L: {user.profitLoss > 0 ? "+" : ""}${user.profitLoss.toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.totalTrades} trades</p>
                            <p className="text-sm text-gray-400">Last: {formatDate(user.lastActive)}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{getTotalConfigsForUser(user.walletAddress)} configs</p>
                            <p className="text-sm text-gray-400">{getActiveSnipesForUser(user.walletAddress)} active</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "suspended"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setEditingBalance(user.balance.toString())
                                setShowEditModal(true)
                              }}
                              className="bg-[#1a1a2e] border-gray-700 hover:bg-[#252542]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(user.id)}
                              className={
                                user.status === "suspended"
                                  ? "border-green-500 text-green-400 bg-[#1a1a2e] hover:bg-green-500/10"
                                  : "border-red-500 text-red-400 bg-[#1a1a2e] hover:bg-red-500/10"
                              }
                            >
                              {user.status === "suspended" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleVip(user.id)}
                              className={
                                user.isVip
                                  ? "border-orange-500 text-orange-400 bg-[#1a1a2e] hover:bg-orange-500/10"
                                  : "border-gray-500 bg-[#1a1a2e] hover:bg-[#252542]"
                              }
                            >
                              VIP
                            </Button>
                            {user.status !== "banned" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to ban this user?")) {
                                    // Add ban functionality
                                    toast({
                                      title: "User Banned",
                                      description: "User has been banned from the platform",
                                    })
                                  }
                                }}
                                className="border-red-600 text-red-500 bg-[#1a1a2e] hover:bg-red-600/10"
                              >
                                Ban
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Add unban functionality
                                  toast({
                                    title: "User Unbanned",
                                    description: "User has been unbanned",
                                  })
                                }}
                                className="border-green-600 text-green-500 bg-[#1a1a2e] hover:bg-green-600/10"
                              >
                                Unban
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="border-red-500 text-red-400 bg-[#1a1a2e] hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Balance Modal */}
        {showEditModal && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-[#0e0e16] border border-gray-800 rounded-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">Edit User Balance</h2>
              <div className="space-y-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm text-gray-400">{formatAddress(selectedUser.walletAddress)}</p>
                  <p className="text-xs text-gray-500">{selectedUser.walletName}</p>
                </div>
                <div>
                  <Label>Current Balance</Label>
                  <p className="text-sm text-gray-400">{selectedUser.balance.toFixed(4)} SOL</p>
                </div>
                <div>
                  <Label htmlFor="new-balance">New Balance (SOL)</Label>
                  <Input
                    id="new-balance"
                    type="number"
                    step="0.0001"
                    value={editingBalance}
                    onChange={(e) => setEditingBalance(e.target.value)}
                    className="bg-[#1a1a2e] border-gray-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    setEditingBalance("")
                  }}
                  className="flex-1 bg-[#1a1a2e] border-gray-700 hover:bg-[#252542]"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditBalance} className="flex-1">
                  Update Balance
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}

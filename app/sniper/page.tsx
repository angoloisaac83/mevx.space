"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import PageTransition from "@/components/page-transition"
import { motion } from "framer-motion"

export default function SniperPage() {
  const router = useRouter()
  const { isConnected } = useWalletStore()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0e0e16] text-white p-8">
        <motion.h1
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Sniper
        </motion.h1>
        <motion.div
          className="bg-[#1a1a2e] border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.p
            className="text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome to the Sniper page. Here you can set up automated trading for new token launches.
          </motion.p>
          <motion.div className="mt-6 space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="bg-[#252542] border border-gray-800 rounded-lg p-4" variants={itemVariants}>
              <h3 className="font-medium mb-2">Token Address</h3>
              <motion.input
                type="text"
                placeholder="Enter token address to snipe"
                className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                whileFocus={{ scale: 1.02, borderColor: "#6366f1" }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div className="bg-[#252542] border border-gray-800 rounded-lg p-4" variants={itemVariants}>
              <h3 className="font-medium mb-2">Buy Amount</h3>
              <div className="flex gap-2">
                <motion.input
                  type="number"
                  placeholder="0.0"
                  className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                  whileFocus={{ scale: 1.02, borderColor: "#6366f1" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.select
                  className="bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <option>SOL</option>
                  <option>ETH</option>
                  <option>USDC</option>
                </motion.select>
              </div>
            </motion.div>

            <motion.div className="bg-[#252542] border border-gray-800 rounded-lg p-4" variants={itemVariants}>
              <h3 className="font-medium mb-2">Sniper Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Sell</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Take Profit</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stop Loss</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1]"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            <motion.button
              className="w-full bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-3 rounded-md text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Set Up Sniper
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/lib/wallet-store"
import PageTransition from "@/components/page-transition"
import { motion } from "framer-motion"

export default function DiscoverPage() {
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
          Discover
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
            Welcome to the Discover page. Here you can explore new tokens and trading opportunities.
          </motion.p>
          <motion.div
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-[#252542] border border-gray-800 rounded-lg p-4"
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium mb-2">Featured Token #{i}</h3>
                <p className="text-sm text-gray-400">
                  Explore this trending token with high trading volume and potential.
                </p>
                <motion.button
                  className="mt-4 bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

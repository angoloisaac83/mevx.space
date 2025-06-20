"use client"

import PageTemplate from "@/components/page-template"
import { Zap, Settings, Clock, AlertTriangle } from "lucide-react"

export default function SnipeRaydiumPage() {
  return (
    <PageTemplate title="Snipe Raydium">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-[#2F80ED]" />
        <p className="text-gray-300">
          Set up automated trading bots to snipe new token launches on Raydium. Be the first to buy tokens as soon as
          liquidity is added.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-4">Token Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Token Address</label>
              <input
                type="text"
                placeholder="Enter token address to snipe"
                className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Pair With</label>
              <select className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]">
                <option>SOL</option>
                <option>USDC</option>
                <option>USDT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-4">Buy Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount to Spend</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0.0"
                  className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
                />
                <select className="bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]">
                  <option>SOL</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Slippage</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue="10"
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-[#2F80ED]" />
          <h3 className="font-medium">Advanced Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Gas Price (Priority Fee)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                defaultValue="20"
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Transaction Deadline</label>
            <select className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]">
              <option>30 seconds</option>
              <option>1 minute</option>
              <option>5 minutes</option>
              <option>10 minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Auto Sell</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F80ED]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Anti-Rug Pull</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F80ED]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-[#2F80ED]" />
          <h3 className="font-medium">Timing Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Snipe Mode</label>
            <select className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]">
              <option>Instant (As soon as liquidity is added)</option>
              <option>Scheduled (At specific time)</option>
              <option>Manual (Trigger manually)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Wait Time</label>
            <select className="w-full bg-[#1a1a2e] border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F80ED]">
              <option>1 hour</option>
              <option>6 hours</option>
              <option>12 hours</option>
              <option>24 hours</option>
              <option>No limit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Risk Warning</h4>
            <p className="text-xs text-gray-300">
              Sniping tokens at launch carries significant risk. New tokens may have hidden mechanisms like honeypots,
              high taxes, or other malicious features. Only use funds you can afford to lose.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-6 py-3 rounded-md text-sm font-medium">
          Set Up Sniper Bot
        </button>
      </div>
    </PageTemplate>
  )
}

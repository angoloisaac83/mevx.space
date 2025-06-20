"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Zap, Settings, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface TradingWidgetProps {
  className?: string
}

export default function TradingWidget({ className = "" }: TradingWidgetProps) {
  const [buyAmount, setBuyAmount] = useState("")
  const [sellPercentage, setSellPercentage] = useState(25)
  const [selectedToken, setSelectedToken] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [autoSlippage, setAutoSlippage] = useState(true)

  const handleQuickBuy = () => {
    if (!buyAmount || !selectedToken) {
      toast.error("Please enter amount and select token")
      return
    }
    toast.success(`Buy order placed for ${buyAmount} SOL worth of ${selectedToken}`)
  }

  const handleQuickSell = (percentage: number) => {
    setSellPercentage(percentage)
    toast.success(`Sell order placed for ${percentage}% of ${selectedToken}`)
  }

  const presetAmounts = [0.1, 0.5, 1, 2, 5]
  const sellPercentages = [25, 50, 75, 100]

  return (
    <Card className={`bg-[#1a1a1e] border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Quick Trade
        </CardTitle>
        <CardDescription>Execute trades instantly</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#252530]">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div>
              <Label htmlFor="token-input">Token Address or Symbol</Label>
              <Input
                id="token-input"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                placeholder="Enter token address or symbol"
                className="bg-[#252530] border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="buy-amount">Amount (SOL)</Label>
              <Input
                id="buy-amount"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.0"
                className="bg-[#252530] border-gray-700"
              />
              <div className="flex gap-2 mt-2">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBuyAmount(amount.toString())}
                    className="text-xs"
                  >
                    {amount} SOL
                  </Button>
                ))}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleQuickBuy}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy Token
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div>
              <Label htmlFor="sell-token">Select Token to Sell</Label>
              <select
                className="w-full p-2 bg-[#252530] border border-gray-700 rounded-md text-white"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="">Select token</option>
                <option value="BONK">BONK (1,000,000 tokens)</option>
                <option value="WIF">WIF (45.2 tokens)</option>
                <option value="PEPE">PEPE (2,500,000 tokens)</option>
              </select>
            </div>

            <div>
              <Label>Sell Percentage</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {sellPercentages.map((percentage) => (
                  <Button
                    key={percentage}
                    variant={sellPercentage === percentage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickSell(percentage)}
                    className="text-xs"
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleQuickSell(sellPercentage)}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell {sellPercentage}%
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Trading Settings */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm">Trading Settings</Label>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto Slippage</Label>
              <Switch checked={autoSlippage} onCheckedChange={setAutoSlippage} />
            </div>

            {!autoSlippage && (
              <div>
                <Label className="text-xs">Slippage Tolerance (%)</Label>
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(Number(e.target.value))}
                  className="bg-[#252530] border-gray-700 text-xs"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
              </div>
            )}

            <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-yellow-400 font-medium">Risk Warning</p>
                <p className="text-xs text-gray-300">
                  Trading involves significant risk. Only trade with funds you can afford to lose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface PortfolioChartProps {
  className?: string
}

const mockChartData = {
  portfolio: [
    { name: "SOL", value: 2847.32, percentage: 91.1, change: 5.2 },
    { name: "BONK", value: 156.78, percentage: 5.0, change: -2.1 },
    { name: "WIF", value: 120.77, percentage: 3.9, change: 12.5 },
  ],
  performance: {
    "1D": { value: 156.78, change: 5.02 },
    "1W": { value: 423.45, change: 13.56 },
    "1M": { value: 1247.89, change: 39.87 },
    "3M": { value: 2847.32, change: 91.23 },
  },
}

export default function PortfolioChart({ className = "" }: PortfolioChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1D")
  const [chartType, setChartType] = useState("portfolio")

  const periods = ["1D", "1W", "1M", "3M"]

  return (
    <Card className={`bg-[#1a1a1e] border-gray-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Portfolio Analytics
            </CardTitle>
            <CardDescription>Track your portfolio performance</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "portfolio" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("portfolio")}
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "performance" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("performance")}
            >
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={setChartType} className="space-y-4">
          <TabsContent value="portfolio" className="space-y-4">
            <div className="text-center py-8">
              <div className="relative w-48 h-48 mx-auto mb-4">
                {/* Simplified pie chart representation */}
                <div className="w-full h-full rounded-full border-8 border-gray-700 relative overflow-hidden">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #9945FF 0deg ${mockChartData.portfolio[0].percentage * 3.6}deg,
                        #43B4CA ${mockChartData.portfolio[0].percentage * 3.6}deg ${(mockChartData.portfolio[0].percentage + mockChartData.portfolio[1].percentage) * 3.6}deg,
                        #19FB9B ${(mockChartData.portfolio[0].percentage + mockChartData.portfolio[1].percentage) * 3.6}deg 360deg
                      )`,
                    }}
                  />
                  <div className="absolute inset-4 bg-[#1a1a1e] rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold">$3,124</p>
                      <p className="text-xs text-gray-400">Total Value</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {mockChartData.portfolio.map((asset, index) => (
                  <div key={asset.name} className="flex items-center justify-between p-3 bg-[#252530] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: index === 0 ? "#9945FF" : index === 1 ? "#43B4CA" : "#19FB9B",
                        }}
                      />
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${asset.value.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{asset.percentage}%</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={asset.change > 0 ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}
                    >
                      {asset.change > 0 ? "+" : ""}
                      {asset.change}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>

            <div className="text-center py-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  +${mockChartData.performance[selectedPeriod].value.toFixed(2)}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />+{mockChartData.performance[selectedPeriod].change}%
                  </Badge>
                  <span className="text-sm text-gray-400">{selectedPeriod} Performance</span>
                </div>
              </div>

              {/* Simplified chart representation */}
              <div className="h-32 bg-[#252530] rounded-lg flex items-end justify-center p-4 mb-4">
                <div className="flex items-end gap-2 h-full">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-[#9945FF] to-[#43B4CA] rounded-t"
                      style={{
                        width: "8px",
                        height: `${Math.random() * 80 + 20}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252530] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Best Day</p>
                  <p className="font-bold text-green-400">+$89.32</p>
                </div>
                <div className="bg-[#252530] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Worst Day</p>
                  <p className="font-bold text-red-400">-$23.45</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Alert {
  id: number
  type: "price" | "trade" | "portfolio"
  token?: string
  condition?: "above" | "below"
  value?: number
  message: string
  enabled: boolean
  triggered: boolean
  createdAt: string
}

interface AlertsPanelProps {
  className?: string
}

const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "price",
    token: "SOL",
    condition: "above",
    value: 250,
    message: "SOL price above $250",
    enabled: true,
    triggered: false,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    type: "trade",
    message: "Bot executed successful trade",
    enabled: true,
    triggered: true,
    createdAt: "2024-01-15",
  },
  {
    id: 3,
    type: "portfolio",
    message: "Portfolio value increased by 10%",
    enabled: false,
    triggered: false,
    createdAt: "2024-01-14",
  },
]

export default function AlertsPanel({ className = "" }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    type: "price" as const,
    token: "",
    condition: "above" as const,
    value: "",
    message: "",
  })

  const toggleAlert = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)))
    toast.success("Alert updated")
  }

  const deleteAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    toast.success("Alert deleted")
  }

  const createAlert = () => {
    if (!newAlert.token || !newAlert.value) {
      toast.error("Please fill in all required fields")
      return
    }

    const alert: Alert = {
      id: Date.now(),
      type: newAlert.type,
      token: newAlert.token,
      condition: newAlert.condition,
      value: Number(newAlert.value),
      message: newAlert.message || `${newAlert.token} ${newAlert.condition} $${newAlert.value}`,
      enabled: true,
      triggered: false,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setAlerts((prev) => [alert, ...prev])
    setNewAlert({ type: "price", token: "", condition: "above", value: "", message: "" })
    setShowCreateForm(false)
    toast.success("Alert created successfully")
  }

  const getAlertIcon = (alert: Alert) => {
    switch (alert.type) {
      case "price":
        return alert.condition === "above" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
      case "trade":
        return <Zap className="h-4 w-4" />
      case "portfolio":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (alert: Alert) => {
    if (alert.triggered) return "text-green-400"
    if (!alert.enabled) return "text-gray-400"
    return "text-blue-400"
  }

  return (
    <Card className={`bg-[#1a1a1e] border-gray-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>Manage your trading alerts</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-[#252530] rounded-lg space-y-4"
            >
              <h4 className="font-medium">Create New Alert</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-type">Alert Type</Label>
                  <select
                    id="alert-type"
                    className="w-full p-2 bg-[#1a1a1e] border border-gray-700 rounded-md text-white"
                    value={newAlert.type}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="price">Price Alert</option>
                    <option value="trade">Trade Alert</option>
                    <option value="portfolio">Portfolio Alert</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="alert-token">Token</Label>
                  <Input
                    id="alert-token"
                    value={newAlert.token}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, token: e.target.value }))}
                    placeholder="SOL, BONK, etc."
                    className="bg-[#1a1a1e] border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="alert-condition">Condition</Label>
                  <select
                    id="alert-condition"
                    className="w-full p-2 bg-[#1a1a1e] border border-gray-700 rounded-md text-white"
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, condition: e.target.value as any }))}
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="alert-value">Price ($)</Label>
                  <Input
                    id="alert-value"
                    type="number"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="0.00"
                    className="bg-[#1a1a1e] border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alert-message">Custom Message (Optional)</Label>
                <Input
                  id="alert-message"
                  value={newAlert.message}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Custom alert message"
                  className="bg-[#1a1a1e] border-gray-700"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createAlert} size="sm">
                  Create Alert
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts configured</p>
              <p className="text-sm">Create your first alert to get started</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-[#252530] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={getAlertColor(alert)}>{getAlertIcon(alert)}</div>
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                      {alert.triggered && (
                        <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                          Triggered
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{alert.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{alerts.filter((a) => a.enabled).length} active alerts</span>
              <span className="text-gray-400">{alerts.filter((a) => a.triggered).length} triggered today</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

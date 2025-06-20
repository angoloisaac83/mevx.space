"use client"

import { useState } from "react"
import PageTemplate from "@/components/page-template"
import { Star, Trash2, Bell, BellOff, ExternalLink } from "lucide-react"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([
    { id: 1, name: "SOLANA", symbol: "SOL", price: "$150.42", change: "+5.2%", alerts: true },
    { id: 2, name: "BITCOIN", symbol: "BTC", price: "$62,345.78", change: "+2.1%", alerts: false },
    { id: 3, name: "ETHEREUM", symbol: "ETH", price: "$3,421.56", change: "-1.3%", alerts: true },
    { id: 4, name: "MEME COIN", symbol: "MEME", price: "$0.00042", change: "+120.5%", alerts: false },
  ])

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  const toggleAlerts = (id) => {
    setFavorites(favorites.map((fav) => (fav.id === id ? { ...fav, alerts: !fav.alerts } : fav)))
  }

  return (
    <PageTemplate title="Favorites">
      <p className="text-gray-300 mb-6">
        Manage your favorite tokens and set up price alerts. Track your watchlist and never miss a trading opportunity.
      </p>

      {favorites.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-[#252542] border border-gray-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-3 bg-[#1a1a2e] text-sm font-medium text-gray-400">
              <div>Token</div>
              <div className="text-right">Price</div>
              <div className="text-right">24h Change</div>
              <div className="text-center">Alerts</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-800">
              {favorites.map((fav) => (
                <div key={fav.id} className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-[#252542]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="font-medium">{fav.symbol}</div>
                      <div className="text-xs text-gray-400">{fav.name}</div>
                    </div>
                  </div>

                  <div className="text-right font-medium">{fav.price}</div>

                  <div
                    className={`text-right font-medium ${fav.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                  >
                    {fav.change}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleAlerts(fav.id)}
                      className={`p-2 rounded-full ${fav.alerts ? "bg-[#2F80ED]/20 text-[#2F80ED]" : "bg-gray-800 text-gray-400"}`}
                    >
                      {fav.alerts ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-2 rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4">Price Alerts</h3>
            <p className="text-sm text-gray-300 mb-4">
              Set up custom price alerts for your favorite tokens. You'll receive notifications when prices reach your
              specified targets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a1a2e] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <span className="font-medium">SOL</span>
                  </div>
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Alert when price is above:</span>
                  <span className="font-medium">$200</span>
                </div>
              </div>

              <div className="bg-[#1a1a2e] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <span className="font-medium">ETH</span>
                  </div>
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Alert when price is below:</span>
                  <span className="font-medium">$3,000</span>
                </div>
              </div>
            </div>

            <button className="mt-4 bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-4 py-2 rounded-md text-sm font-medium">
              Add New Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-6 text-center">
          <Star className="h-12 w-12 text-[#2F80ED] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Favorites Yet</h3>
          <p className="text-sm text-gray-300 mb-4">
            You haven't added any tokens to your favorites list yet. Browse tokens and click the star icon to add them
            here.
          </p>
          <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-4 py-2 rounded-md text-sm font-medium">
            Browse Tokens
          </button>
        </div>
      )}
    </PageTemplate>
  )
}

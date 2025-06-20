"use client"

import PageTemplate from "@/components/page-template"
import { Gift, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function AirdropPage() {
  return (
    <PageTemplate title="Airdrop">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="h-6 w-6 text-[#2F80ED]" />
        <p className="text-gray-300">
          Participate in token airdrops and claim free tokens. Complete tasks to increase your chances of receiving
          airdrops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-4">Active Airdrops</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="font-medium">Project #{i}</div>
                      <div className="text-xs text-gray-400">Estimated value: $100-$500</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Clock className="h-3 w-3" />
                    <span>2d left</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    <span className="text-green-400">3/5</span> tasks completed
                  </div>
                  <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                    Participate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-4">Upcoming Airdrops</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a2e] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="font-medium">Upcoming #{i}</div>
                      <div className="text-xs text-gray-400">Estimated value: $50-$300</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <Clock className="h-3 w-3" />
                    <span>Starts in {i}d</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">Registration opens soon</div>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                    Remind Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-4">Your Airdrop History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Project</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-[#1a1a2e]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <span>Project Alpha</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">May 5, 2025</td>
                <td className="px-4 py-3 text-sm">1,000 ALPHA</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Claimed</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                    View
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-[#1a1a2e]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <span>Project Beta</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">May 1, 2025</td>
                <td className="px-4 py-3 text-sm">500 BETA</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Pending</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-1 rounded-md text-xs font-medium">
                    Claim
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">Boost Your Airdrop Chances</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Complete Your Profile</h4>
            <p className="text-xs text-gray-300 mb-3">
              Fill out your profile information to increase your eligibility for airdrops.
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div className="bg-[#2F80ED] h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">60% complete</span>
              <button className="text-[#2F80ED] hover:underline">Complete</button>
            </div>
          </div>

          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Connect Social Media</h4>
            <p className="text-xs text-gray-300 mb-3">Link your social media accounts to qualify for more airdrops.</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div className="bg-[#2F80ED] h-2 rounded-full" style={{ width: "30%" }}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">30% complete</span>
              <button className="text-[#2F80ED] hover:underline">Connect</button>
            </div>
          </div>

          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Refer Friends</h4>
            <p className="text-xs text-gray-300 mb-3">Invite friends to MEVX and earn bonus points for airdrops.</p>
            <button className="w-full bg-[#2F80ED] hover:bg-[#2D74D6] text-white px-3 py-2 rounded-md text-xs font-medium">
              Get Referral Link
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

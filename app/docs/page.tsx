"use client"

import PageTemplate from "@/components/page-template"
import { Book, Code, FileText } from "lucide-react"

export default function DocsPage() {
  return (
    <PageTemplate title="Documentation" requiresWallet={false}>
      <div className="flex items-center gap-2 mb-6">
        <Book className="h-6 w-6 text-[#2F80ED]" />
        <p className="text-gray-300">
          Welcome to the MEVX documentation. Here you'll find guides, tutorials, and API references to help you get the
          most out of our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[#2F80ED]" />
            <h3 className="font-medium">Getting Started</h3>
          </div>
          <div className="space-y-2">
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Introduction to MEVX
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Creating an Account
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Connecting Your Wallet
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Making Your First Trade
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Understanding Fees
            </a>
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-[#2F80ED]" />
            <h3 className="font-medium">API Reference</h3>
          </div>
          <div className="space-y-2">
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Authentication
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Market Data
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Trading
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Account Management
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Webhooks
            </a>
          </div>
        </div>

        <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-5 w-5 text-[#2F80ED]" />
            <h3 className="font-medium">Tutorials</h3>
          </div>
          <div className="space-y-2">
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Setting Up Sniper Bots
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Advanced Trading Strategies
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Using the Multi-Chart Feature
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Wallet Tracking Guide
            </a>
            <a href="#" className="block p-2 hover:bg-[#1a1a2e] rounded-md text-sm">
              Maximizing Airdrop Chances
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">How do I connect my wallet?</h4>
            <p className="text-sm text-gray-400">
              Click on the "Connect Wallet" button in the top right corner of the page. Select your wallet provider from
              the list and follow the prompts to connect.
            </p>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">What fees does MEVX charge?</h4>
            <p className="text-sm text-gray-400">
              MEVX charges a small fee on each transaction. The exact fee depends on the network and transaction type.
              You can find more details in our fee schedule.
            </p>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Is MEVX available in my country?</h4>
            <p className="text-sm text-gray-400">
              MEVX is available globally, but certain features may be restricted in some jurisdictions due to regulatory
              requirements.
            </p>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">How do I report a bug or issue?</h4>
            <p className="text-sm text-gray-400">
              You can report bugs or issues through our support portal or by emailing support@mevx.io. Please include as
              much detail as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#252542] border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-4">Community Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-lg hover:bg-[#1a1a3e] transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2F80ED] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-sm">Twitter</h4>
              <p className="text-xs text-gray-400">Follow us for updates and announcements</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-lg hover:bg-[#1a1a3e] transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#7289DA] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-sm">Discord</h4>
              <p className="text-xs text-gray-400">Join our community for support and discussion</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-lg hover:bg-[#1a1a3e] transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                <path d="M9 18c-4.51 2-5-2-7-2"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-sm">GitHub</h4>
              <p className="text-xs text-gray-400">Explore our open-source projects</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-lg hover:bg-[#1a1a3e] transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-sm">Reddit</h4>
              <p className="text-xs text-gray-400">Join our subreddit for discussions</p>
            </div>
          </a>
        </div>
      </div>
    </PageTemplate>
  )
}

import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MEVX | Trending Crypto Tools",
  description:
    "MEVX provides advanced trading tools for Solana and other blockchains. Sniping, tracking, trending tokens – all in one place.",
  keywords: "MEVX, crypto trading, Solana tools, token sniping, memecoins, degens, blockchain trading",
  metadataBase: new URL("https://mevx.space"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "MEVX | Trending Crypto Tools",
    description:
      "MEVX provides advanced trading tools for Solana and other blockchains. Sniping, tracking, trending tokens – all in one place.",
    url: "https://mevx.space",
    siteName: "MEVX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/mevx-og-image.png",
        width: 1200,
        height: 630,
        alt: "MEVX - Advanced Crypto Trading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MEVX | Trending Crypto Tools",
    description:
      "MEVX provides advanced trading tools for Solana and other blockchains. Sniping, tracking, trending tokens – all in one place.",
    images: ["/mevx-twitter-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  applicationName: "MEVX",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Script id="structured-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "MEVX",
              "url": "https://mevx.space",
              "description": "MEVX provides advanced trading tools for Solana and other blockchains. Sniping, tracking, trending tokens – all in one place.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          `}
        </Script>
      </body>
    </html>
  )
}

import { NextResponse } from "next/server"

// Mock token data in the format provided
const mockTokenData = [
  {
    profile: {
      url: "https://dexscreener.com/solana/akjt8m7whpb8obzyqmcqtmkqnheoypgro4jrieaopump",
      chainId: "solana",
      tokenAddress: "AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump",
      icon: "https://dd.dexscreener.com/ds-data/tokens/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump.png",
      header:
        "https://dd.dexscreener.com/ds-data/tokens/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump/header.png",
      openGraph:
        "https://cdn.dexscreener.com/token-images/og/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump?timestamp=1746771600000",
      description:
        "Built for the broke, powered by hope. It's the coin for everyone still dreaming of owning a place with working elevators.",
      links: [
        {
          label: "Website",
          url: "https://apartcoin.art/",
        },
        {
          type: "twitter",
          url: "https://x.com/apart_coin",
        },
        {
          type: "telegram",
          url: "https://t.me/apart_coin",
        },
      ],
    },
    pairData: {
      chainId: "solana",
      dexId: "pumpswap",
      url: "https://dexscreener.com/solana/dqseqvcytpnksabd4u7xd7y2poohlazgagiu7vgqwtnv",
      pairAddress: "DQseqVCYtpNKSABd4u7xd7Y2poohLazGAgiu7VGqWTNV",
      baseToken: {
        address: "AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump",
        name: "APART COIN",
        symbol: "APARTCOIN",
      },
      quoteToken: {
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        symbol: "SOL",
      },
      priceNative: "0.00000002610",
      priceUsd: "0.000004258",
      txns: {
        m5: {
          buys: 0,
          sells: 1,
        },
        h1: {
          buys: 10,
          sells: 9,
        },
        h6: {
          buys: 14065,
          sells: 9648,
        },
        h24: {
          buys: 14065,
          sells: 9648,
        },
      },
      volume: {
        h24: 1280429.07,
        h6: 1280429.07,
        h1: 289.13,
        m5: 2.47,
      },
      priceChange: {
        m5: -0.23,
        h1: -2.76,
        h6: -94.61,
        h24: -94.61,
      },
      liquidity: {
        usd: 7430.5,
        base: 871638480,
        quote: 22.7929,
      },
      fdv: 4258,
      marketCap: 4258,
      pairCreatedAt: 1746760413000,
      info: {
        imageUrl:
          "https://dd.dexscreener.com/ds-data/tokens/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump.png?key=dbce96",
        header:
          "https://dd.dexscreener.com/ds-data/tokens/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump/header.png?key=dbce96",
        openGraph:
          "https://cdn.dexscreener.com/token-images/og/solana/AKJT8M7WHpb8oBzYqMCQTmkQnHeoYPgRo4JRiEAopump?timestamp=1746771600000",
        websites: [
          {
            label: "Website",
            url: "https://apartcoin.art/",
          },
        ],
        socials: [
          {
            type: "twitter",
            url: "https://x.com/apart_coin",
          },
          {
            type: "telegram",
            url: "https://t.me/apart_coin",
          },
        ],
      },
      boosts: {
        active: 50,
      },
    },
  },
]

// Generate more mock tokens based on the template
const generateMockTokens = (count: number) => {
  const tokens = [...mockTokenData]

  for (let i = 1; i < count; i++) {
    const randomPrice = Math.random() * 0.1
    const randomPriceChange = Math.random() * 200 - 100 // -100% to +100%
    const randomLiquidity = Math.random() * 100000 + 1000
    const randomVolume = Math.random() * 2000000 + 10000

    const token = JSON.parse(JSON.stringify(mockTokenData[0])) // Deep clone

    // Modify token data to make it unique
    token.profile.tokenAddress = `SOL${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    token.pairData.baseToken.name = `Token ${i}`
    token.pairData.baseToken.symbol = `TKN${i}`
    token.pairData.priceUsd = randomPrice.toFixed(8)
    token.pairData.priceChange.h24 = randomPriceChange
    token.pairData.liquidity.usd = randomLiquidity
    token.pairData.volume.h24 = randomVolume
    token.pairData.pairCreatedAt = Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 // Random date in the last 30 days

    tokens.push(token)
  }

  return tokens
}

export async function GET() {
  try {
    // Generate 20 mock tokens
    const mockTokens = generateMockTokens(20)

    return NextResponse.json({ data: mockTokens }, { status: 200 })
  } catch (error) {
    console.error("Error generating mock token data:", error)
    return NextResponse.json({ error: "Failed to generate mock token data" }, { status: 500 })
  }
}

"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { mockTokens } from "@/lib/mock-data"

interface BondingCurveChartProps {
  token: (typeof mockTokens)[0]
}

export default function BondingCurveChart({ token }: BondingCurveChartProps) {
  // Generate bonding curve data
  const generateCurveData = () => {
    const data = []
    const maxSupply = token.maxSupply
    const startPrice = token.startPrice

    for (let i = 0; i <= 100; i += 5) {
      const supply = (maxSupply * i) / 100
      // Simple bonding curve: price increases with supply
      const price = startPrice * Math.pow(1 + i / 100, 2)
      const marketCap = supply * price

      data.push({
        supply: (supply / 1000000).toFixed(1),
        price: price.toFixed(8),
        marketCap: (marketCap / 1000000).toFixed(2),
        percentage: i,
      })
    }

    return data
  }

  const data = generateCurveData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="supply" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
        <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(20, 20, 30, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
          formatter={(value) => `$${value}`}
          labelFormatter={(label) => `Supply: ${label}M`}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="url(#colorGradient)"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(153, 102, 255)" />
            <stop offset="95%" stopColor="rgb(255, 193, 7)" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  )
}

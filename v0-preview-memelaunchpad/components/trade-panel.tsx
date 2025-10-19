"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { mockTokens } from "@/lib/mock-data"

interface TradePanelProps {
  token: (typeof mockTokens)[0]
}

export default function TradePanel({ token }: TradePanelProps) {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [trustAmount, setTrustAmount] = useState("")

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value) {
      const trust = Number.parseFloat(value) * token.currentPrice
      setTrustAmount(trust.toFixed(6))
    } else {
      setTrustAmount("")
    }
  }

  const handleTrustChange = (value: string) => {
    setTrustAmount(value)
    if (value) {
      const tokens = Number.parseFloat(value) / token.currentPrice
      setAmount(tokens.toFixed(6))
    } else {
      setAmount("")
    }
  }

  return (
    <Card className="bg-card border-border p-6 sticky top-24">
      <h2 className="text-xl font-bold text-foreground mb-4">Trade</h2>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6 bg-muted/30 p-1 rounded-lg">
        <Button
          onClick={() => setMode("buy")}
          variant={mode === "buy" ? "default" : "ghost"}
          className={mode === "buy" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
        >
          Buy
        </Button>
        <Button
          onClick={() => setMode("sell")}
          variant={mode === "sell" ? "default" : "ghost"}
          className={mode === "sell" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}
        >
          Sell
        </Button>
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Amount ({token.symbol})</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-input border-border text-foreground"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Cost (TRUST)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={trustAmount}
            onChange={(e) => handleTrustChange(e.target.value)}
            className="bg-input border-border text-foreground"
          />
        </div>
      </div>

      {/* Price Info */}
      <div className="space-y-2 mb-6 p-4 bg-muted/20 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price per token</span>
          <span className="text-foreground font-semibold">${token.currentPrice.toFixed(8)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Slippage</span>
          <span className="text-foreground font-semibold">0.5%</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        className={`w-full font-semibold py-6 text-lg ${
          mode === "buy"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        }`}
      >
        {mode === "buy" ? "Buy " + token.symbol : "Sell " + token.symbol}
      </Button>

      {/* Info */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {mode === "buy" ? "Price increases as you buy" : "Price decreases as you sell"}
      </p>
    </Card>
  )
}

"use client"
import TokenCard from "@/components/token-card"
import type { mockTokens } from "@/lib/mock-data"

interface TokenGridProps {
  tokens: typeof mockTokens
  onSelectToken: (token: (typeof mockTokens)[0]) => void
}

export default function TokenGrid({ tokens, onSelectToken }: TokenGridProps) {
  const alphaTokens = tokens.filter((t) => t.isAlpha)
  const regularTokens = tokens.filter((t) => !t.isAlpha)

  return (
    <div className="space-y-12">
      {/* Alpha Section */}
      {alphaTokens.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">✨ Alpha</h2>
            <p className="text-muted-foreground">Trending tokens close to Dex migration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alphaTokens.map((token) => (
              <div key={token.id} className="alpha-glow rounded-xl">
                <TokenCard token={token} onClick={() => onSelectToken(token)} isAlpha />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regular Tokens Section */}
      {regularTokens.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">All Tokens</h2>
            <p className="text-muted-foreground">Discover new meme tokens</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTokens.map((token) => (
              <TokenCard key={token.id} token={token} onClick={() => onSelectToken(token)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

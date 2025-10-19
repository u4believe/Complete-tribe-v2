"use client"

import { useState } from "react"
import Header from "@/components/header"
import CreateTokenModal from "@/components/create-token-modal"
import TokenGrid from "@/components/token-grid"
import BondingCurveView from "@/components/bonding-curve-view"
import { mockTokens } from "@/lib/mock-data"

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<(typeof mockTokens)[0] | null>(null)
  const [tokens, setTokens] = useState(mockTokens)

  const handleCreateToken = (newToken: (typeof mockTokens)[0]) => {
    setTokens([newToken, ...tokens])
    setShowCreateModal(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header onCreateClick={() => setShowCreateModal(true)} />

      {selectedToken ? (
        <BondingCurveView token={selectedToken} onBack={() => setSelectedToken(null)} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <TokenGrid tokens={tokens} onSelectToken={setSelectedToken} />
        </div>
      )}

      {showCreateModal && <CreateTokenModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateToken} />}
    </main>
  )
}

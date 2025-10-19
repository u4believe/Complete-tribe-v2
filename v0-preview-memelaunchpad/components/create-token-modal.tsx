"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import type { mockTokens } from "@/lib/mock-data"

interface CreateTokenModalProps {
  onClose: () => void
  onCreate: (token: (typeof mockTokens)[0]) => void
}

export default function CreateTokenModal({ onClose, onCreate }: CreateTokenModalProps) {
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    maxSupply: "1000000",
    image: "/meme-token.jpg",
    intuitionLink: "",
  })

  const supplyOptions = [
    { value: "1000000", label: "1 Million", startPrice: 0.000001 },
    { value: "10000000", label: "10 Million", startPrice: 0.0000001 },
    { value: "100000000", label: "100 Million", startPrice: 0.00000001 },
    { value: "1000000000", label: "1 Billion", startPrice: 0.000000001 },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSupplyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, maxSupply: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreate = () => {
    const selectedSupply = supplyOptions.find((s) => s.value === formData.maxSupply)

    const newToken: (typeof mockTokens)[0] = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      symbol: formData.symbol,
      image: formData.image,
      currentPrice: selectedSupply?.startPrice || 0.000001,
      startPrice: selectedSupply?.startPrice || 0.000001,
      marketCap: 0,
      maxSupply: Number.parseInt(formData.maxSupply),
      creatorSupplyPercent: 25,
      holders: 1,
      creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
      intuitionLink: formData.intuitionLink,
      isAlpha: false,
    }

    onCreate(newToken)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-card border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-foreground">Create Meme Token</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted/30"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Token Name</label>
                <Input
                  name="name"
                  placeholder="e.g., Doge Moon"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Token Symbol</label>
                <Input
                  name="symbol"
                  placeholder="e.g., DMOON"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Token Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  {formData.image && formData.image.startsWith("data:") ? (
                    <div className="space-y-2">
                      <div className="relative w-20 h-20 mx-auto">
                        <Image
                          src={formData.image || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <p className="text-sm text-primary font-medium">Image uploaded</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Max Supply & Pricing</h3>

              <div>
                <label className="text-sm text-muted-foreground mb-3 block">Select Max Supply</label>
                <div className="grid grid-cols-2 gap-3">
                  {supplyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSupplyChange(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.maxSupply === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">Start: ${option.startPrice.toFixed(9)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Cost to Create:</p>
                <p className="text-2xl font-bold text-accent">10 TRUST</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Intuition Graph Link</h3>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Intuition Portal Link</label>
                <Input
                  name="intuitionLink"
                  placeholder="https://intuition.systems/..."
                  value={formData.intuitionLink}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This link will be displayed on your token's bonding curve page and token card
                </p>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">Review Your Token:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Name: <span className="text-foreground font-semibold">{formData.name}</span>
                  </p>
                  <p>
                    Symbol: <span className="text-foreground font-semibold">${formData.symbol}</span>
                  </p>
                  <p>
                    Max Supply:{" "}
                    <span className="text-foreground font-semibold">
                      {supplyOptions.find((s) => s.value === formData.maxSupply)?.label}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                Create Token (10 TRUST)
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

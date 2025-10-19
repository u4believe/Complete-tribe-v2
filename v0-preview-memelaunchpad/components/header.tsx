"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { Menu, LogOut, Settings, Wallet } from "lucide-react"

interface HeaderProps {
  onCreateClick: () => void
}

export default function Header({ onCreateClick }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative w-56 h-20">
            <Image src="/tribe-logo.png" alt="TRIBE Logo" fill className="object-contain" priority />
          </div>
          <div className="hidden lg:block h-10 w-px bg-border" />
          <p className="hidden lg:block text-sm text-muted-foreground font-medium">Bonding Curve Launchpad</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="font-semibold text-foreground">1,250 TRUST</span>
          </div>
          <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Token
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="border-border hover:bg-muted/50"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/30">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-mono text-foreground">0x742d...f42bE</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                  <Wallet className="w-4 h-4" />
                  Portfolio
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-muted/50 flex items-center gap-2 transition-colors border-t border-border">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

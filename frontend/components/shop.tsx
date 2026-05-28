"use client"

import { useState } from "react"
import { Lock, Sparkles, Check, X, Crown, Palette, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"

interface Skin {
  id: string
  name: string
  description: string
  price: string
  type: "board" | "chip"
  preview: string
  colors: string[]
  locked: boolean
}

const skins: Skin[] = [
  {
    id: "cyberpunk-glow",
    name: "Cyberpunk Glow",
    description: "Neon-infused board with electric vibes",
    price: "$1.99",
    type: "board",
    preview: "🌃",
    colors: ["#a855f7", "#22d3ee", "#1a1a2e"],
    locked: true,
  },
  {
    id: "golden-royalty",
    name: "Golden Royalty",
    description: "Luxurious gold and marble finish",
    price: "$2.99",
    type: "board",
    preview: "👑",
    colors: ["#fbbf24", "#f59e0b", "#1f1f1f"],
    locked: true,
  },
  {
    id: "retro-arcade",
    name: "Retro Arcade",
    description: "Classic 80s arcade aesthetic",
    price: "$1.49",
    type: "board",
    preview: "🕹️",
    colors: ["#ef4444", "#3b82f6", "#000000"],
    locked: true,
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    description: "Deep sea bioluminescent theme",
    price: "$1.99",
    type: "board",
    preview: "🌊",
    colors: ["#06b6d4", "#0ea5e9", "#0c1222"],
    locked: true,
  },
  {
    id: "neon-chips",
    name: "Neon Pulse",
    description: "Glowing neon chip set",
    price: "$0.99",
    type: "chip",
    preview: "💎",
    colors: ["#a855f7", "#ec4899"],
    locked: true,
  },
  {
    id: "chrome-chips",
    name: "Chrome Elite",
    description: "Sleek metallic finish chips",
    price: "$1.49",
    type: "chip",
    preview: "⚪",
    colors: ["#94a3b8", "#64748b"],
    locked: true,
  },
  {
    id: "fire-ice-chips",
    name: "Fire & Ice",
    description: "Elemental contrast chip set",
    price: "$1.99",
    type: "chip",
    preview: "🔥",
    colors: ["#f97316", "#3b82f6"],
    locked: true,
  },
  {
    id: "galaxy-chips",
    name: "Galaxy Swirl",
    description: "Cosmic nebula pattern chips",
    price: "$2.49",
    type: "chip",
    preview: "🌌",
    colors: ["#8b5cf6", "#ec4899"],
    locked: true,
  },
]

export function Shop() {
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [filter, setFilter] = useState<"all" | "board" | "chip">("all")

  const filteredSkins = filter === "all" ? skins : skins.filter((s) => s.type === filter)

  const handleBuy = (skin: Skin) => {
    setSelectedSkin(skin)
    setShowModal(true)
    setPurchaseSuccess(false)
  }

  const confirmPurchase = () => {
    setPurchaseSuccess(true)
    setTimeout(() => {
      setShowModal(false)
      setPurchaseSuccess(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen p-4 pt-4 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Pro Shop</h1>
            <p className="text-sm text-muted-foreground">Customize your game with premium skins</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "All Skins", icon: Sparkles },
            { id: "board", label: "Boards", icon: Palette },
            { id: "chip", label: "Chips", icon: CircleDot },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                filter === item.id
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pro Banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border-2 border-primary/50 bg-card p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                PRO MEMBERSHIP
              </span>
            </div>
            <h2 className="mb-1 text-xl font-bold text-foreground lg:text-2xl">Unlock All Skins</h2>
            <p className="text-sm text-muted-foreground">
              Get unlimited access to all current and future skins with Pro membership
            </p>
          </div>
          <button className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
            Upgrade to Pro — $4.99/mo
          </button>
        </div>
      </div>

      {/* Skins Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSkins.map((skin) => (
          <div
            key={skin.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          >
            {/* Preview Area */}
            <div className="relative flex h-40 items-center justify-center bg-secondary/50">
              {/* Color preview */}
              <div className="absolute inset-0 flex">
                {skin.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 opacity-30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Icon */}
              <span className="relative z-10 text-6xl">{skin.preview}</span>
              
              {/* Lock overlay */}
              {skin.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              {/* Type badge */}
              <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-xs font-medium capitalize text-foreground backdrop-blur-sm">
                {skin.type}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="mb-1 font-semibold text-foreground">{skin.name}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{skin.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{skin.price}</span>
                <button
                  onClick={() => handleBuy(skin)}
                  className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/30"
                >
                  <Sparkles className="h-4 w-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showModal && selectedSkin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {purchaseSuccess ? (
              <div className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                  <Check className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">Purchase Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSkin.name} has been added to your collection.
                </p>
              </div>
            ) : (
              <>
                {/* Preview */}
                <div className="relative flex h-48 items-center justify-center bg-secondary">
                  <div className="absolute inset-0 flex">
                    {selectedSkin.colors.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 opacity-30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="relative z-10 text-7xl">{selectedSkin.preview}</span>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                      {selectedSkin.type}
                    </span>
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-foreground">{selectedSkin.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{selectedSkin.description}</p>

                  <div className="mb-6 flex items-center justify-between rounded-lg bg-secondary p-4">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">{selectedSkin.price}</span>
                  </div>

                  <button
                    onClick={confirmPurchase}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                  >
                    Buy via Stripe
                  </button>
                  
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

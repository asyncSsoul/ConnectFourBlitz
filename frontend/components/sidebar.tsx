"use client"

import { useState } from "react"
import { Home, Gamepad2, ShoppingBag, Trophy, Settings, Zap, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { View } from "@/app/page"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: "dashboard" as const, label: "Home", icon: Home },
    { id: "game" as const, label: "Play", icon: Gamepad2 },
    { id: "shop" as const, label: "Pro Shop", icon: ShoppingBag },
  ]

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Zap className="h-6 w-6 animate-neon-pulse" />
          <div className="absolute inset-0 rounded-xl bg-primary/10 blur-md" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-foreground">Connect4</span>
          <span className="text-xs font-medium text-primary">BLITZ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id)
              setMobileOpen(false)
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              currentView === item.id
                ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Stats Card */}
      <div className="mx-3 mb-4 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Your Rank</p>
            <p className="text-xs text-muted-foreground">#247 Global</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">142</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">89</p>
            <p className="text-xs text-muted-foreground">Losses</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">61%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-border px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-bold text-foreground">Connect4 Blitz</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <NavContent />
      </aside>

      {/* Mobile spacing */}
      <div className="h-16 lg:hidden" />
    </>
  )
}

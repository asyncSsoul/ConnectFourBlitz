"use client"

import { useState } from "react"
import { Bot, Users, Monitor, Link2, Crown, Sparkles, Trophy, MapPin, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { View, Difficulty, GameMode } from "@/app/page"

interface DashboardProps {
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void
  onJoinGame: (gameId: string) => Promise<void>
  onViewChange: (view: View) => void
}

const leaderboardData = [
  { rank: 1, name: "NeonMaster", city: "Almaty", wins: 342, avatar: "🎮" },
  { rank: 2, name: "CyberQueen", city: "Astana", wins: 298, avatar: "👑" },
  { rank: 3, name: "PixelKing", city: "Tashkent", wins: 276, avatar: "🎯" },
  { rank: 4, name: "ByteStorm", city: "Almaty", wins: 254, avatar: "⚡" },
  { rank: 5, name: "GridLord", city: "Bishkek", wins: 231, avatar: "🔥" },
]

const cities = ["All", "Almaty", "Astana", "Tashkent", "Bishkek"]

export function Dashboard({ onStartGame, onJoinGame, onViewChange }: DashboardProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium")
  const [selectedCity, setSelectedCity] = useState("All")
  const [roomIdInput, setRoomIdInput] = useState("")

  const difficulties: { id: Difficulty; label: string; color: string }[] = [
    { id: "easy", label: "Easy", color: "text-green-400" },
    { id: "medium", label: "Medium", color: "text-yellow-400" },
    { id: "hardcore", label: "Hardcore", color: "text-red-400" },
  ]

  const filteredLeaderboard = selectedCity === "All"
    ? leaderboardData
    : leaderboardData.filter(p => p.city === selectedCity)

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomIdInput.trim()) {
      onJoinGame(roomIdInput.trim())
    }
  }

  return (
    <div className="min-h-screen p-4 pt-4 lg:p-8 lg:pt-8">
      {/* Hero Section */}
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground lg:text-5xl">
            Connect4 <span className="text-primary">Blitz</span>
          </h1>
          <p className="mb-6 max-w-md text-base text-muted-foreground lg:text-lg">
            Fast-paced strategic duels. Outsmart your opponents in the ultimate Connect Four experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onStartGame("ai", selectedDifficulty)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
            >
              <Bot className="h-4 w-4" />
              Quick Play vs AI
            </button>
            <button
              onClick={() => onStartGame("online")}
              className="inline-flex items-center gap-2 rounded-lg bo rder border-accent bg-accent/10 px-6 py-3 text-sm font-semibold text-accent transition-all hover:bg-accent/20"
            >
              <Users className="h-4 w-4" />
              Find Match
            </button>
          </div>
        </div>
      </section>

      {/* Game Mode Cards */}
      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Play vs AI */}
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">Play vs AI</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Challenge our AI opponents from rookie to grandmaster level.
          </p>
          
          {/* Difficulty Selector */}
          <div className="mb-4 flex gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  selectedDifficulty === diff.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                )}
              >
                <span className={diff.color}>{diff.label}</span>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onStartGame("ai", selectedDifficulty)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/20 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/30"
          >
            Start Game
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Online Duel */}
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent transition-transform group-hover:scale-110">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Online Duel</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Challenge players worldwide or invite friends with a room link.
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Форма для ввода ID комнаты и подключения */}
            <form onSubmit={handleJoinRoom} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Room ID" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!roomIdInput.trim()}
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                Join
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStartGame("online")}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-accent bg-accent/10 py-2 text-xs font-medium text-accent transition-all hover:bg-accent/20"
              >
                <Link2 className="h-3.5 w-3.5" />
                Create Room
              </button>
              
              <button
                onClick={() => onStartGame("online")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-accent/20 py-2 text-xs font-medium text-accent transition-all hover:bg-accent/30"
              >
                Quick Match
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Local 2-Player */}
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-chart-3/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/20 text-chart-3 transition-transform group-hover:scale-110">
              <Monitor className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Local 2-Player</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Play with a friend on the same device. Classic couch gaming!
            </p>
          </div>
          
          <button
            onClick={() => onStartGame("local")}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-chart-3/20 py-2.5 text-sm font-medium text-chart-3 transition-all hover:bg-chart-3/30"
          >
            Start Local Game
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Bottom Section: Leaderboard + Pro Card */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-foreground">Global Leaderboard</h3>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    selectedCity === city
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {city !== "All" && <MapPin className="h-3 w-3" />}
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredLeaderboard.map((player) => (
              <div
                key={player.rank}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:bg-secondary",
                  player.rank === 1 && "border-yellow-400/30 bg-yellow-400/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    player.rank === 1 && "bg-yellow-400/20 text-yellow-400",
                    player.rank === 2 && "bg-gray-400/20 text-gray-400",
                    player.rank === 3 && "bg-orange-400/20 text-orange-400",
                    player.rank > 3 && "bg-muted text-muted-foreground"
                  )}
                >
                  {player.rank}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl">
                  {player.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{player.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {player.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{player.wins}</p>
                  <p className="text-xs text-muted-foreground">wins</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade to PRO Card */}
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 bg-card p-5 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
          
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                PRO
              </span>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-foreground">Upgrade to PRO</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Unlock the full potential of Connect4 Blitz
            </p>
            
            <ul className="mb-6 space-y-2">
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Advanced AI Coach Analysis
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Exclusive Board & Chip Skins
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-chart-3" />
                Ad-Free Experience
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Priority Matchmaking
              </li>
            </ul>
            
            <button
              onClick={() => onViewChange("shop")}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            >
              View PRO Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
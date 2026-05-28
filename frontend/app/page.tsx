"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { GameArena } from "@/components/game-arena"
import { Shop } from "@/components/shop"

// Описание типов данных, приходящих с бэкенда
export interface Board {
  grid: number[][] // 6x7 массив
}

export interface GameSession {
  id: string
  player1Id: string
  player2Id: string | null
  board: Board
  status: "WAITING" | "PLAYING" | "FINISHED"
  currentTurn: number
  gameOver: boolean
  winnerId: string | null
}

export type View = "dashboard" | "game" | "shop"
export type Difficulty = "easy" | "medium" | "hardcore"
export type GameMode = "ai" | "online" | "local"

const BACKEND_URL = "http://localhost:8085" // Укажите порт вашего Spring Boot

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [gameMode, setGameMode] = useState<GameMode>("ai")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  
  // Состояния для работы с бэкендом
  const [playerId, setPlayerId] = useState<string>("")
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Инициализируем playerId при монтировании (простая генерация UUID для примера)
  useEffect(() => {
    let id = localStorage.getItem("c4_player_id")
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11)
      localStorage.setItem("c4_player_id", id)
    }
    setPlayerId(id)
  }, [])

  // Старт игры (Локально / ИИ / Создание онлайн-комнаты)
  const startGame = async (mode: GameMode, diff?: Difficulty) => {
    setGameMode(mode)
    if (diff) setDifficulty(diff)

    if (mode === "online") {
      setLoading(true)
      try {
        const response = await fetch(`${BACKEND_URL}/api/game/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        })
        if (!response.ok) throw new Error("Не удалось создать комнату")
        
        const session: GameSession = await response.json()
        setGameSession(session)
        setCurrentView("game")
      } catch (error) {
        console.error("Ошибка при создании игры:", error)
        alert("Ошибка сервера при создании онлайн-игры")
      } finally {
        setLoading(false)
      }
    } else {
      // Для ИИ и Локальной игры зануляем сессию бэкенда
      setGameSession(null)
      setCurrentView("game")
    }
  }

  // Подключение к существующей онлайн-комнате (вызывается из Dashboard)
  const joinOnlineGame = async (gameId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/game/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerId }),
      })
      if (!response.ok) throw new Error("Комната не найдена или занята")

      const session: GameSession = await response.json()
      setGameMode("online")
      setGameSession(session)
      setCurrentView("game")
    } catch (error) {
      console.error("Ошибка подключения:", error)
      alert("Не удалось подключиться к игре. Проверьте ID.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <span className="text-lg animate-pulse">Загрузка игры...</span>
          </div>
        )}

        {!loading && currentView === "dashboard" && (
          <Dashboard 
            onStartGame={startGame} 
            onJoinGame={joinOnlineGame} // Передаем функцию подключения в Dashboard
            onViewChange={setCurrentView} 
          />
        )}
        
        {!loading && currentView === "game" && (
          <GameArena
            mode={gameMode}
            difficulty={difficulty}
            playerId={playerId}          // Передаем ID текущего игрока
            initialSession={gameSession}  // Передаем сессию, если игра онлайн
            onLeave={() => {
              setGameSession(null)
              setCurrentView("dashboard")
            }}
          />
        )}
        
        {currentView === "shop" && <Shop />}
      </main>
    </div>
  )
}
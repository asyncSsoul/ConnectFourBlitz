"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MessageCircle, Brain, Flag, Clock, Send, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Difficulty, GameMode, GameSession } from "@/app/page"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

interface GameArenaProps {
  mode: GameMode
  difficulty: Difficulty
  playerId: string               
  initialSession: GameSession | null 
  onLeave: () => void
}

type Cell = null | "player1" | "player2"
type Board = Cell[][]

const ROWS = 6
const COLS = 7

const createEmptyBoard = (): Board =>
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

interface WinningLine {
  cells: [number, number][]
}

export function GameArena({ mode, difficulty, playerId, initialSession, onLeave }: GameArenaProps) {
  // Основные стейты игры
  const [session, setSession] = useState<GameSession | null>(initialSession)
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">("player1")
  const [winner, setWinner] = useState<"player1" | "player2" | "draw" | null>(null)
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null)
  
  // Вспомогательные стейты UI
  const [gameTime, setGameTime] = useState(0)
  const [activeTab, setActiveTab] = useState<"chat" | "coach">("chat")
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "System", text: "Game started! Good luck!" },
  ])
  const [chatInput, setChatInput] = useState("")
  const [droppingCol, setDroppingCol] = useState<number | null>(null)
  const [droppingRow, setDroppingRow] = useState<number | null>(null)

  const stompClientRef = useRef<Client | null>(null)

  // Функция-маппер: переводит числовую сетку бэка в массив строк фронтенда
  const mapBackendGridToFrontend = (grid: number[][]): Board => {
    return grid.map(row => 
      row.map(cell => {
        if (cell === 1) return "player1"
        if (cell === 2) return "player2"
        return null
      })
    )
  }

  // === ЭФФЕКТ ВЕБ-СОКЕТОВ ДЛЯ ОНЛАЙН ИГРЫ ===
  useEffect(() => {
    if (mode !== "online" || !initialSession) return

    const socket = new SockJS("http://localhost:8085/ws")
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("[STOMP] " + str),
      onConnect: () => {
        console.log("Успешное сокет-подключение к Spring Boot!")
        
        // Подписываемся на топик нашей комнаты
        client.subscribe(`/topic/game/${initialSession.id}`, (message) => {
          const updatedSession: GameSession = JSON.parse(message.body)
          console.log("Получен апдейт сессии с бэка:", updatedSession)
          
          setSession(updatedSession)
          setBoard(mapBackendGridToFrontend(updatedSession.board.grid))
          setCurrentPlayer(updatedSession.currentTurn === 1 ? "player1" : "player2")
          
          // Обработка завершения игры на бэке
          if (updatedSession.gameOver) {
            if (updatedSession.winnerId === "DRAW") {
              setWinner("draw")
            } else {
              setWinner(updatedSession.winnerId === updatedSession.player1Id ? "player1" : "player2")
            }
          }
        })
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame)
      }
    })

    client.activate()
    stompClientRef.current = client

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate()
    }
  }, [mode, initialSession])

  // Timer
  useEffect(() => {
    if (winner) return
    const interval = setInterval(() => {
      setGameTime((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [winner])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const checkWinner = useCallback((board: Board, row: number, col: number, player: Cell): WinningLine | null => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
    for (const [dr, dc] of directions) {
      const cells: [number, number][] = [[row, col]]
      for (let i = 1; i < 4; i++) {
        const newRow = row + dr * i
        const newCol = col + dc * i
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          cells.push([newRow, newCol])
        } else break
      }
      for (let i = 1; i < 4; i++) {
        const newRow = row - dr * i
        const newCol = col - dc * i
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          cells.push([newRow, newCol])
        } else break
      }
      if (cells.length >= 4) return { cells: cells.slice(0, 4) }
    }
    return null
  }, [])

  const getLowestRow = (currentBoard: Board, col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (currentBoard[row][col] === null) return row
    }
    return null
  }

  const makeAIMove = useCallback((currentBoard: Board) => {
    const validCols = []
    for (let col = 0; col < COLS; col++) {
      if (currentBoard[0][col] === null) validCols.push(col)
    }
    if (validCols.length === 0) return

    let selectedCol = validCols[Math.floor(Math.random() * validCols.length)]

    if (difficulty === "medium" || difficulty === "hardcore") {
      for (const col of validCols) {
        const row = getLowestRow(currentBoard, col)
        if (row !== null) {
          const testBoard = currentBoard.map(r => [...r])
          testBoard[row][col] = "player2"
          if (checkWinner(testBoard, row, col, "player2")) { selectedCol = col; break; }
        }
      }
    }
    if (difficulty === "hardcore" && selectedCol === validCols[Math.floor(Math.random() * validCols.length)]) {
      for (const col of validCols) {
        const row = getLowestRow(currentBoard, col)
        if (row !== null) {
          const testBoard = currentBoard.map(r => [...r])
          testBoard[row][col] = "player1"
          if (checkWinner(testBoard, row, col, "player1")) { selectedCol = col; break; }
        }
      }
      if (validCols.includes(3)) selectedCol = 3
    }

    setTimeout(() => {
      handleColumnClick(selectedCol, currentBoard, true)
    }, 500 + Math.random() * 500)
  }, [difficulty, checkWinner])

  // === КЛИК ПО КОЛОНКЕ (ОБЪЕДИНЕННЫЙ) ===
  const handleColumnClick = useCallback((col: number, currentBoard?: Board, isAI = false) => {
    if (winner) return

    // --- ОНЛАЙН РЕЖИМ (Шлем на Spring Boot) ---
    if (mode === "online") {
      if (!session || session.status !== "PLAYING" || session.gameOver) return

      // Валидация: Мой ли сейчас ход?
      const isMyTurn = 
        (session.currentTurn === 1 && playerId === session.player1Id) ||
        (session.currentTurn === 2 && playerId === session.player2Id)

      if (!isMyTurn) {
        alert("Сейчас ход вашего соперника!")
        return
      }

      // Отправляем фрейм в сокет бэкенда
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/move",
          body: JSON.stringify({
            gameId: session.id,
            playerId: playerId,
            col: col
          })
        })
      }
      return
    }

    // --- АВТОНОМНЫЕ РЕЖИМЫ (Локальный и ИИ) ---
    const boardToUse = currentBoard || board
    if (!isAI && mode === "ai" && currentPlayer === "player2") return
    
    const row = getLowestRow(boardToUse, col)
    if (row === null) return

    setDroppingCol(col)
    setDroppingRow(row)

    const playerMakingMove = isAI ? "player2" : currentPlayer

    setTimeout(() => {
      const newBoard = boardToUse.map((r) => [...r])
      newBoard[row][col] = playerMakingMove

      setBoard(newBoard)
      setDroppingCol(null)
      setDroppingRow(null)

      const winResult = checkWinner(newBoard, row, col, playerMakingMove)
      if (winResult) {
        setWinner(playerMakingMove)
        setWinningLine(winResult)
        return
      }

      if (newBoard[0].every((cell) => cell !== null)) {
        setWinner("draw")
        return
      }

      const nextPlayer = playerMakingMove === "player1" ? "player2" : "player1"
      setCurrentPlayer(nextPlayer)

      if (mode === "ai" && nextPlayer === "player2") {
        makeAIMove(newBoard)
      }
    }, 400)
  }, [board, currentPlayer, winner, mode, session, playerId, checkWinner, makeAIMove])

  const resetGame = () => {
    if (mode === "online") return // В онлайне перезапуск через бэк
    setBoard(createEmptyBoard())
    setCurrentPlayer("player1")
    setWinner(null)
    setWinningLine(null)
    setGameTime(0)
    setChatMessages([{ sender: "System", text: "New game started! Good luck!" }])
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    setChatMessages([...chatMessages, { sender: "You", text: chatInput }])
    setChatInput("")
    setTimeout(() => {
      const responses = ["Nice move!", "Good game!", "Let's go!", "Interesting strategy..."]
      setChatMessages(prev => [...prev, { sender: "Opponent", text: responses[Math.floor(Math.random() * responses.length)] }])
    }, 1000)
  }

  const isWinningCell = (row: number, col: number) => {
    if (!winningLine) return false
    return winningLine.cells.some(([r, c]) => r === row && c === col)
  }

  // Динамические данные игроков на основе сессии
  const player1Info = {
    name: mode === "online" ? (session?.player1Id === playerId ? "Вы (Игрок 1)" : "Игрок 1") : "You",
    flag: "🇰🇿",
    city: "Almaty",
  }

  const player2Info = {
    name: mode === "ai" ? `AI (${difficulty})` : mode === "online" ? (session?.player2Id === playerId ? "Вы (Игрок 2)" : "Соперник") : "Player 2",
    flag: mode === "ai" ? "🤖" : "🇺🇿",
    city: mode === "ai" ? "Cloud" : "Tashkent",
  }

  return (
    <div className="flex min-h-screen flex-col p-4 pt-4 lg:flex-row lg:gap-6 lg:p-8 lg:pt-8">
      <div className="flex-1">
        {/* Top Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 lg:p-4">
          <button
            onClick={onLeave}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Leave
          </button>

          {/* Player 1 */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-xl",
              currentPlayer === "player1" && !winner ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
            )}>
              {player1Info.flag}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{player1Info.name}</p>
              <p className="text-xs text-muted-foreground">{player1Info.city}</p>
            </div>
            <div className="h-4 w-4 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]" />
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg font-bold text-foreground">{formatTime(gameTime)}</span>
          </div>

          {/* Player 2 */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-[var(--neon-magenta)] shadow-[0_0_10px_var(--neon-magenta)]" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground">{player2Info.name}</p>
              <p className="text-xs text-muted-foreground">{player2Info.city}</p>
            </div>
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-xl",
              currentPlayer === "player2" && !winner ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
            )}>
              {player2Info.flag}
            </div>
          </div>

          <button
            onClick={onLeave}
            className="flex items-center gap-2 rounded-lg bg-destructive/20 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/30"
          >
            <Flag className="h-4 w-4" />
            Resign
          </button>
        </div>

        {/* Banner */}
        {mode === "online" && session?.status === "WAITING" ? (
          <div className="mb-4 rounded-xl border-2 border-dashed border-yellow-500/50 bg-yellow-500/10 p-4 text-center animate-pulse">
            <p className="text-sm text-yellow-500 font-bold">ОЖИДАНИЕ СОПЕРНИКА</p>
            <p className="text-xs text-muted-foreground mt-1">Отправьте другу ID сессии: <span className="font-mono bg-background p-1 rounded text-foreground select-all">{session.id}</span></p>
          </div>
        ) : winner ? (
          <div className={cn(
            "mb-4 rounded-xl border-2 p-4 text-center",
            winner === "draw" ? "border-yellow-400/50 bg-yellow-400/10" :
            winner === "player1" ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--neon-magenta)] bg-[var(--neon-magenta)]/10"
          )}>
            <p className="text-xl font-bold text-foreground">
              {winner === "draw" ? "It's a Draw!" : winner === "player1" ? `${player1Info.name} Wins!` : `${player2Info.name} Wins!`}
            </p>
            {mode !== "online" && (
              <button onClick={resetGame} className="mt-3 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
                Play Again
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-sm text-muted-foreground">Current Turn</p>
            <p className={cn("text-lg font-bold", currentPlayer === "player1" ? "text-[var(--neon-cyan)]" : "text-[var(--neon-magenta)]")}>
              {currentPlayer === "player1" ? player1Info.name : player2Info.name}
            </p>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center">
          <div className="relative rounded-2xl border-4 border-primary/30 bg-card p-2 shadow-[0_0_60px_rgba(168,85,247,0.2)] lg:p-4">
            <div className="relative grid grid-cols-7 gap-1 lg:gap-2">
              {Array(COLS).fill(null).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-lg p-1 transition-all lg:gap-2 lg:p-1.5",
                    (!winner && (mode !== "online" || session?.status === "PLAYING")) && "hover:bg-primary/10"
                  )}
                  onClick={() => handleColumnClick(colIndex)}
                >
                  {Array(ROWS).fill(null).map((_, rowIndex) => {
                    const cell = board[rowIndex][colIndex]
                    const isDropping = droppingCol === colIndex && droppingRow === rowIndex
                    const isWinning = isWinningCell(rowIndex, colIndex)
                    
                    return (
                      <div
                        key={rowIndex}
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10 lg:h-12 lg:w-12",
                          cell === null && "border-border bg-background/50",
                          cell === "player1" && "border-[var(--neon-cyan)]/50 bg-[var(--neon-cyan)]",
                          cell === "player2" && "border-[var(--neon-magenta)]/50 bg-[var(--neon-magenta)]",
                          isDropping && "animate-chip-drop",
                          isWinning && "animate-win-glow"
                        )}
                      >
                        {cell && <div className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />}
                        {cell && <div className={cn("absolute -inset-1 rounded-full blur-md", cell === "player1" ? "bg-[var(--neon-cyan)]/30" : "bg-[var(--neon-magenta)]/30")} />}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="mt-6 w-full lg:mt-0 lg:w-80">
        <div className="mb-4 flex rounded-xl border border-border bg-card p-1">
          <button onClick={() => setActiveTab("chat")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all", activeTab === "chat" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
            <MessageCircle className="h-4 w-4" /> Live Chat
          </button>
          <button onClick={() => setActiveTab("coach")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all", activeTab === "coach" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Brain className="h-4 w-4" /> AI Coach
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          {activeTab === "chat" ? (
            <div className="flex h-80 flex-col lg:h-96">
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("rounded-lg px-3 py-2 text-sm", msg.sender === "You" ? "ml-auto max-w-[80%] bg-primary/20 text-primary" : msg.sender === "System" ? "bg-secondary text-muted-foreground" : "max-w-[80%] bg-secondary text-foreground")}>
                    {msg.sender !== "You" && <p className="mb-1 text-xs font-medium text-muted-foreground">{msg.sender}</p>}
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChatMessage()} placeholder="Type a message..." className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                <button onClick={sendChatMessage} className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Brain className="h-8 w-8" />
                </div>
                <h4 className="mb-2 font-semibold text-foreground">AI Strategy Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {winner ? "Analyzing your game... The AI Coach will provide insights on your moves." : "Finish the game to get your AI strategy review."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
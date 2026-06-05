import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'

export const Route = createFileRoute('/')({
  component: SlidePuzzle,
})

type Board = number[] // 9 cells, 0 = empty

const GOAL: Board = [1, 2, 3, 4, 5, 6, 7, 8, 0]

function isSolvable(board: Board): boolean {
  const tiles = board.filter((n) => n !== 0)
  let inversions = 0
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++
    }
  }
  return inversions % 2 === 0
}

function shuffleBoard(): Board {
  let board: Board
  do {
    board = [...GOAL]
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[board[i], board[j]] = [board[j], board[i]]
    }
  } while (!isSolvable(board) || isSolved(board))
  return board
}

function isSolved(board: Board): boolean {
  return board.every((n, i) => n === GOAL[i])
}

function adjacentToEmpty(index: number, emptyIndex: number): boolean {
  const r1 = Math.floor(index / 3)
  const c1 = index % 3
  const r2 = Math.floor(emptyIndex / 3)
  const c2 = emptyIndex % 3
  const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2)
  return dist === 1
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function SlidePuzzle() {
  const [board, setBoard] = useState<Board>(() => shuffleBoard())
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)

  const solved = isSolved(board)

  useEffect(() => {
    if (!started || solved) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [started, solved])

  const move = useCallback(
    (index: number) => {
      if (solved) return
      const emptyIndex = board.indexOf(0)
      if (!adjacentToEmpty(index, emptyIndex)) return
      setBoard((prev) => {
        const empty = prev.indexOf(0)
        const next = [...prev]
        ;[next[index], next[empty]] = [next[empty], next[index]]
        return next
      })
      setMoves((m) => m + 1)
      if (!started) setStarted(true)
    },
    [board, solved, started],
  )

  const reset = () => {
    setBoard(shuffleBoard())
    setMoves(0)
    setSeconds(0)
    setStarted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-fuchsia-200 dark:from-violet-950 dark:to-fuchsia-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Number Slide
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Arrange the tiles from 1 to 8
          </p>
        </div>

        <div className="flex justify-between items-center mb-4 px-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm">
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              Moves
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              {moves}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm">
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              Time
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="relative bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {board.map((tile, index) => {
              const emptyIndex = board.indexOf(0)
              const movable = tile !== 0 && adjacentToEmpty(index, emptyIndex)
              if (tile === 0) {
                return (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-700/40"
                  />
                )
              }
              return (
                <button
                  key={index}
                  onClick={() => move(index)}
                  disabled={solved}
                  className={`aspect-square rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-150 select-none
                    ${
                      tile === GOAL[index]
                        ? 'bg-fuchsia-500 text-white'
                        : 'bg-violet-600 text-white'
                    }
                    ${movable ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-default'}
                    shadow-md active:scale-95`}
                >
                  {tile}
                </button>
              )
            })}
          </div>

          {solved && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 rounded-2xl backdrop-blur-sm">
              <span className="text-5xl mb-2">🎉</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Solved!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {moves} moves · {formatTime(seconds)}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={reset}
          className="w-full mt-5 py-3 rounded-xl bg-violet-700 dark:bg-fuchsia-400 text-white dark:text-violet-950 font-semibold shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
        >
          {solved ? 'Play Again' : 'Shuffle / Reset'}
        </button>
      </div>
    </div>
  )
}

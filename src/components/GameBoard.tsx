'use client'

import { useState, useEffect } from 'react'
import { WinnerEffect } from './WinnerEffect'
import { ComputerPlayer, type Difficulty } from './ComputerPlayer'
import { type Player, type Board, type Scores } from '../types/types'

export default function GameBoard() {
  const [board, setBoard] = useState<Board>(
    Array(6).fill(null).map(() => Array(7).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red')
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player>(null)
  const [dropAnimation, setDropAnimation] = useState<{ row: number; col: number } | null>(null)
  const [dropSound, setDropSound] = useState<HTMLAudioElement | null>(null)
  const [winSound, setWinSound] = useState<HTMLAudioElement | null>(null)
  const [scores, setScores] = useState<Scores>({
    red: 0,
    yellow: 0
  })
  const [isComputerMode, setIsComputerMode] = useState(false);
  const [computerPlayer, setComputerPlayer] = useState<'red' | 'yellow'>('yellow');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // Initialize sound effects
  useEffect(() => {
    setDropSound(new Audio('/drop.wav'))
    setWinSound(new Audio('/win.wav'))
  }, [])

  // Computer move effect
  useEffect(() => {
    if (isComputerMode && currentPlayer === computerPlayer && !winner) {
      makeComputerMove();
    }
  }, [currentPlayer, isComputerMode, winner]);

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)))
    setCurrentPlayer('red')
    setWinner(null)
    setDropAnimation(null)
  }

  const resetScores = () => {
    setScores({
      red: 0,
      yellow: 0
    })
  }

  const makeComputerMove = async () => {
    if (!isComputerMode || currentPlayer !== computerPlayer || winner) return;

    // Wait a bit to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 1000));

    const columnToPlay = ComputerPlayer.getMove(board, computerPlayer, difficulty);
    makeMove(columnToPlay);
  };

  const makeMove = async (column: number) => {
    if (winner || dropAnimation) return

    const newBoard = board.map(row => [...row])
    let landingRow = -1

    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][column]) {
        landingRow = row
        break
      }
    }

    if (landingRow === -1) return

    for (let row = 0; row <= landingRow; row++) {
      setDropAnimation({ row, col: column })
      dropSound?.play()
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    newBoard[landingRow][column] = currentPlayer
    setBoard(newBoard)
    setDropAnimation(null)

    const isWinner = checkWinner(newBoard, landingRow, column)
    if (isWinner) {
      winSound?.play()
      setWinner(currentPlayer)
      setScores(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + 1
      }))
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
    }
  }

  const checkWinner = (board: Board, lastRow: number, lastCol: number) => {
    const currentColor = board[lastRow][lastCol]
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]], // diagonal \
    ]

    for (const [dir1, dir2] of directions) {
      let count = 1
      for (const [rowDir, colDir] of [dir1, dir2]) {
        let row = lastRow + rowDir
        let col = lastCol + colDir
        while (
          row >= 0 && row < 6 && col >= 0 && col < 7 &&
          board[row][col] === currentColor
        ) {
          count++
          row += rowDir
          col += colDir
        }
      }
      if (count >= 4) return true
    }
    return false
  }

  return (
    <div className="flex flex-col items-center">
      {/* Score Board */}
      <div className="mb-6 flex gap-8 text-xl">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-red-500 mb-2"></div>
          <span className="font-bold">{scores.red}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-yellow-400 mb-2"></div>
          <span className="font-bold">{scores.yellow}</span>
        </div>
      </div>

      {/* Game Mode Controls */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => {
            setIsComputerMode(!isComputerMode);
            resetGame();
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {isComputerMode ? "2 Players" : "Play vs Computer"}
        </button>
        {isComputerMode && (
          <>
            <button
              onClick={() => {
                setComputerPlayer(computerPlayer === 'red' ? 'yellow' : 'red');
                resetGame();
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Computer plays as {computerPlayer === 'red' ? 'Red' : 'Yellow'}
            </button>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="px-4 py-2 rounded border border-gray-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </>
        )}
      </div>

      {/* Column Indicators */}
      <div className="flex mb-2">
        {Array(7).fill(null).map((_, colIndex) => (
          <div
            key={`indicator-${colIndex}`}
            className={`
              w-16 h-4 m-1
              transition-all duration-100 ease-in-out
              ${hoverColumn === colIndex 
                ? currentPlayer === 'red'
                  ? 'bg-red-200 rounded-t-lg'
                  : 'bg-yellow-200 rounded-t-lg'
                : 'bg-transparent'}
            `}
          />
        ))}
      </div>

      <div className="bg-blue-500 p-4 rounded-lg relative">
        {winner && <WinnerEffect />}
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onMouseEnter={() => setHoverColumn(colIndex)}
                onMouseLeave={() => setHoverColumn(null)}
                className={`
                  w-16 h-16 m-1 rounded-full cursor-pointer
                  transition-all duration-100 ease-in-out
                  ${!cell ? "bg-white" : ""}
                  ${cell === "red" ? "bg-red-500" : ""}
                  ${cell === "yellow" ? "bg-yellow-400" : ""}
                  ${dropAnimation?.row === rowIndex && dropAnimation?.col === colIndex
                    ? "piece-drop"
                    : ""
                  }
                `}
                onClick={() => makeMove(colIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset Scores
        </button>
      </div>
    </div>
  )
}

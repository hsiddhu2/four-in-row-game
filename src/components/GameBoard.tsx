'use client';

import { useState, useEffect, useCallback } from 'react';
import { WinnerEffect } from './WinnerEffect';
import { ComputerPlayer, type Difficulty } from './ComputerPlayer';
import { type Player, type Board, type Scores } from '../types/types';

interface GameModeControlsProps {
  isComputerMode: boolean;
  setIsComputerMode: (value: boolean) => void;
  computerPlayer: 'red' | 'yellow';
  setComputerPlayer: (value: 'red' | 'yellow') => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  resetGame: () => void;
}

interface ColumnIndicatorsProps {
  hoverColumn: number | null;
  currentPlayer: 'red' | 'yellow';
}

interface GameBoardGridProps {
  board: Board;
  hoverColumn: number | null;
  setHoverColumn: (column: number | null) => void;
  dropAnimation: { row: number; col: number } | null;
  makeMove: (column: number) => void;
  winner: Player;
}

interface ActionButtonsProps {
  resetGame: () => void;
  resetScores: () => void;
}

export default function GameBoard() {
  const [board, setBoard] = useState<Board>(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player>(null);
  const [dropAnimation, setDropAnimation] = useState<{ row: number; col: number } | null>(null);
  const [dropSound, setDropSound] = useState<HTMLAudioElement | null>(null);
  const [winSound, setWinSound] = useState<HTMLAudioElement | null>(null);
  const [scores, setScores] = useState<Scores>({ red: 0, yellow: 0 });
  const [isComputerMode, setIsComputerMode] = useState(false);
  const [computerPlayer, setComputerPlayer] = useState<'red' | 'yellow'>('yellow');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  useEffect(() => {
    setDropSound(new Audio('/drop.wav'));
    setWinSound(new Audio('/win.wav'));
  }, []);

  const makeMove = useCallback(async (column: number) => {
    if (winner || dropAnimation) return;

    const newBoard = board.map((row) => [...row]);
    let landingRow = -1;

    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][column]) {
        landingRow = row;
        break;
      }
    }

    if (landingRow === -1) return;

    for (let row = 0; row <= landingRow; row++) {
      setDropAnimation({ row, col: column });
      dropSound?.play();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    newBoard[landingRow][column] = currentPlayer;
    setBoard(newBoard);
    setDropAnimation(null);

    if (checkWinner(newBoard, landingRow, column)) {
      winSound?.play();
      setWinner(currentPlayer);
      setScores((prev) => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    }
  }, [board, currentPlayer, dropAnimation, dropSound, winSound, winner]);

  const makeComputerMove = useCallback(async () => {
    if (!isComputerMode || currentPlayer !== computerPlayer || winner) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const columnToPlay = ComputerPlayer.getMove(board, computerPlayer, difficulty);
    makeMove(columnToPlay);
  }, [isComputerMode, currentPlayer, computerPlayer, winner, board, difficulty, makeMove]);

  useEffect(() => {
    if (isComputerMode && currentPlayer === computerPlayer && !winner) {
      makeComputerMove();
    }
  }, [isComputerMode, currentPlayer, computerPlayer, winner, makeComputerMove]);

  const resetGame = () => {
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null))
    );
    setCurrentPlayer('red');
    setWinner(null);
    setDropAnimation(null);
  };

  const resetScores = () => setScores({ red: 0, yellow: 0 });

  const checkWinner = (board: Board, lastRow: number, lastCol: number) => {
    const currentColor = board[lastRow][lastCol];
    const directions = [
      [[0, 1], [0, -1]],
      [[1, 0], [-1, 0]],
      [[1, 1], [-1, -1]],
      [[1, -1], [-1, 1]],
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;
      for (const [rowDir, colDir] of [dir1, dir2]) {
        let row = lastRow + rowDir;
        let col = lastCol + colDir;
        while (row >= 0 && row < 6 && col >= 0 && col < 7 && board[row][col] === currentColor) {
          count++;
          row += rowDir;
          col += colDir;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex gap-8 text-xl">
        <ScoreDisplay color="red" score={scores.red} />
        <ScoreDisplay color="yellow" score={scores.yellow} />
      </div>
      <GameModeControls
        isComputerMode={isComputerMode}
        setIsComputerMode={setIsComputerMode}
        computerPlayer={computerPlayer}
        setComputerPlayer={setComputerPlayer}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        resetGame={resetGame}
      />
      <ColumnIndicators hoverColumn={hoverColumn} currentPlayer={currentPlayer} />
      <GameBoardGrid
        board={board}
        hoverColumn={hoverColumn}
        setHoverColumn={setHoverColumn}
        dropAnimation={dropAnimation}
        makeMove={makeMove}
        winner={winner}
      />
      <ActionButtons resetGame={resetGame} resetScores={resetScores} />
    </div>
  );
}

const ScoreDisplay = ({ color, score }: { color: 'red' | 'yellow'; score: number }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full bg-${color === 'red' ? 'red-500' : 'yellow-400'} mb-2`} />
    <span className="font-bold">{score}</span>
  </div>
);
const GameModeControls = ({
  isComputerMode,
  setIsComputerMode,
  computerPlayer,
  setComputerPlayer,
  difficulty,
  setDifficulty,
  resetGame,
}: 

GameModeControlsProps) => (
  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-6">
    <button
      onClick={() => {
        setIsComputerMode(!isComputerMode);
        resetGame();
      }}
      className="px-4 py-2 bg-green-500 text-white rounded w-full lg:w-auto" // Added w-full for full width on mobile
    >
      {isComputerMode ? '2 Players' : 'Play vs Computer'}
    </button>
    {isComputerMode && (
      <>
        <button
          onClick={() => {
            setComputerPlayer(computerPlayer === 'red' ? 'yellow' : 'red');
            resetGame();
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded w-full lg:w-auto" // Added w-full for full width on mobile
        >
          Computer plays as {computerPlayer === 'red' ? 'Red' : 'Yellow'}
        </button>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="px-4 py-2 rounded border w-full lg:w-auto" // Added w-full for full width on mobile
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </>
    )}
  </div>
);


const ColumnIndicators = ({ hoverColumn, currentPlayer }: ColumnIndicatorsProps) => (
  <div className="flex mb-2">
    {Array(7)
      .fill(null)
      .map((_, colIndex) => (
        <div
          key={colIndex}
          className={`w-16 h-4 m-1 ${
            hoverColumn === colIndex ? (currentPlayer === 'red' ? 'bg-red-200' : 'bg-yellow-200') : 'bg-transparent'
          }`}
        />
      ))}
  </div>
);

const GameBoardGrid = ({ board, setHoverColumn, dropAnimation, makeMove, winner }: GameBoardGridProps) => (
  <div className="flex justify-center items-center bg-blue-500 p-4 rounded-lg relative overflow-auto">
    {winner && <WinnerEffect />}
    <div
      className="grid gap-2 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-7"
      style={{
        gridTemplateColumns: 'repeat(7, 1fr)', // Ensure 7 columns
        width: '100%',
        maxWidth: '1000px', // Keep the board width constrained for large screens
        height: 'auto',
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onMouseEnter={() => setHoverColumn(colIndex)}
            onMouseLeave={() => setHoverColumn(null)}
            className={`rounded-full cursor-pointer transition-all duration-100 ease-in-out
              ${!cell ? 'bg-white' : ''}
              ${cell === 'red' ? 'bg-red-500' : ''}
              ${cell === 'yellow' ? 'bg-yellow-400' : ''}
              ${dropAnimation?.row === rowIndex && dropAnimation?.col === colIndex ? 'piece-drop' : ''}
            `}
            onClick={() => makeMove(colIndex)}
            style={{
              width: '100%',
              aspectRatio: '1 / 1', // Keep aspect ratio square
              maxWidth: '60px', // Reduced to 60px for smaller devices
              minWidth: '40px', // Set the minimum size for cells
            }}
          />
        ))
      )}
    </div>
  </div>
);



const ActionButtons = ({ resetGame, resetScores }: ActionButtonsProps) => (
  <div className="mt-4 flex gap-4">
    <button onClick={resetGame} className="px-4 py-2 bg-blue-500 text-white rounded">
      New Game
    </button>
    <button onClick={resetScores} className="px-4 py-2 bg-gray-500 text-white rounded">
      Reset Scores
    </button>
  </div>
);

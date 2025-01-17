// src/components/ComputerPlayer.tsx

import { type Player, type Board } from '../types/types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export class ComputerPlayer {
  static getMove(
    board: Board,
    computerPlayer: Player,
    difficulty: Difficulty
  ): number {
    switch (difficulty) {
      case 'hard':
        return this.getHardModeMove(board, computerPlayer);
      case 'medium':
        return this.getMediumModeMove(board, computerPlayer);
      case 'easy':
        return this.getEasyModeMove(board);
      default:
        return this.getMediumModeMove(board, computerPlayer);
    }
  }

  private static getValidColumns(board: Board): number[] {
    const validColumns = [];
    for (let col = 0; col < 7; col++) {
      if (!board[0][col]) validColumns.push(col);
    }
    return validColumns;
  }

  private static getEasyModeMove(board: Board): number {
    const validColumns = this.getValidColumns(board);
    return validColumns[Math.floor(Math.random() * validColumns.length)];
  }

  private static getMediumModeMove(board: Board, computerPlayer: Player): number {
    const validColumns = this.getValidColumns(board);
    
    // Check for winning move
    const winningMove = this.findWinningMove(board, computerPlayer);
    if (winningMove !== null) return winningMove;

    // Check for blocking move
    const opponent = computerPlayer === 'red' ? 'yellow' : 'red';
    const blockingMove = this.findWinningMove(board, opponent);
    if (blockingMove !== null) return blockingMove;

    // Prefer center column
    if (validColumns.includes(3)) return 3;

    // Random move
    return validColumns[Math.floor(Math.random() * validColumns.length)];
  }

  private static getHardModeMove(board: Board, computerPlayer: Player): number {
    const validColumns = this.getValidColumns(board);
    
    // Check for winning move
    const winningMove = this.findWinningMove(board, computerPlayer);
    if (winningMove !== null) return winningMove;

    // Block opponent
    const opponent = computerPlayer === 'red' ? 'yellow' : 'red';
    const blockingMove = this.findWinningMove(board, opponent);
    if (blockingMove !== null) return blockingMove;

    // Strategic moves
    const strategicMove = this.findStrategicMove(board, computerPlayer);
    if (strategicMove !== null) return strategicMove;

    // Preferred columns order
    const preferredColumns = [3, 2, 4, 1, 5, 0, 6];
    for (const col of preferredColumns) {
      if (validColumns.includes(col)) return col;
    }

    return validColumns[0];
  }

  private static findWinningMove(board: Board, player: Player): number | null {
    const validColumns = this.getValidColumns(board);
    
    for (const col of validColumns) {
      const tempBoard = board.map(row => [...row]);
      let row = 5;
      while (row >= 0 && tempBoard[row][col]) row--;
      if (row >= 0) {
        tempBoard[row][col] = player;
        if (this.checkWinner(tempBoard, row, col)) {
          return col;
        }
      }
    }
    return null;
  }

  private static findStrategicMove(board: Board, player: Player): number | null {
    const validColumns = this.getValidColumns(board);
    
    for (const col of validColumns) {
      const tempBoard = board.map(row => [...row]);
      let row = 5;
      while (row >= 0 && tempBoard[row][col]) row--;
      if (row >= 0) {
        tempBoard[row][col] = player;
        if (this.evaluatePosition(tempBoard, row, col, player) >= 2) {
          return col;
        }
      }
    }
    return null;
  }

  private static evaluatePosition(board: Board, row: number, col: number, player: Player): number {
    let threats = 0;
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]], // diagonal \
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;
      for (const [rowDir, colDir] of [dir1, dir2]) {
        let r = row + rowDir;
        let c = col + colDir;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
          count++;
          r += rowDir;
          c += colDir;
        }
      }
      if (count >= 3) threats++;
    }
    return threats;
  }

  private static checkWinner(board: Board, row: number, col: number): boolean {
    const player = board[row][col];
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]], // diagonal \
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;
      for (const [rowDir, colDir] of [dir1, dir2]) {
        let r = row + rowDir;
        let c = col + colDir;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
          count++;
          r += rowDir;
          c += colDir;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  }
}

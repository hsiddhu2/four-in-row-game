// src/components/types.ts

export type Player = 'red' | 'yellow' | null;
export type Board = Player[][];
export type Scores = {
  red: number;
  yellow: number;
};

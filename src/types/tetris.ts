export type MinoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z' | 'GARBAGE';

export type GameMode = 'timeattack' | 'classic';

export interface Point {
  x: number;
  y: number;
}

export interface CharacterInfo {
  name: string;
  koreanName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
  drawFace: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) => void;
}

export interface MinoDefinition {
  type: MinoType;
  shape: number[][];
  color: string;
  character: CharacterInfo;
}

export interface CellState {
  filled: boolean;
  color: string;
  characterType?: MinoType;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  lines: number;
  mode: GameMode;
  date: string;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  tetrisCount: number;
  timeRemaining: number; // in seconds
  elapsedTime: number; // in seconds
  feverGauge: number; // 0 to 100
  isFever: boolean;
  feverTimeRemaining: number; // in seconds
}

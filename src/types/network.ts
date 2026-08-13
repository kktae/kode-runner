import { z } from 'zod';

// ==========================================
// Realtime Multiplayer Protocol Schemas
// ==========================================

export const BoardMatrixSchema = z.array(z.array(z.number().int().min(0).max(8)));

export const PlayerGameStateSchema = z.object({
  board: BoardMatrixSchema,
  score: z.number().int().nonnegative(),
  lines: z.number().int().nonnegative(),
  combo: z.number().int().nonnegative(),
  // shape는 전송하지 않는다 — 수신 측이 type + rotation으로 복원한다(OpponentBoardRenderer).
  currentPiece: z
    .object({
      type: z.number().int(),
      x: z.number().int(),
      y: z.number().int(),
      rotation: z.number().int(),
    })
    .nullable(),
  isGameOver: z.boolean(),
});

export type PlayerGameState = z.infer<typeof PlayerGameStateSchema>;

/** 상대에게 보내는 가비지 라인 공격 1건. hole은 뚫린 열 인덱스(0-9). */
export interface GarbageAttack {
  lines: number;
  hole: number;
}

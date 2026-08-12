import { z } from 'zod';

// ==========================================
// 1. Leaderboard Schemas
// ==========================================

export const LeaderboardEntrySchema = z.object({
  rank: z.number().int().positive().optional(),
  id: z.string(),
  nickname: z.string().min(1).max(12),
  score: z.number().int().nonnegative(),
  mode: z.enum(['timeattack', 'classic']),
  timestamp: z.number().int(),
  avatar: z.string().optional(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const SubmitScoreRequestSchema = z.object({
  nickname: z.string().min(1).max(12),
  score: z.number().int().nonnegative(),
  mode: z.enum(['timeattack', 'classic']),
  linesCleared: z.number().int().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  sessionToken: z.string().optional(),
});

export type SubmitScoreRequest = z.infer<typeof SubmitScoreRequestSchema>;

// ==========================================
// 2. Realtime Multiplayer Protocol Schemas
// ==========================================

export const BoardMatrixSchema = z.array(z.array(z.number().int().min(0).max(7)));

export const PlayerGameStateSchema = z.object({
  board: BoardMatrixSchema,
  score: z.number().int().nonnegative(),
  lines: z.number().int().nonnegative(),
  combo: z.number().int().nonnegative(),
  currentPiece: z.object({
    type: z.number().int(),
    x: z.number().int(),
    y: z.number().int(),
    rotation: z.number().int(),
  }).nullable(),
  isGameOver: z.boolean(),
});

export type PlayerGameState = z.infer<typeof PlayerGameStateSchema>;

// Multiplayer Message Types
export const PacketSchema = z.discriminatedUnion('type', [
  // Room Lifecycle
  z.object({
    type: z.literal('JOIN_ROOM'),
    payload: z.object({
      nickname: z.string(),
      avatar: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('ROOM_READY'),
    payload: z.object({
      ready: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal('GAME_START'),
    payload: z.object({
      seed: z.number(),
      startTime: z.number(),
    }),
  }),
  // Realtime Gameplay Sync
  z.object({
    type: z.literal('STATE_SYNC'),
    payload: PlayerGameStateSchema,
  }),
  // Attack Garbage Line
  z.object({
    type: z.literal('ATTACK_GARBAGE'),
    payload: z.object({
      linesCount: z.number().int().positive(),
      holePosition: z.number().int().min(0).max(9),
    }),
  }),
  // Game End
  z.object({
    type: z.literal('GAME_OVER'),
    payload: z.object({
      finalScore: z.number().int(),
      survivedTime: z.number(),
    }),
  }),
  // Quick Matchmaking
  z.object({
    type: z.literal('QUICK_MATCH_REQUEST'),
    payload: z.object({
      nickname: z.string(),
    }),
  }),
  z.object({
    type: z.literal('QUICK_MATCH_ASSIGNED'),
    payload: z.object({
      roomId: z.string(),
    }),
  }),
]);

export type Packet = z.infer<typeof PacketSchema>;

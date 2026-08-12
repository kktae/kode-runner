import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import sirv from 'sirv';
import { logInfo, logWarn, logError, logDebug } from './logger';

// Global Unhandled Rejection & Exception Handlers to Prevent Process Crash
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception caught', err);
});

process.on('unhandledRejection', (reason) => {
  logError('Unhandled Rejection caught', reason);
});

const PORT = Number(process.env.PORT) || 8080;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_URL = process.env.REDIS_URL || (REDIS_HOST ? `redis://${REDIS_HOST}:${REDIS_PORT}` : '');

// SPA Static File Server
const serveAssets = sirv('dist', {
  single: true,
  dev: process.env.NODE_ENV !== 'production',
});

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', serverless: true, timestamp: new Date().toISOString() }));
    return;
  }
  serveAssets(req, res);
});

// Bind HTTP server immediately to pass Cloud Run health checks
httpServer.listen(PORT, '0.0.0.0', () => {
  logInfo(`Cloud Run Serverless Socket Server listening on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV || 'development' });
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Setup Redis Adapter for Cloud Run Auto-Scaling (Safeguarded against Error Event Crashes)
if (REDIS_URL) {
  try {
    const pubClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    const subClient = pubClient.duplicate();

    // Attach required error handlers to prevent unhandled 'error' event crash
    pubClient.on('error', (err) => {
      logWarn('Redis pubClient error event', { error: err.message });
    });

    subClient.on('error', (err) => {
      logWarn('Redis subClient error event', { error: err.message });
    });

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logInfo('Socket.io Redis Adapter connected successfully', { redisHost: REDIS_HOST, redisPort: REDIS_PORT });
    }).catch((err) => {
      logWarn('Redis Adapter fallback to in-memory adapter', { error: err.message });
    });
  } catch (e) {
    logWarn('Redis Adapter initialization error', { error: e });
  }
} else {
  logInfo('No Redis configuration found; running with in-memory adapter');
}

// Room Session Manager with Ready States
interface PlayerSession {
  socketId: string;
  nickname: string;
  isReady: boolean;
}

const roomSessions = new Map<string, PlayerSession[]>();
let waitingRoomId: string | null = null;

function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

let redisClient: Redis | null = null;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redisClient.on('error', (err) => {
      logWarn('Redis client error event', { error: err.message });
    });
    redisClient.connect().catch((err) => {
      logWarn('Redis client connection failed; falling back to in-memory leaderboard', { error: err.message });
    });
  } catch (e) {
    logWarn('Redis client init error', { error: e });
  }
}

// In-Memory Leaderboard Fallback Data Store
interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  lines: number;
  mode: string;
  date: string;
}

const inMemoryLeaderboard: Record<string, LeaderboardRecord[]> = {
  timeattack: [],
  classic: [],
};

async function fetchLeaderboardFromStorage(mode: string): Promise<LeaderboardRecord[]> {
  const key = `leaderboard:${mode}`;
  if (redisClient && redisClient.status === 'ready') {
    try {
      // Fetch top 20 entries sorted by score DESC
      const rawData = await (redisClient as any).zrevrange(key, 0, 19, 'WITHSCORES');
      const results: LeaderboardRecord[] = [];
      for (let i = 0; i < rawData.length; i += 2) {
        const memberStr = rawData[i];
        const score = parseInt(rawData[i + 1], 10);
        try {
          const parsed = JSON.parse(memberStr);
          results.push({
            id: parsed.id || String(i),
            name: parsed.name || '관람객',
            score: score || parsed.score || 0,
            lines: parsed.lines || 0,
            mode: mode,
            date: parsed.date || new Date().toLocaleDateString('ko-KR'),
          });
        } catch {
          results.push({
            id: String(i),
            name: memberStr,
            score: score,
            lines: 0,
            mode: mode,
            date: new Date().toLocaleDateString('ko-KR'),
          });
        }
      }
      return results;
    } catch (err: any) {
      logWarn('Failed to fetch leaderboard from Redis', { error: err.message });
    }
  }
  return inMemoryLeaderboard[mode] || [];
}

async function saveScoreToStorage(entry: LeaderboardRecord): Promise<LeaderboardRecord[]> {
  const mode = entry.mode || 'timeattack';
  const key = `leaderboard:${mode}`;

  if (redisClient && redisClient.status === 'ready') {
    try {
      const memberStr = JSON.stringify({
        id: entry.id,
        name: entry.name,
        score: entry.score,
        lines: entry.lines,
        date: entry.date,
      });
      // ZADD leaderboard:mode SCORE MEMBER
      await redisClient.zadd(key, entry.score, memberStr);
      // Keep top 100 entries in Redis Sorted Set
      await redisClient.zremrangebyrank(key, 0, -101);
      logInfo('Score successfully saved to Redis Leaderboard', { name: entry.name, score: entry.score, mode });
    } catch (err: any) {
      logWarn('Failed to save score to Redis', { error: err.message });
    }
  }

  // Also update in-memory store
  const list = inMemoryLeaderboard[mode] || [];
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  inMemoryLeaderboard[mode] = list.slice(0, 50);

  return fetchLeaderboardFromStorage(mode);
}

io.on('connection', (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentNickname = '플레이어';

  logInfo('Socket client connected', { socketId: socket.id, ip: socket.handshake.address });

  // 0. Global Leaderboard Handlers
  socket.on('get_leaderboard', async (data: { mode: string }) => {
    const mode = data?.mode || 'timeattack';
    const entries = await fetchLeaderboardFromStorage(mode);
    socket.emit('leaderboard_data', { mode, entries });
  });

  socket.on('submit_score', async (data: { name: string; score: number; lines: number; mode: string }) => {
    const entry: LeaderboardRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name ? data.name.trim().slice(0, 20) : '관람객',
      score: Number(data.score) || 0,
      lines: Number(data.lines) || 0,
      mode: data.mode || 'timeattack',
      date: new Date().toLocaleDateString('ko-KR'),
    };

    const updatedList = await saveScoreToStorage(entry);
    io.emit('leaderboard_update', { mode: entry.mode, entries: updatedList });
  });

  // 1. Quick Matchmaking Request
  socket.on('quick_match_request', (data: { nickname: string }) => {
    currentNickname = data.nickname || '플레이어';

    if (waitingRoomId && roomSessions.has(waitingRoomId) && (roomSessions.get(waitingRoomId)?.length || 0) < 2) {
      const assignedRoom = waitingRoomId;
      waitingRoomId = null;
      logInfo('Quick match assigned to existing room', { socketId: socket.id, roomId: assignedRoom, nickname: currentNickname });
      socket.emit('quick_match_assigned', { roomId: assignedRoom });
    } else {
      const newRoom = generate4DigitCode();
      waitingRoomId = newRoom;
      logInfo('Quick match created new room', { socketId: socket.id, roomId: newRoom, nickname: currentNickname });
      socket.emit('quick_match_assigned', { roomId: newRoom });
    }
  });

  // 2. Join Room (Manual Ready required before start)
  socket.on('join_room', (data: { roomId: string; nickname: string }) => {
    const { roomId, nickname } = data;
    currentRoomId = roomId;
    currentNickname = nickname || '플레이어';

    socket.join(roomId);

    let sessionList = roomSessions.get(roomId) || [];
    sessionList = sessionList.filter((s) => s.socketId !== socket.id);
    sessionList.push({ socketId: socket.id, nickname: currentNickname, isReady: false });
    roomSessions.set(roomId, sessionList);

    const players = sessionList.map((s) => ({
      nickname: s.nickname,
      socketId: s.socketId,
      isReady: s.isReady,
    }));

    logInfo('Player joined room', { socketId: socket.id, roomId, nickname: currentNickname, totalPlayers: players.length });
    io.in(roomId).emit('room_info', { roomId, players });
  });

  // 3. Toggle Ready State / Start Game when BOTH players ready
  socket.on('player_ready', (data: { isReady: boolean }) => {
    if (!currentRoomId) return;

    let sessionList = roomSessions.get(currentRoomId) || [];
    const player = sessionList.find((s) => s.socketId === socket.id);
    if (player) {
      player.isReady = data.isReady;
    }

    const players = sessionList.map((s) => ({
      nickname: s.nickname,
      socketId: s.socketId,
      isReady: s.isReady,
    }));

    logInfo('Player toggled ready state', { socketId: socket.id, roomId: currentRoomId, isReady: data.isReady });
    io.in(currentRoomId).emit('room_info', { roomId: currentRoomId, players });

    // Start Game when at least 2 players are present and ALL are ready
    if (sessionList.length >= 2 && sessionList.every((s) => s.isReady)) {
      // Reset ready states for next round
      sessionList.forEach((s) => (s.isReady = false));

      logInfo('Multiplayer PvP match started', { roomId: currentRoomId, players: players.map((p) => p.nickname) });
      io.in(currentRoomId).emit('game_start', {
        seed: Math.floor(Math.random() * 1000000),
        startTime: Date.now(),
        players,
      });
    }
  });

  // 4. Realtime State Sync
  socket.on('state_sync', (data: any) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit('state_sync', data);
    }
  });

  // 5. Attack Garbage Line
  socket.on('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
    if (currentRoomId) {
      logDebug('Garbage line attack sent', { socketId: socket.id, roomId: currentRoomId, linesCount: data.linesCount });
      socket.to(currentRoomId).emit('attack_garbage', data);
    }
  });

  // 6. Realtime 1v1 Chat Message (with Korean Profanity Filter & Length Limit)
  socket.on('chat_message', (data: { message: string }) => {
    if (currentRoomId && data.message && data.message.trim().length > 0) {
      const rawText = data.message.trim().slice(0, 100);
      const sanitized = rawText.replace(/시[발바빨벌발발]+|씨[발바빨벌발발]+|개[새새끼씨끼씹]+|병[신신씬]+|미[친친친놈년]+/g, '***');
      
      logDebug('Chat message processed', { socketId: socket.id, roomId: currentRoomId, isFiltered: sanitized !== rawText });

      io.in(currentRoomId).emit('chat_message', {
        message: sanitized,
        sender: currentNickname,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    }
  });

  // 7. Game Over
  socket.on('game_over', (data: any) => {
    if (currentRoomId) {
      logInfo('Game over event received', { socketId: socket.id, roomId: currentRoomId });
      socket.to(currentRoomId).emit('game_over', data);
    }
  });

  // 8. Leave Room or Disconnect
  socket.on('leave_room', () => {
    if (currentRoomId) {
      logInfo('Player left room', { socketId: socket.id, roomId: currentRoomId });
      socket.leave(currentRoomId);
      let sessionList = roomSessions.get(currentRoomId) || [];
      sessionList = sessionList.filter((s) => s.socketId !== socket.id);
      roomSessions.set(currentRoomId, sessionList);

      if (waitingRoomId === currentRoomId) {
        waitingRoomId = null;
      }

      socket.to(currentRoomId).emit('opponent_left', { socketId: socket.id });
      currentRoomId = null;
    }
  });

  socket.on('disconnect', () => {
    logInfo('Socket client disconnected', { socketId: socket.id, roomId: currentRoomId });
    if (currentRoomId) {
      let sessionList = roomSessions.get(currentRoomId) || [];
      sessionList = sessionList.filter((s) => s.socketId !== socket.id);
      roomSessions.set(currentRoomId, sessionList);

      if (waitingRoomId === currentRoomId) {
        waitingRoomId = null;
      }

      socket.to(currentRoomId).emit('opponent_left', { socketId: socket.id });
    }
  });
});

httpServer.listen(PORT, () => {
  logInfo(`Cloud Run Serverless Socket Server listening on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV || 'development' });
});

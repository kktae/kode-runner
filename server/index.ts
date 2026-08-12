import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import sirv from 'sirv';
import { logInfo, logWarn, logError, logDebug } from './logger';

const PORT = Number(process.env.PORT) || 8080;
const REDIS_URL = process.env.VITE_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

// SPA Static File Server
const serveAssets = sirv('dist', {
  single: true,
  dev: process.env.NODE_ENV !== 'production',
});

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    logDebug('Health check requested', { method: req.method, ip: req.socket.remoteAddress });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', serverless: true, timestamp: new Date().toISOString() }));
    return;
  }
  serveAssets(req, res);
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Setup Redis Adapter for Cloud Run Auto-Scaling
try {
  const pubClient = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logInfo('Socket.io Redis Adapter connected successfully', { redisUrl: REDIS_URL.replace(/:[^:@]+@/, ':***@') });
  }).catch((err) => {
    logWarn('Redis Adapter fallback to in-memory adapter', { error: err.message });
  });
} catch (e) {
  logWarn('Redis Adapter initialization error', { error: e });
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

io.on('connection', (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentNickname = '플레이어';

  logInfo('Socket client connected', { socketId: socket.id, ip: socket.handshake.address });

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

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import sirv from 'sirv';

const PORT = Number(process.env.PORT) || 8080;
const REDIS_URL = process.env.VITE_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

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
    console.log('Socket.io Redis Adapter connected successfully');
  }).catch((err) => {
    console.warn('Redis Adapter fallback to in-memory adapter:', err.message);
  });
} catch (e) {
  console.warn('Redis Adapter initialization error:', e);
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

  // 1. Quick Matchmaking Request
  socket.on('quick_match_request', (data: { nickname: string }) => {
    currentNickname = data.nickname || '플레이어';

    if (waitingRoomId && roomSessions.has(waitingRoomId) && (roomSessions.get(waitingRoomId)?.length || 0) < 2) {
      const assignedRoom = waitingRoomId;
      waitingRoomId = null;
      socket.emit('quick_match_assigned', { roomId: assignedRoom });
    } else {
      const newRoom = generate4DigitCode();
      waitingRoomId = newRoom;
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

    io.in(currentRoomId).emit('room_info', { roomId: currentRoomId, players });

    // Start Game when at least 2 players are present and ALL are ready
    if (sessionList.length >= 2 && sessionList.every((s) => s.isReady)) {
      // Reset ready states for next round
      sessionList.forEach((s) => (s.isReady = false));

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
      socket.to(currentRoomId).emit('attack_garbage', data);
    }
  });

  // 6. Realtime 1v1 Chat Message (with Korean Profanity Filter & Length Limit)
  socket.on('chat_message', (data: { message: string }) => {
    if (currentRoomId && data.message && data.message.trim().length > 0) {
      const rawText = data.message.trim().slice(0, 100);
      // Basic regex profanity filter on server
      const sanitized = rawText.replace(/시[발바빨벌발발]+|씨[발바빨벌발발]+|개[새새끼씨끼씹]+|병[신신씬]+|미[친친친놈년]+/g, '***');
      
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
      socket.to(currentRoomId).emit('game_over', data);
    }
  });

  // 7. Leave Room or Disconnect
  socket.on('leave_room', () => {
    if (currentRoomId) {
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
  console.log(`Cloud Run Serverless Socket Server listening on port ${PORT}`);
});

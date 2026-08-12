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

// Room Session Manager
interface PlayerSession {
  socketId: string;
  nickname: string;
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

  // 2. Join Room (Handles nickname exchange & 2-player game start)
  socket.on('join_room', (data: { roomId: string; nickname: string }) => {
    const { roomId, nickname } = data;
    currentRoomId = roomId;
    currentNickname = nickname || '플레이어';

    socket.join(roomId);

    let sessionList = roomSessions.get(roomId) || [];
    sessionList = sessionList.filter((s) => s.socketId !== socket.id);
    sessionList.push({ socketId: socket.id, nickname: currentNickname });
    roomSessions.set(roomId, sessionList);

    const players = sessionList.map((s) => ({ nickname: s.nickname, socketId: s.socketId }));
    
    // Notify all clients in the room with full member list
    io.in(roomId).emit('room_info', { roomId, players });

    // When 2 players match, start game immediately
    if (sessionList.length >= 2) {
      if (waitingRoomId === roomId) {
        waitingRoomId = null;
      }

      io.in(roomId).emit('game_start', {
        seed: Math.floor(Math.random() * 1000000),
        startTime: Date.now(),
        players,
      });
    }
  });

  // 3. Realtime State Sync
  socket.on('state_sync', (data: any) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit('state_sync', data);
    }
  });

  // 4. Attack Garbage Line
  socket.on('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit('attack_garbage', data);
    }
  });

  // 5. Game Over
  socket.on('game_over', (data: any) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit('game_over', data);
    }
  });

  // 6. Disconnect or Leave Room
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

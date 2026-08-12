import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import sirv from 'sirv';
import { Packet } from '../src/types/network';

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

// Setup Redis Adapter for Cloud Run Serverless Multi-Instance Auto-Scaling
try {
  const pubClient = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io Redis Adapter connected successfully for serverless auto-scaling');
  }).catch((err) => {
    console.warn('Redis Adapter fallback to in-memory adapter (Redis unreached):', err.message);
  });
} catch (e) {
  console.warn('Redis Adapter initialization error:', e);
}

// Global Matchmaking Queue
let waitingMatchRoomId: string | null = null;

function generate4DigitRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on('connection', (socket) => {
  let activeRoomId = socket.handshake.query.roomId as string | undefined;
  const nickname = socket.handshake.query.nickname as string;

  // Handle Matchmaking & Normal Game Packets
  socket.on('packet', (data: Packet) => {
    if (data.type === 'QUICK_MATCH_REQUEST') {
      if (waitingMatchRoomId) {
        // 대기 중인 방이 있으면 대기자의 방 코드로 즉시 매칭!
        const assignedRoom = waitingMatchRoomId;
        waitingMatchRoomId = null;

        socket.emit('packet', {
          type: 'QUICK_MATCH_ASSIGNED',
          payload: { roomId: assignedRoom },
        } satisfies Packet);
      } else {
        // 대기중인 방이 없으면 새로운 4자리 정수 방 생성 후 대기 큐 등록
        const newRoom = generate4DigitRoomCode();
        waitingMatchRoomId = newRoom;

        socket.emit('packet', {
          type: 'QUICK_MATCH_ASSIGNED',
          payload: { roomId: newRoom },
        } satisfies Packet);
      }
      return;
    }

    if (activeRoomId) {
      socket.to(activeRoomId).emit('packet', data);
    }
  });

  if (activeRoomId) {
    socket.join(activeRoomId);

    // Notify opponent in the room
    socket.to(activeRoomId).emit('packet', {
      type: 'JOIN_ROOM',
      payload: { nickname: nickname || 'Player' },
    } satisfies Packet);

    // Query total sockets in room across all instances
    io.in(activeRoomId).fetchSockets().then((sockets) => {
      if (sockets.length === 2) {
        if (waitingMatchRoomId === activeRoomId) {
          waitingMatchRoomId = null;
        }

        io.in(activeRoomId!).emit('packet', {
          type: 'GAME_START',
          payload: {
            seed: Math.floor(Math.random() * 1000000),
            startTime: Date.now(),
          },
        } satisfies Packet);
      }
    }).catch((err) => {
      console.error('Error fetching room sockets:', err);
    });
  }

  socket.on('disconnect', () => {
    if (activeRoomId) {
      if (waitingMatchRoomId === activeRoomId) {
        waitingMatchRoomId = null;
      }
      socket.to(activeRoomId).emit('packet', {
        type: 'GAME_OVER',
        payload: { finalScore: 0, survivedTime: 0 },
      } satisfies Packet);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Cloud Run Serverless Socket Server listening on port ${PORT}`);
});

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

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId as string;
  const nickname = socket.handshake.query.nickname as string;

  if (roomId) {
    socket.join(roomId);

    // Notify opponent in the room
    socket.to(roomId).emit('packet', {
      type: 'JOIN_ROOM',
      payload: { nickname: nickname || 'Player' },
    } satisfies Packet);

    // Query total sockets in room across all Cloud Run instances via Redis Adapter
    io.in(roomId).fetchSockets().then((sockets) => {
      if (sockets.length === 2) {
        io.in(roomId).emit('packet', {
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

  socket.on('packet', (data: Packet) => {
    if (roomId) {
      socket.to(roomId).emit('packet', data);
    }
  });

  socket.on('disconnect', () => {
    if (roomId) {
      socket.to(roomId).emit('packet', {
        type: 'GAME_OVER',
        payload: { finalScore: 0, survivedTime: 0 },
      } satisfies Packet);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Cloud Run Serverless Socket Server listening on port ${PORT}`);
});

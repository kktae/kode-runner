import { createServer } from 'http';
import { Server } from 'socket.io';
import sirv from 'sirv';
import { Packet } from '../src/types/network';

const PORT = Number(process.env.PORT) || 8080;

// dist/ 디렉토리의 빌드 산출물(HTML, JS, CSS) 정적 서빙 (SPA Single Page Fallback 지원)
const serveAssets = sirv('dist', {
  single: true,
  dev: process.env.NODE_ENV !== 'production',
});

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // 프론트엔드 정적 웹 자산 서빙
  serveAssets(req, res);
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId as string;
  const nickname = socket.handshake.query.nickname as string;

  if (roomId) {
    socket.join(roomId);

    socket.to(roomId).emit('packet', {
      type: 'JOIN_ROOM',
      payload: { nickname: nickname || 'Player' },
    } satisfies Packet);

    const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
    if (clientsInRoom && clientsInRoom.size === 2) {
      io.in(roomId).emit('packet', {
        type: 'GAME_START',
        payload: {
          seed: Math.floor(Math.random() * 1000000),
          startTime: Date.now(),
        },
      } satisfies Packet);
    }
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
  console.log(`Cloud Run Server listening on port ${PORT}`);
});

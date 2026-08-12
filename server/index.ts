import { createServer } from 'http';
import { Server } from 'socket.io';
import { Packet } from '../src/types/network';

const PORT = Number(process.env.PORT) || 8080;

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Cloud Run Vendor-Agnostic Tetris Multiplayer Server');
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
    
    // 방 안의 상대방에게 새로운 유저 참가 알림
    socket.to(roomId).emit('packet', {
      type: 'JOIN_ROOM',
      payload: { nickname: nickname || 'Player' },
    } satisfies Packet);

    // 유저가 2명이 되면 자동 GAME_START 전송
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
      // 나를 제외한 방 안의 상대방에게 패킷 브로드캐스트
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

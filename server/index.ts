import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import sirv from 'sirv';
import { logInfo, logWarn, logError, logDebug } from './logger';
import {
  COMPARE_AND_DELETE_SCRIPT,
  createRoomStoreResolver,
  ROOM_CAPACITY,
  TOUCH_INTERVAL_MS,
  type PlayerSession,
} from './roomStore';
import {
  MAX_CHAT_LENGTH,
  MAX_NICKNAME_LENGTH,
  RateLimiter,
  clampInt,
  isValidClientId,
  isValidRoomId,
  sanitizeGameState,
  sanitizeText,
} from './validation';

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

const DISCONNECT_GRACE_MS = 6000;
const QUICK_MATCH_QUEUE_KEY = 'quick_match_waiting_room';
const QUICK_MATCH_TTL_SECONDS = 30;

/**
 * 정상 페이로드는 20x10 보드 기준 ~1KB. 기본값 1MB는 파싱 비용 자체가 공격 표면이다.
 *
 * 주의: Bun 런타임에서는 이 값이 핸드셰이크에 광고되기만 하고 실제로 강제되지 않는다
 * (Node의 ws는 강제). 실측 확인됨. 따라서 전송 계층만 믿지 말고 애플리케이션 수준의
 * 엄격한 형태 검증 + 반복 위반 소켓 차단(MAX_MALFORMED_PACKETS)을 함께 둔다.
 */
const MAX_SOCKET_PAYLOAD_BYTES = 32 * 1024;
/** 형태를 어긴 패킷을 이만큼 보내면 소켓을 끊는다. */
const MAX_MALFORMED_PACKETS = 20;
/** 같은 IP에서 열 수 있는 동시 소켓 수. 레이트 리미터가 소켓 단위라 이 상한이 필요하다. */
const MAX_SOCKETS_PER_IP = Number(process.env.MAX_SOCKETS_PER_IP) || 12;
/** 리더보드 브로드캐스트 합치기 간격. */
const LEADERBOARD_BROADCAST_DEBOUNCE_MS = 2000;

/** 콤마 구분 화이트리스트. 미설정이면 기존대로 전체 허용(로컬 개발 편의). */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// SPA Static File Server with strict no-cache for index.html
const serveAssets = sirv('dist', {
  single: true,
  dev: process.env.NODE_ENV !== 'production',
  setHeaders: (res, pathname) => {
    if (pathname === '/' || pathname.endsWith('.html') || pathname.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
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

/**
 * 접속 허용 판정.
 *
 * SPA를 이 서버가 직접 서빙하므로 정상 트래픽은 항상 동일 출처다. 따라서 Origin의 host가
 * 요청 Host와 같으면 무조건 허용한다 — 이렇게 해야 커스텀 도메인, Cloud Run 기본 URL
 * (*.run.app), 로드밸런서 IP, localhost가 설정 없이 모두 동작한다.
 * ALLOWED_ORIGINS는 그 외 출처를 추가로 허용할 때만 쓴다.
 * (도메인만 허용하도록 두면 run.app으로 접속했을 때 소켓이 막혀 멀티플레이가 죽는다.)
 */
function isOriginAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true; // 비브라우저 클라이언트(헬스체크, 부하 테스트 등)
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : '*',
    methods: ['GET', 'POST'],
  },
  // 실제 게이트. cors 옵션은 Origin만 보지만 여기서는 요청 Host까지 비교할 수 있다.
  allowRequest: (req, callback) => {
    const allowed = isOriginAllowed(req.headers.origin, req.headers.host);
    if (!allowed) {
      logWarn('Rejected socket handshake: origin not allowed', {
        origin: req.headers.origin,
        host: req.headers.host,
      });
    }
    callback(null, allowed);
  },
  // 전송 계층에서 거대 페이로드를 차단한다. 레이트 리미터는 socket.io가 페이로드를
  // 이미 파싱한 뒤에야 동작하므로, 검증만으로는 파싱 비용을 막을 수 없다.
  maxHttpBufferSize: MAX_SOCKET_PAYLOAD_BYTES,
  pingInterval: 20000,
  pingTimeout: 25000,
});

logInfo('Socket origin policy: same-origin always allowed', {
  extraAllowedOrigins: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : '(none)',
});

// IP당 동시 연결 상한. 소켓을 여러 개 열어 소켓 단위 레이트 리밋을 우회하는 것을 막는다.
const connectionsPerIp = new Map<string, number>();

io.use((socket, next) => {
  const ip = socket.handshake.address || 'unknown';
  const current = connectionsPerIp.get(ip) || 0;
  if (current >= MAX_SOCKETS_PER_IP) {
    logWarn('Rejected connection: too many sockets from IP', { ip, current });
    return next(new Error('too_many_connections'));
  }
  connectionsPerIp.set(ip, current + 1);
  socket.once('disconnect', () => {
    const n = (connectionsPerIp.get(ip) || 1) - 1;
    if (n <= 0) connectionsPerIp.delete(ip);
    else connectionsPerIp.set(ip, n);
  });
  next();
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
      // 연결이 살아있는 것처럼 보이지만 응답이 오지 않는 경우(노드 프리즈, 네트워크 블랙홀,
      // Memorystore failover)를 위해 필수다. 이게 없으면 명령이 TCP 타임아웃까지 수 분간
      // 매달려 있고, 그동안 클라이언트는 아무 응답도 받지 못한 채 멈춘다.
      commandTimeout: 2000,
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

/**
 * 방 멤버십은 반드시 공유 저장소를 거친다. 인스턴스 로컬 Map을 쓰면 두 플레이어가
 * 서로 다른 Cloud Run 인스턴스에 붙었을 때 정원 2명이 관측되지 않아 게임이 시작되지 않는다.
 */
const resolveRoomStore = createRoomStoreResolver(() => redisClient);

// 로컬(단일 인스턴스) 폴백 매치 큐 — Redis가 없을 때만 사용된다.
let fallbackWaitingRoomId: string | null = null;
let fallbackWaitingRoomTime = 0;

/** 연결 해제 유예 타이머. 키는 `${roomId}:${clientId}` — 닉네임은 새로고침마다 바뀌므로 쓸 수 없다. */
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

/** 정상 종료 시 방을 정리해야 하는 소켓들. 유예 타이머는 프로세스와 함께 죽기 때문이다. */
interface LiveSocketEntry {
  getRoom: () => { roomId: string; clientId: string } | null;
  stopHeartbeat: () => void;
}
const liveSockets = new Map<Socket, LiveSocketEntry>();

function graceKey(roomId: string, clientId: string): string {
  return `${roomId}:${clientId}`;
}

function toWirePlayers(players: PlayerSession[]) {
  return players.map((p) => ({
    nickname: p.nickname,
    socketId: p.socketId,
    clientId: p.clientId,
    isReady: p.isReady,
  }));
}

async function broadcastRoomInfo(roomId: string, players: PlayerSession[]) {
  io.in(roomId).emit('room_info', { roomId, players: toWirePlayers(players) });
}

/**
 * 소켓 이벤트 핸들러 래퍼.
 *
 * 두 가지를 한 곳에서 해결한다.
 *
 * 1) 에러 경계 — Socket.IO는 리스너를 try/catch로 감싸지 않고 async 리스너의 rejection도
 *    처리하지 않는다. Redis는 maxRetriesPerRequest:1 / enableOfflineQueue:false 설정이라
 *    잠깐만 흔들려도 즉시 reject되는데, 그러면 클라이언트는 아무 응답도 못 받고 UI가
 *    CONNECTING/WAITING에서 영구히 멈춘다. 최소한 실패를 알려준다.
 *
 * 2) 직렬화 — join_room은 await 이후에야 currentRoomId를 세팅하므로, 그 사이 도착한
 *    player_ready가 방을 못 찾고 조용히 버려졌다. 소켓별로 순차 실행해 순서를 보장한다.
 */
function createHandlerRunner(socket: Socket) {
  let chain: Promise<unknown> = Promise.resolve();

  return function safeHandler<T extends unknown[]>(
    name: string,
    fn: (...args: T) => void | Promise<void>,
    options: { serialize?: boolean } = {},
  ) {
    const { serialize = true } = options;

    return (...args: T) => {
      const run = () =>
        Promise.resolve()
          .then(() => fn(...args))
          .catch((err) => {
            logError(`Socket handler failed: ${name}`, err, {
              socketId: socket.id,
              event: name,
            });
            socket.emit('server_error', {
              event: name,
              message: '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
          });

      // state_sync처럼 순서가 중요하지 않고 빈도가 높은 이벤트는 큐를 우회한다.
      if (!serialize) {
        void run();
        return;
      }
      chain = chain.then(run);
    };
  };
}

/** 대기 큐에 남아 있는 방 코드가 이 방이면 정리한다 (빈 방으로 안내되는 것을 방지). */
async function clearQuickMatchQueueIfRoom(roomId: string) {
  if (fallbackWaitingRoomId === roomId) {
    fallbackWaitingRoomId = null;
  }
  if (redisClient && redisClient.status === 'ready') {
    try {
      // GET → DEL로 나누면 그 사이에 다른 플레이어가 큐에 넣은 새 방을 지울 수 있다.
      await redisClient.eval(COMPARE_AND_DELETE_SCRIPT, 1, QUICK_MATCH_QUEUE_KEY, roomId);
    } catch (err: any) {
      logWarn('Failed to clear quick match queue key', { error: err.message, roomId });
    }
  }
}

// ==========================================
// Leaderboard Storage
// ==========================================

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

function normalizeMode(mode: unknown): string {
  return mode === 'classic' ? 'classic' : 'timeattack';
}

async function fetchLeaderboardFromStorage(mode: string): Promise<LeaderboardRecord[]> {
  const key = `leaderboard:${mode}`;
  if (redisClient && redisClient.status === 'ready') {
    try {
      const rawData = await (redisClient as any).zrevrange(key, 0, 19, 'WITHSCORES');
      const results: LeaderboardRecord[] = [];
      for (let i = 0; i < rawData.length; i += 2) {
        const memberStr = rawData[i];
        const score = parseInt(rawData[i + 1], 10);
        try {
          const parsed = JSON.parse(memberStr);
          results.push({
            id: parsed.id || String(i),
            name: sanitizeText(parsed.name, MAX_NICKNAME_LENGTH) || '관람객',
            score: score || parsed.score || 0,
            lines: parsed.lines || 0,
            mode: mode,
            date: parsed.date || new Date().toLocaleDateString('ko-KR'),
          });
        } catch {
          results.push({
            id: String(i),
            name: sanitizeText(memberStr, MAX_NICKNAME_LENGTH) || '관람객',
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
      await redisClient.zadd(key, entry.score, memberStr);
      await redisClient.zremrangebyrank(key, 0, -101);
      logInfo('Score successfully saved to Redis Leaderboard', { name: entry.name, score: entry.score, mode });
    } catch (err: any) {
      logWarn('Failed to save score to Redis', { error: err.message });
    }
  }

  const list = inMemoryLeaderboard[mode] || [];
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  inMemoryLeaderboard[mode] = list.slice(0, 50);

  return fetchLeaderboardFromStorage(mode);
}

/**
 * 리더보드 갱신 브로드캐스트를 모드별로 합친다.
 *
 * 제출마다 io.emit하면 접속한 전원에게 상위 20개 리스트가 나가고 Redis 어댑터가 전
 * 인스턴스로 팬아웃한다. 부스처럼 게임이 계속 끝나는 환경에서는 이 증폭이 그대로 비용이 된다.
 * 최신 순위만 보이면 되므로 2초 창으로 묶어 마지막 상태 한 번만 보낸다.
 */
const leaderboardBroadcastTimers = new Map<string, NodeJS.Timeout>();

function scheduleLeaderboardBroadcast(mode: string) {
  if (leaderboardBroadcastTimers.has(mode)) return;

  const timer = setTimeout(async () => {
    leaderboardBroadcastTimers.delete(mode);
    try {
      const entries = await fetchLeaderboardFromStorage(mode);
      io.emit('leaderboard_update', { mode, entries });
    } catch (err: any) {
      logWarn('Leaderboard broadcast failed', { error: err?.message, mode });
    }
  }, LEADERBOARD_BROADCAST_DEBOUNCE_MS);

  leaderboardBroadcastTimers.set(mode, timer);
}

// ==========================================
// Socket Handlers
// ==========================================

io.on('connection', (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentClientId: string | null = null;
  let currentNickname = '플레이어';

  // 이벤트 폭주 방어. state_sync는 정상 플레이에서 초당 최대 ~15회이므로 40 t/s면 충분한 여유가 있다.
  const stateSyncLimiter = new RateLimiter(60, 40);
  const attackLimiter = new RateLimiter(20, 10);
  const chatLimiter = new RateLimiter(3, 1);
  const genericLimiter = new RateLimiter(30, 10);
  // 점수 제출은 전원 브로드캐스트를 유발하므로 훨씬 강하게 조인다 (분당 5회).
  const submitScoreLimiter = new RateLimiter(5, 5 / 60);
  let malformedPackets = 0;

  const safeHandler = createHandlerRunner(socket);

  /**
   * 살아있음 하트비트. 프로세스가 강제 종료되면 유예 타이머가 사라져 Redis에 유령
   * 엔트리가 남는데, updatedAt이 갱신되지 않으면 STALE_MS 후 자동으로 정리된다.
   */
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const startHeartbeat = () => {
    if (heartbeatTimer) return;
    heartbeatTimer = setInterval(() => {
      if (!currentRoomId || !currentClientId) return;
      resolveRoomStore()
        .touch(currentRoomId, currentClientId)
        .catch((err) => logWarn('Heartbeat touch failed', { error: err?.message, socketId: socket.id }));
    }, TOUCH_INTERVAL_MS);
  };

  const stopHeartbeat = () => {
    if (!heartbeatTimer) return;
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };

  liveSockets.set(socket, {
    getRoom: () => (currentRoomId && currentClientId ? { roomId: currentRoomId, clientId: currentClientId } : null),
    stopHeartbeat,
  });

  logInfo('Socket client connected', { socketId: socket.id, ip: socket.handshake.address });

  // 0. Global Leaderboard Handlers
  socket.on(
    'get_leaderboard',
    safeHandler('get_leaderboard', async (data: { mode: string }) => {
      if (!genericLimiter.tryConsume()) return;
      const mode = normalizeMode(data?.mode);
      const entries = await fetchLeaderboardFromStorage(mode);
      socket.emit('leaderboard_data', { mode, entries });
    }),
  );

  socket.on(
    'submit_score',
    safeHandler('submit_score', async (data: { name: string; score: number; lines: number; mode: string }) => {
      if (!submitScoreLimiter.tryConsume()) {
        logDebug('submit_score rate limited', { socketId: socket.id });
        return;
      }

      const entry: LeaderboardRecord = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: sanitizeText(data?.name, MAX_NICKNAME_LENGTH) || '관람객',
        score: clampInt(data?.score, 0, 100_000_000),
        lines: clampInt(data?.lines, 0, 100_000),
        mode: normalizeMode(data?.mode),
        date: new Date().toLocaleDateString('ko-KR'),
      };

      await saveScoreToStorage(entry);
      scheduleLeaderboardBroadcast(entry.mode);
    }),
  );

  // 1. Quick Matchmaking Request (Distributed Redis Match Queue)
  socket.on('quick_match_request', safeHandler('quick_match_request', async (data: { nickname: string }) => {
    if (!genericLimiter.tryConsume()) return;
    currentNickname = sanitizeText(data?.nickname, MAX_NICKNAME_LENGTH) || '플레이어';

    let assignedRoom: string | null = null;

    if (redisClient && redisClient.status === 'ready') {
      try {
        // GETDEL은 원자적이다. 기존 GET + DEL 조합은 동시 요청 두 건이 같은 방을 받아
        // 정원을 초과하는 경쟁 상태를 만들었다.
        const existingRoom = await redisClient.getdel(QUICK_MATCH_QUEUE_KEY);

        if (existingRoom) {
          assignedRoom = existingRoom;
          logInfo('Distributed Quick Match: assigned to existing Redis room', { socketId: socket.id, roomId: assignedRoom, nickname: currentNickname });
        } else {
          const newRoom = generate4DigitCode();
          assignedRoom = newRoom;
          await redisClient.set(QUICK_MATCH_QUEUE_KEY, newRoom, 'EX', QUICK_MATCH_TTL_SECONDS);
          logInfo('Distributed Quick Match: created new Redis room', { socketId: socket.id, roomId: newRoom, nickname: currentNickname });
        }
      } catch (err: any) {
        logWarn('Redis Quick Match lookup error, falling back to local memory', { error: err.message });
      }
    }

    if (!assignedRoom) {
      const now = Date.now();
      if (fallbackWaitingRoomId && now - fallbackWaitingRoomTime < QUICK_MATCH_TTL_SECONDS * 1000) {
        assignedRoom = fallbackWaitingRoomId;
        fallbackWaitingRoomId = null;
        logInfo('Fallback Quick Match: assigned to existing local room', { socketId: socket.id, roomId: assignedRoom, nickname: currentNickname });
      } else {
        const newRoom = generate4DigitCode();
        assignedRoom = newRoom;
        fallbackWaitingRoomId = newRoom;
        fallbackWaitingRoomTime = now;
        logInfo('Fallback Quick Match: created new local room', { socketId: socket.id, roomId: newRoom, nickname: currentNickname });
      }
    }

    socket.emit('quick_match_assigned', { roomId: assignedRoom });
  }));

  // 2. Join Room (or Rejoin Room after temporary disconnect)
  socket.on('join_room', safeHandler('join_room', async (data: { roomId: string; nickname: string; clientId: string }) => {
    if (!genericLimiter.tryConsume()) return;

    const roomId = data?.roomId;
    if (!isValidRoomId(roomId)) {
      socket.emit('join_error', { reason: 'invalid_room', message: '방 코드는 4자리 숫자여야 합니다.' });
      return;
    }
    if (!isValidClientId(data?.clientId)) {
      socket.emit('join_error', { reason: 'invalid_client', message: '클라이언트 식별자가 올바르지 않습니다.' });
      return;
    }

    const clientId = data.clientId;
    const nickname = sanitizeText(data?.nickname, MAX_NICKNAME_LENGTH) || '플레이어';

    // 재접속이면 대기 중인 유예 타이머를 취소해 opponent_left 오탐을 막는다.
    const key = graceKey(roomId, clientId);
    const pending = disconnectTimeouts.get(key);
    if (pending) {
      clearTimeout(pending);
      disconnectTimeouts.delete(key);
      logInfo('Rejoining player: cleared pending disconnect grace period timeout', { key, socketId: socket.id });
    }

    const store = resolveRoomStore();
    const { ok, players } = await store.join(roomId, clientId, socket.id, nickname);

    if (!ok) {
      logInfo('Join rejected: room is full', { socketId: socket.id, roomId, capacity: ROOM_CAPACITY });
      socket.emit('room_full', { roomId, capacity: ROOM_CAPACITY });
      return;
    }

    currentRoomId = roomId;
    currentClientId = clientId;
    currentNickname = nickname;

    socket.join(roomId);

    startHeartbeat();

    logInfo('Player joined room', { socketId: socket.id, roomId, clientId, nickname, totalPlayers: players.length });
    await broadcastRoomInfo(roomId, players);
  }));

  // 3. Toggle Ready State / Start Game when BOTH players ready
  socket.on('player_ready', safeHandler('player_ready', async (data: { isReady: boolean }) => {
    if (!genericLimiter.tryConsume()) return;
    if (!currentRoomId || !currentClientId) return;

    const roomId = currentRoomId;
    const store = resolveRoomStore();
    const players = await store.setReady(roomId, currentClientId, data?.isReady === true);

    logInfo('Player toggled ready state', { socketId: socket.id, roomId, isReady: data?.isReady === true });
    await broadcastRoomInfo(roomId, players);

    if (players.length < ROOM_CAPACITY || !players.every((p) => p.isReady)) return;

    // 여러 인스턴스가 동시에 "전원 READY"를 관측할 수 있다. 락으로 정확히 하나만 발행한다.
    if (!(await store.claimGameStart(roomId))) {
      logDebug('game_start already claimed by another instance', { roomId });
      return;
    }

    await store.clearAllReady(roomId);
    const finalPlayers = await store.getPlayers(roomId);

    // 두 클라이언트가 동일한 7-Bag 순서로 플레이하도록 공용 시드를 배포한다.
    const seed = Math.floor(Math.random() * 1_000_000_000);

    logInfo('Multiplayer PvP match started', { roomId, seed, players: finalPlayers.map((p) => p.nickname) });
    io.in(roomId).emit('game_start', {
      seed,
      startTime: Date.now(),
      players: toWirePlayers(finalPlayers),
    });
  }));

  // 4. Realtime State Sync
  // 순서 무관 + 고빈도이므로 직렬 큐를 우회한다 (동기 핸들러라 어차피 즉시 끝난다).
  socket.on('state_sync', safeHandler('state_sync', (data: unknown) => {
    if (!currentRoomId) return;
    if (!stateSyncLimiter.tryConsume()) return;

    const state = sanitizeGameState(data);
    if (!state) {
      malformedPackets += 1;
      logDebug('Dropped malformed state_sync packet', {
        socketId: socket.id,
        roomId: currentRoomId,
        malformedPackets,
      });
      // Bun에서는 maxHttpBufferSize가 강제되지 않으므로, 거대/변조 패킷을 계속 보내는
      // 소켓은 끊어서 파싱 비용을 태우지 못하게 한다.
      if (malformedPackets >= MAX_MALFORMED_PACKETS) {
        logWarn('Disconnecting socket after repeated malformed packets', {
          socketId: socket.id,
          ip: socket.handshake.address,
          malformedPackets,
        });
        socket.disconnect(true);
      }
      return;
    }

    socket.to(currentRoomId).emit('state_sync', state);
  }, { serialize: false }));

  // 5. Attack Garbage Line
  socket.on('attack_garbage', safeHandler('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
    if (!currentRoomId) return;
    if (!attackLimiter.tryConsume()) return;

    const payload = {
      linesCount: clampInt(data?.linesCount, 1, 8),
      holePosition: clampInt(data?.holePosition, 0, 9),
    };

    logDebug('Garbage line attack sent', { socketId: socket.id, roomId: currentRoomId, linesCount: payload.linesCount });
    socket.to(currentRoomId).emit('attack_garbage', payload);
  }));

  // 6. Realtime 1v1 Chat Message
  socket.on('chat_message', safeHandler('chat_message', (data: { message: string }) => {
    if (!currentRoomId) return;
    // 클라이언트 쿨다운은 우회 가능하므로 서버에서도 초당 1건으로 제한한다.
    if (!chatLimiter.tryConsume()) return;

    const rawText = sanitizeText(data?.message, MAX_CHAT_LENGTH);
    if (rawText.length === 0) return;

    const sanitized = rawText.replace(/시[발바빨벌]+|씨[발바빨벌]+|개[새끼씨씹]+|병[신씬]+|미[친놈년]+/g, '***');

    io.in(currentRoomId).emit('chat_message', {
      message: sanitized,
      sender: currentNickname,
      socketId: socket.id,
      timestamp: Date.now(),
    });
  }));

  // 7. Game Over
  socket.on('game_over', safeHandler('game_over', async (data: any) => {
    if (!currentRoomId) return;
    if (!genericLimiter.tryConsume()) return;
    logInfo('Game over event received', { socketId: socket.id, roomId: currentRoomId });
    socket.to(currentRoomId).emit('game_over', {
      finalScore: clampInt(data?.finalScore, 0, 100_000_000),
      survivedTime: clampInt(data?.survivedTime, 0, 86_400),
    });

    // 대전이 끝났으므로 시작 락을 즉시 해제한다. 해제하지 않으면 빠른 KO 직후의
    // 재대결에서 두 사람 다 READY인데 game_start가 발행되지 않는다.
    await resolveRoomStore().releaseGameStart(currentRoomId);
  }));

  // 8. Leave Room (explicit) — no grace period
  socket.on('leave_room', safeHandler('leave_room', async () => {
    if (!currentRoomId || !currentClientId) return;

    const roomId = currentRoomId;
    const clientId = currentClientId;
    currentRoomId = null;
    currentClientId = null;
    stopHeartbeat();

    const key = graceKey(roomId, clientId);
    const pending = disconnectTimeouts.get(key);
    if (pending) {
      clearTimeout(pending);
      disconnectTimeouts.delete(key);
    }

    logInfo('Player left room explicitly', { socketId: socket.id, roomId, clientId });
    socket.leave(roomId);

    const store = resolveRoomStore();
    const { players } = await store.remove(roomId, clientId);

    if (players.length === 0) {
      await clearQuickMatchQueueIfRoom(roomId);
      await store.releaseGameStart(roomId);
    }

    socket.to(roomId).emit('opponent_left', { clientId });
    await broadcastRoomInfo(roomId, players);
  }));

  // 9. Disconnect with grace period (tab switch / network blip / Cloud Run recycle)
  socket.on('disconnect', () => {
    logInfo('Socket client disconnected', { socketId: socket.id, roomId: currentRoomId, nickname: currentNickname });
    liveSockets.delete(socket);
    stopHeartbeat();
    if (!currentRoomId || !currentClientId) return;

    const roomId = currentRoomId;
    const clientId = currentClientId;
    const leavingSocketId = socket.id;
    const key = graceKey(roomId, clientId);

    const existing = disconnectTimeouts.get(key);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      disconnectTimeouts.delete(key);
      void expireGracePeriod(roomId, clientId, leavingSocketId, key);
    }, DISCONNECT_GRACE_MS);

    disconnectTimeouts.set(key, timeout);
  });
});

/** 유예 만료 처리. setTimeout 콜백의 rejection은 아무도 잡지 않으므로 여기서 감싼다. */
async function expireGracePeriod(
  roomId: string,
  clientId: string,
  leavingSocketId: string,
  key: string,
) {
  try {
    const store = resolveRoomStore();
    // 저장된 socketId가 여전히 이 소켓일 때만 제거한다. 다른 소켓(다른 인스턴스 포함)으로
    // 이미 재접속했다면 socketId가 갱신되어 있으므로 아무것도 하지 않는다.
    const { removed, players } = await store.remove(roomId, clientId, leavingSocketId);

    if (!removed) {
      logInfo('Grace period expired but player already rejoined; skipping opponent_left', { key, roomId });
      return;
    }

    if (players.length === 0) {
      await clearQuickMatchQueueIfRoom(roomId);
      await store.releaseGameStart(roomId);
    }

    logInfo('Grace period expired: emitting opponent_left', { key, roomId });
    io.in(roomId).emit('opponent_left', { clientId });
    await broadcastRoomInfo(roomId, players);
  } catch (err) {
    logError('Grace period expiry failed', err, { roomId, clientId });
  }
}

// ==========================================
// Graceful Shutdown
// ==========================================

/**
 * Cloud Run은 배포·스케일인·인스턴스 재활용 때 SIGTERM을 보낸 뒤 잠시 후 프로세스를 죽인다.
 * 연결 해제 유예 타이머는 프로세스 메모리에만 있으므로 그대로 사라지고, Redis 방 해시에는
 * 죽은 플레이어가 방 TTL(2시간)까지 남는다. 그러면 상대는 opponent_left를 영영 못 받고,
 * 아무도 없는 방이 정원 초과로 보여 새 손님이 들어가지 못한다.
 * 여기서 즉시 정리해 정상 종료 경로를 덮는다 (강제 종료는 하트비트 만료가 처리한다).
 */
let shuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logInfo('Shutdown signal received; releasing room state', { signal, sockets: liveSockets.size });

  for (const timer of disconnectTimeouts.values()) clearTimeout(timer);
  disconnectTimeouts.clear();
  for (const timer of leaderboardBroadcastTimers.values()) clearTimeout(timer);
  leaderboardBroadcastTimers.clear();

  const store = resolveRoomStore();
  const cleanups: Promise<unknown>[] = [];

  for (const [socket, entry] of liveSockets) {
    entry.stopHeartbeat();
    const room = entry.getRoom();
    if (!room) continue;

    cleanups.push(
      (async () => {
        try {
          const { players } = await store.remove(room.roomId, room.clientId, socket.id);
          io.in(room.roomId).emit('opponent_left', { clientId: room.clientId });
          await broadcastRoomInfo(room.roomId, players);
          if (players.length === 0) {
            await clearQuickMatchQueueIfRoom(room.roomId);
            await store.releaseGameStart(room.roomId);
          }
        } catch (err) {
          logError('Shutdown cleanup failed for socket', err, { socketId: socket.id, roomId: room.roomId });
        }
      })(),
    );
  }

  // Cloud Run은 SIGTERM 후 약 10초를 준다. 정리에 그 안쪽 예산만 쓴다.
  await Promise.race([
    Promise.allSettled(cleanups),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  liveSockets.clear();
  logInfo('Room state released; closing server', { signal });

  io.close(() => {
    httpServer.close(() => process.exit(0));
  });

  // 소켓이 남아 close가 늦어져도 확실히 종료한다.
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

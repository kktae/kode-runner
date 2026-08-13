import type Redis from 'ioredis';
import { logWarn } from './logger';

export const ROOM_CAPACITY = 2;
const ROOM_TTL_SECONDS = 7200;

/**
 * 락은 "여러 인스턴스가 동시에 전원 READY를 관측하는" 밀리초 단위 구간만 덮으면 된다.
 * 길게 잡으면 대전이 빨리 끝났을 때(빠른 KO 등) 재대결 game_start가 통째로 막힌다.
 * 대전 종료 시 releaseGameStart로 명시적으로 해제하며, 이 TTL은 인스턴스가 죽어
 * 해제가 유실된 경우를 위한 안전망일 뿐이다.
 */
const START_LOCK_TTL_SECONDS = 3;

/**
 * 이 시간 넘게 갱신되지 않은 플레이어 엔트리는 죽은 것으로 본다.
 *
 * 연결해제 유예 타이머는 프로세스 메모리에 있어서, Cloud Run이 인스턴스를 강제 종료하면
 * (OOM/SIGKILL/네트워크 단절) 절대 발화하지 않는다. 그러면 Redis 방 해시에 죽은 플레이어가
 * 방 TTL(2시간)까지 남아 상대는 무한 대기하고 빈 방이 정원 초과로 보인다.
 * TOUCH_INTERVAL_MS 주기 하트비트와 짝을 이뤄 그런 방이 스스로 회복되게 한다.
 */
export const STALE_MS = 90_000;
export const TOUCH_INTERVAL_MS = 30_000;

/** 저장소 연산 상한. 이 시간을 넘기면 메모리 폴백으로 넘어간다. */
const REDIS_OP_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Redis operation timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export interface PlayerSession {
  clientId: string;
  socketId: string;
  nickname: string;
  isReady: boolean;
  updatedAt: number;
}

/**
 * 방 멤버십·READY 상태 저장소.
 *
 * Cloud Run은 여러 인스턴스로 오토스케일되며 Socket.io Redis 어댑터는 "브로드캐스트"만
 * 인스턴스 경계를 넘겨준다. 방 멤버십이 인스턴스 로컬 메모리에 있으면 두 플레이어가
 * 서로 다른 인스턴스에 붙었을 때 어느 쪽도 정원 2명을 관측하지 못해 게임이 영원히
 * 시작되지 않는다. 따라서 멤버십은 공유 저장소(Redis)에 두어야 한다.
 */
export interface RoomStore {
  join(
    roomId: string,
    clientId: string,
    socketId: string,
    nickname: string,
  ): Promise<{ ok: boolean; players: PlayerSession[] }>;
  setReady(roomId: string, clientId: string, isReady: boolean): Promise<PlayerSession[]>;
  /** expectedSocketId가 주어지면 저장된 socketId가 일치할 때만 제거한다. */
  remove(
    roomId: string,
    clientId: string,
    expectedSocketId?: string,
  ): Promise<{ removed: boolean; players: PlayerSession[] }>;
  getPlayers(roomId: string): Promise<PlayerSession[]>;
  clearAllReady(roomId: string): Promise<void>;
  /** 살아있음 표시. 하트비트로 주기 호출한다. */
  touch(roomId: string, clientId: string): Promise<void>;
  /** 여러 인스턴스 중 정확히 하나만 true를 받는다. game_start 중복 발행 방지. */
  claimGameStart(roomId: string): Promise<boolean>;
  /** 대전이 끝나면 반드시 호출한다. 해제하지 않으면 TTL이 만료될 때까지 재대결이 막힌다. */
  releaseGameStart(roomId: string): Promise<void>;
}

/**
 * 값이 기대한 것과 같을 때만 키를 지운다 (compare-and-delete).
 * 퀵매치 대기 큐 정리에 필요하다 — GET 후 DEL 사이에 다른 플레이어가 새 방을 큐에 넣으면
 * 단순 DEL은 그 새 방을 지워버려 대기자가 매칭되지 못하고 혼자 남는다.
 */
export const COMPARE_AND_DELETE_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

// ==========================================
// Redis 구현 (멀티 인스턴스 정상 동작)
// ==========================================

// 정원 초과 판정과 삽입 사이의 경쟁을 막기 위해 원자적으로 수행한다.
// 기존 항목이 있으면 isReady를 보존해 재연결 시 준비 상태가 풀리지 않게 한다.
// 정원은 "신선한" 엔트리만 세고, 만료된 엔트리는 이 자리에서 청소한다.
const JOIN_SCRIPT = `
local now = tonumber(ARGV[6])
local staleMs = tonumber(ARGV[7])
local raw = redis.call('HGET', KEYS[1], ARGV[1])
local ready = false

if raw ~= false then
  local prev = cjson.decode(raw)
  ready = prev.isReady == true
else
  local all = redis.call('HGETALL', KEYS[1])
  local fresh = 0
  for i = 1, #all, 2 do
    local ok, obj = pcall(cjson.decode, all[i + 1])
    local ts = 0
    if ok and obj.updatedAt then ts = obj.updatedAt end
    if (now - ts) <= staleMs then
      fresh = fresh + 1
    else
      redis.call('HDEL', KEYS[1], all[i])
    end
  end
  if fresh >= tonumber(ARGV[4]) then return 0 end
end

redis.call('HSET', KEYS[1], ARGV[1], cjson.encode({
  socketId = ARGV[2], nickname = ARGV[3], isReady = ready, updatedAt = now
}))
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))
return 1
`;

const READY_SCRIPT = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
if raw == false then return 0 end
local obj = cjson.decode(raw)
obj.isReady = ARGV[2] == '1'
obj.updatedAt = tonumber(ARGV[4])
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(obj))
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
return 1
`;

const TOUCH_SCRIPT = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
if raw == false then return 0 end
local obj = cjson.decode(raw)
obj.updatedAt = tonumber(ARGV[2])
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(obj))
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
return 1
`;

// expectedSocketId가 다르면 이미 새 소켓으로 재접속한 것이므로 제거하지 않는다.
// 다른 인스턴스로 재연결한 경우에도 socketId가 갱신되어 있으므로 안전하게 무시된다.
const REMOVE_SCRIPT = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
if raw == false then return 0 end
if ARGV[2] ~= '' then
  local obj = cjson.decode(raw)
  if obj.socketId ~= ARGV[2] then return 0 end
end
redis.call('HDEL', KEYS[1], ARGV[1])
return 1
`;

const CLEAR_READY_SCRIPT = `
local all = redis.call('HGETALL', KEYS[1])
for i = 1, #all, 2 do
  local obj = cjson.decode(all[i + 1])
  obj.isReady = false
  redis.call('HSET', KEYS[1], all[i], cjson.encode(obj))
end
return 1
`;

function roomKey(roomId: string): string {
  return `room:${roomId}`;
}

function isFresh(player: PlayerSession, now: number): boolean {
  return now - player.updatedAt <= STALE_MS;
}

class RedisRoomStore implements RoomStore {
  constructor(private redis: Redis) {}

  private parse(hash: Record<string, string>): PlayerSession[] {
    const now = Date.now();
    const players: PlayerSession[] = [];
    for (const [clientId, raw] of Object.entries(hash)) {
      try {
        const obj = JSON.parse(raw);
        const player: PlayerSession = {
          clientId,
          socketId: String(obj.socketId || ''),
          nickname: String(obj.nickname || '플레이어'),
          isReady: obj.isReady === true,
          updatedAt: Number(obj.updatedAt) || 0,
        };
        // 만료된 유령 엔트리는 상대로 노출하지 않는다 (JOIN에서 정리된다)
        if (isFresh(player, now)) players.push(player);
      } catch {
        // 손상된 항목은 건너뛴다
      }
    }
    return players;
  }

  async getPlayers(roomId: string): Promise<PlayerSession[]> {
    const hash = await this.redis.hgetall(roomKey(roomId));
    return this.parse(hash);
  }

  async join(roomId: string, clientId: string, socketId: string, nickname: string) {
    const result = await this.redis.eval(
      JOIN_SCRIPT,
      1,
      roomKey(roomId),
      clientId,
      socketId,
      nickname,
      String(ROOM_CAPACITY),
      String(ROOM_TTL_SECONDS),
      String(Date.now()),
      String(STALE_MS),
    );
    if (Number(result) !== 1) {
      return { ok: false, players: await this.getPlayers(roomId) };
    }
    return { ok: true, players: await this.getPlayers(roomId) };
  }

  async setReady(roomId: string, clientId: string, isReady: boolean) {
    await this.redis.eval(
      READY_SCRIPT,
      1,
      roomKey(roomId),
      clientId,
      isReady ? '1' : '0',
      String(ROOM_TTL_SECONDS),
      String(Date.now()),
    );
    return this.getPlayers(roomId);
  }

  async touch(roomId: string, clientId: string) {
    await this.redis.eval(
      TOUCH_SCRIPT,
      1,
      roomKey(roomId),
      clientId,
      String(Date.now()),
      String(ROOM_TTL_SECONDS),
    );
  }

  async remove(roomId: string, clientId: string, expectedSocketId = '') {
    const result = await this.redis.eval(
      REMOVE_SCRIPT,
      1,
      roomKey(roomId),
      clientId,
      expectedSocketId,
    );
    return { removed: Number(result) === 1, players: await this.getPlayers(roomId) };
  }

  async clearAllReady(roomId: string) {
    await this.redis.eval(CLEAR_READY_SCRIPT, 1, roomKey(roomId));
  }

  async claimGameStart(roomId: string): Promise<boolean> {
    const result = await this.redis.set(
      `room:${roomId}:start`,
      '1',
      'EX',
      START_LOCK_TTL_SECONDS,
      'NX',
    );
    return result === 'OK';
  }

  async releaseGameStart(roomId: string): Promise<void> {
    await this.redis.del(`room:${roomId}:start`);
  }
}

// ==========================================
// In-Memory 구현 (로컬 개발 / Redis 장애 폴백)
// ==========================================

class MemoryRoomStore implements RoomStore {
  private rooms = new Map<string, Map<string, PlayerSession>>();
  private startLocks = new Map<string, number>();

  private room(roomId: string): Map<string, PlayerSession> {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    return room;
  }

  private snapshot(roomId: string): PlayerSession[] {
    const now = Date.now();
    const room = this.room(roomId);
    for (const [clientId, player] of room) {
      if (!isFresh(player, now)) room.delete(clientId);
    }
    return [...room.values()].map((p) => ({ ...p }));
  }

  async getPlayers(roomId: string) {
    return this.snapshot(roomId);
  }

  async join(roomId: string, clientId: string, socketId: string, nickname: string) {
    const room = this.room(roomId);
    const existing = room.get(clientId);
    if (!existing && this.snapshot(roomId).length >= ROOM_CAPACITY) {
      return { ok: false, players: this.snapshot(roomId) };
    }
    room.set(clientId, {
      clientId,
      socketId,
      nickname,
      isReady: existing ? existing.isReady : false,
      updatedAt: Date.now(),
    });
    return { ok: true, players: this.snapshot(roomId) };
  }

  async setReady(roomId: string, clientId: string, isReady: boolean) {
    const player = this.room(roomId).get(clientId);
    if (player) {
      player.isReady = isReady;
      player.updatedAt = Date.now();
    }
    return this.snapshot(roomId);
  }

  async touch(roomId: string, clientId: string) {
    const player = this.room(roomId).get(clientId);
    if (player) player.updatedAt = Date.now();
  }

  async remove(roomId: string, clientId: string, expectedSocketId = '') {
    const room = this.room(roomId);
    const player = room.get(clientId);
    if (!player) return { removed: false, players: this.snapshot(roomId) };
    if (expectedSocketId && player.socketId !== expectedSocketId) {
      return { removed: false, players: this.snapshot(roomId) };
    }
    room.delete(clientId);
    if (room.size === 0) this.rooms.delete(roomId);
    return { removed: true, players: this.snapshot(roomId) };
  }

  async clearAllReady(roomId: string) {
    for (const player of this.room(roomId).values()) {
      player.isReady = false;
    }
  }

  async claimGameStart(roomId: string): Promise<boolean> {
    const now = Date.now();
    const until = this.startLocks.get(roomId) || 0;
    if (until > now) return false;
    this.startLocks.set(roomId, now + START_LOCK_TTL_SECONDS * 1000);
    return true;
  }

  async releaseGameStart(roomId: string): Promise<void> {
    this.startLocks.delete(roomId);
  }
}

// ==========================================
// Resilient wrapper: Redis 실패 시 메모리로 폴백
// ==========================================

/**
 * Redis가 ready면 Redis 저장소를, 실패하거나 없으면 메모리 저장소를 쓴다.
 *
 * 폴백이 없으면 Redis가 흔들리는 동안 모든 방 조작이 reject되고, Socket.IO는 async 리스너의
 * rejection을 잡지 않으므로 클라이언트는 아무 응답도 못 받은 채 영원히 대기하게 된다.
 * 메모리로 떨어지면 멀티 인스턴스 매칭은 잃지만, 같은 인스턴스에 붙은 두 사람은 계속
 * 플레이할 수 있다 — 아무 반응 없이 멈추는 것보다 낫다.
 */
class ResilientRoomStore implements RoomStore {
  private redisStore: RedisRoomStore | null = null;
  private memoryStore = new MemoryRoomStore();
  private warnedFallback = false;

  constructor(private getRedis: () => Redis | null) {}

  private active(): { store: RoomStore; isRedis: boolean } {
    const redis = this.getRedis();
    if (redis && redis.status === 'ready') {
      if (!this.redisStore) this.redisStore = new RedisRoomStore(redis);
      return { store: this.redisStore, isRedis: true };
    }
    this.warnFallback('Redis not ready');
    return { store: this.memoryStore, isRedis: false };
  }

  private warnFallback(reason: string) {
    if (this.warnedFallback) return;
    this.warnedFallback = true;
    logWarn('Room state falling back to in-memory store; multi-instance matchmaking degraded', {
      reason,
    });
  }

  private async run<T>(op: (store: RoomStore) => Promise<T>): Promise<T> {
    const { store, isRedis } = this.active();
    if (!isRedis) return op(store);
    try {
      // 드라이버의 commandTimeout과 별개로 저장소 수준에서도 상한을 건다.
      // 응답하지 않는 Redis(프리즈/블랙홀)에 매달리면 클라이언트는 에러조차 못 받고
      // 영구히 대기하게 된다 — reject보다 hang이 더 나쁘다.
      return await withTimeout(op(store), REDIS_OP_TIMEOUT_MS);
    } catch (err: any) {
      this.warnedFallback = false; // 실제 실패는 매번 알린다
      this.warnFallback(`Redis operation failed: ${err?.message ?? err}`);
      return op(this.memoryStore);
    }
  }

  join(roomId: string, clientId: string, socketId: string, nickname: string) {
    return this.run((s) => s.join(roomId, clientId, socketId, nickname));
  }
  setReady(roomId: string, clientId: string, isReady: boolean) {
    return this.run((s) => s.setReady(roomId, clientId, isReady));
  }
  remove(roomId: string, clientId: string, expectedSocketId?: string) {
    return this.run((s) => s.remove(roomId, clientId, expectedSocketId));
  }
  getPlayers(roomId: string) {
    return this.run((s) => s.getPlayers(roomId));
  }
  clearAllReady(roomId: string) {
    return this.run((s) => s.clearAllReady(roomId));
  }
  touch(roomId: string, clientId: string) {
    return this.run((s) => s.touch(roomId, clientId));
  }
  claimGameStart(roomId: string) {
    return this.run((s) => s.claimGameStart(roomId));
  }
  releaseGameStart(roomId: string) {
    return this.run((s) => s.releaseGameStart(roomId));
  }
}

export function createRoomStoreResolver(getRedis: () => Redis | null) {
  const store = new ResilientRoomStore(getRedis);
  return function resolveRoomStore(): RoomStore {
    return store;
  };
}

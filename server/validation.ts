export const BOARD_HEIGHT = 20;
export const BOARD_WIDTH = 10;
export const MAX_NICKNAME_LENGTH = 12;
export const MAX_CHAT_LENGTH = 100;

/**
 * 클라이언트가 보낸 표시용 텍스트를 안전하게 만든다.
 * 클라이언트는 닉네임·채팅·리더보드 이름을 innerHTML로 렌더하므로 꺾쇠와
 * 제어문자를 서버에서 먼저 제거해 저장·중계 단계에서 XSS 페이로드를 차단한다.
 * (클라이언트에서도 escapeHtml로 이중 방어한다.)
 */
export function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';

  let cleaned = '';
  for (const char of input) {
    const code = char.codePointAt(0) ?? 0;
    // 제어문자(C0 / DEL) 제거
    if (code < 0x20 || code === 0x7f) continue;
    // 꺾쇠 제거 — 태그 형태 자체가 성립하지 않게 만든다
    if (char === '<' || char === '>') continue;
    cleaned += char;
  }

  return cleaned.trim().slice(0, maxLength);
}

/** 방 코드는 4자리 숫자만 허용한다. */
export function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === 'string' && /^\d{4}$/.test(roomId);
}

export function isValidClientId(clientId: unknown): clientId is string {
  return typeof clientId === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(clientId);
}

export function clampInt(value: unknown, min: number, max: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, Math.floor(num)));
}

function isIntInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export interface SanitizedPiece {
  type: number;
  x: number;
  y: number;
  rotation: number;
}

export interface SanitizedGameState {
  board: number[][];
  score: number;
  lines: number;
  combo: number;
  currentPiece: SanitizedPiece | null;
  isGameOver: boolean;
}

const STATE_SYNC_KEYS = new Set([
  'board',
  'score',
  'lines',
  'combo',
  'currentPiece',
  'isGameOver',
]);
const PIECE_KEYS = new Set(['type', 'x', 'y', 'rotation']);

/**
 * state_sync 페이로드 검증. 실패하면 null을 반환하고 호출부가 패킷을 폐기한다.
 * 형태를 강제해야 상대 클라이언트의 렌더러가 임의 데이터로 깨지지 않는다.
 *
 * 키 목록까지 엄격하게 검사하는 이유: Bun 런타임에서는 socket.io의 maxHttpBufferSize가
 * 실제로 강제되지 않는다(핸드셰이크에 광고만 되고 프레임은 그대로 통과). 즉 악의적
 * 클라이언트가 유효한 board 옆에 1MB짜리 임의 필드를 붙여 서버 파싱 비용을 태울 수 있다.
 * 알 수 없는 키를 즉시 거부하고, 호출부가 반복 위반 소켓을 끊는다.
 */
export function sanitizeGameState(data: unknown): SanitizedGameState | null {
  if (!data || typeof data !== 'object') return null;
  const raw = data as Record<string, unknown>;

  for (const key of Object.keys(raw)) {
    if (!STATE_SYNC_KEYS.has(key)) return null;
  }

  if (!Array.isArray(raw.board) || raw.board.length !== BOARD_HEIGHT) return null;

  const board: number[][] = [];
  for (const row of raw.board) {
    if (!Array.isArray(row) || row.length !== BOARD_WIDTH) return null;
    const cells: number[] = [];
    for (const cell of row) {
      if (!isIntInRange(cell, 0, 8)) return null;
      cells.push(cell as number);
    }
    board.push(cells);
  }

  let currentPiece: SanitizedPiece | null = null;
  if (raw.currentPiece && typeof raw.currentPiece === 'object') {
    const piece = raw.currentPiece as Record<string, unknown>;
    for (const key of Object.keys(piece)) {
      if (!PIECE_KEYS.has(key)) return null;
    }
    if (
      !isIntInRange(piece.type, 1, 7) ||
      !isIntInRange(piece.x, -4, BOARD_WIDTH + 4) ||
      !isIntInRange(piece.y, -4, BOARD_HEIGHT + 4) ||
      !isIntInRange(piece.rotation, 0, 3)
    ) {
      return null;
    }
    currentPiece = {
      type: piece.type as number,
      x: piece.x as number,
      y: piece.y as number,
      rotation: piece.rotation as number,
    };
  }

  return {
    board,
    score: clampInt(raw.score, 0, 100_000_000),
    lines: clampInt(raw.lines, 0, 100_000),
    combo: clampInt(raw.combo, 0, 1000),
    currentPiece,
    isGameOver: raw.isGameOver === true,
  };
}

/**
 * 소켓별 토큰 버킷. 악의적/버그성 이벤트 폭주로 인스턴스가 죽는 것을 막는다.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill = Date.now();

  constructor(
    private capacity: number,
    private refillPerSecond: number,
  ) {
    this.tokens = capacity;
  }

  tryConsume(): boolean {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
      this.lastRefill = now;
    }
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GarbageAttack, PlayerGameState } from '../types/network';
import { getClientId } from '../utils/clientId';

export type RoomStatus = 'IDLE' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

export interface ChatMessage {
  sender: string;
  socketId: string;
  message: string;
  timestamp: number;
}

interface RoomPlayer {
  nickname: string;
  socketId: string;
  clientId: string;
  isReady: boolean;
}

interface MultiplayerStore {
  roomId: string | null;
  status: RoomStatus;
  nickname: string;
  opponentNickname: string | null;
  isReady: boolean;
  opponentReady: boolean;
  opponentState: PlayerGameState | null;
  /** 수신 대기 중인 가비지 공격 큐. 공격자가 지정한 구멍 위치를 보존한다. */
  pendingGarbage: GarbageAttack[];
  /** pendingGarbage의 총 줄 수 (UI 배지용 파생 값). */
  pendingGarbageLines: number;
  gameSeed: number | null;
  gameWinner: 'ME' | 'OPPONENT' | null;
  chatMessages: ChatMessage[];
  joinError: string | null;

  socket: Socket | null;

  connectSocket: () => Socket;
  requestQuickMatch: (nickname: string) => void;
  joinRoom: (roomId: string, nickname: string) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  sendStateSync: (state: PlayerGameState) => void;
  sendGarbageAttack: (linesCount: number, holePosition: number) => void;
  sendGameOver: (finalScore: number, survivedTime: number) => void;
  sendChatMessage: (message: string) => void;
  /** 내가 보낼 공격으로 수신 대기 공격을 상쇄한다. 실제 상쇄된 줄 수를 반환. */
  offsetPendingGarbage: (lines: number) => number;
  /** 대기 큐에서 최대 maxLines 만큼 꺼낸다. 필요하면 항목을 쪼갠다. */
  takePendingGarbage: (maxLines: number) => GarbageAttack[];
  fetchLeaderboard: (mode: string) => void;
  submitScore: (name: string, score: number, lines: number, mode: string) => void;
}

function totalGarbageLines(queue: GarbageAttack[]): number {
  return queue.reduce((sum, item) => sum + item.lines, 0);
}

/** 소켓 리스너 중복 등록 방지 플래그 (socket.off()로 일괄 제거하지 않기 위함). */
let listenersBound = false;

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  roomId: null,
  status: 'IDLE',
  nickname: '',
  opponentNickname: null,
  isReady: false,
  opponentReady: false,
  opponentState: null,
  pendingGarbage: [],
  pendingGarbageLines: 0,
  gameSeed: null,
  gameWinner: null,
  chatMessages: [],
  joinError: null,
  socket: null,

  connectSocket: () => {
    let { socket } = get();

    if (!socket) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
      socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
      });

      set({ socket });
    } else if (!socket.connected) {
      socket.connect();
    }

    const activeSocket = socket;

    // 리스너는 소켓 수명 동안 정확히 한 번만 바인딩한다.
    // 이전 구현은 매 호출마다 socket.off()로 전체 리스너를 지웠는데, 그 과정에서
    // 앞선 호출이 등록해 둔 once('connect', ...) 대기 핸들러까지 사라져
    // 초기 로딩 시 타임어택 리더보드 요청이 통째로 유실됐다.
    if (listenersBound) {
      return activeSocket;
    }
    listenersBound = true;

    activeSocket.on('connect', () => {
      const { roomId, nickname } = get();
      if (roomId && nickname) {
        activeSocket.emit('join_room', { roomId, nickname, clientId: getClientId() });
      }
    });

    const handleLeaderboardPayload = (data: { mode: any; entries: any[] }) => {
      if (data && data.mode && Array.isArray(data.entries)) {
        window.dispatchEvent(new CustomEvent('leaderboard_updated', { detail: data }));
      }
    };

    activeSocket.on('leaderboard_data', handleLeaderboardPayload);
    activeSocket.on('leaderboard_update', handleLeaderboardPayload);

    activeSocket.on('room_info', (data: { roomId: string; players: RoomPlayer[] }) => {
      const state = get();
      const myClientId = getClientId();

      const me = data.players.find((p) => p.clientId === myClientId);
      const opponent = data.players.find((p) => p.clientId !== myClientId);

      // 진행 중(PLAYING)이거나 결과 화면(GAME_OVER)이면 그 상태를 유지한다.
      // room_info는 상대 입퇴장 때마다 오는데, 이때 WAITING으로 되돌리면 대전 중 재연결이
      // 로비로 튕기거나 승패 결과 표시가 지워진다.
      const keepStatus = state.status === 'PLAYING' || state.status === 'GAME_OVER';

      set({
        roomId: data.roomId,
        opponentNickname: opponent ? opponent.nickname : null,
        isReady: me ? me.isReady : state.isReady,
        opponentReady: opponent ? opponent.isReady : false,
        status: keepStatus ? state.status : 'WAITING',
        joinError: null,
      });
    });

    activeSocket.on('room_full', (data: { roomId: string }) => {
      set({
        joinError: `방 ${data?.roomId ?? ''} 은(는) 이미 2명이 대전 중입니다. 다른 방 코드를 사용해주세요.`,
        status: 'IDLE',
        roomId: null,
      });
    });

    activeSocket.on('join_error', (data: { message?: string }) => {
      set({
        joinError: data?.message || '방에 입장할 수 없습니다.',
        status: 'IDLE',
        roomId: null,
      });
    });

    // 서버 핸들러가 실패했을 때(예: Redis 장애) 알림. 이게 없으면 클라이언트는 아무 응답도
    // 받지 못한 채 CONNECTING/WAITING에서 영구히 멈춘다.
    activeSocket.on('server_error', (data: { event?: string; message?: string }) => {
      const state = get();
      // 대전 중이라면 게임을 끊지 않는다 — 릴레이는 계속 흐를 수 있다.
      if (state.status === 'PLAYING') {
        console.warn('server_error during match', data);
        return;
      }
      set({
        joinError: data?.message || '일시적인 서버 오류가 발생했습니다.',
        status: 'IDLE',
        roomId: null,
      });
    });

    activeSocket.on('game_start', (data: { seed: number; startTime: number; players: RoomPlayer[] }) => {
      const myClientId = getClientId();
      const opponent = data.players.find((p) => p.clientId !== myClientId);

      set({
        status: 'PLAYING',
        isReady: false,
        opponentReady: false,
        pendingGarbage: [],
        pendingGarbageLines: 0,
        gameSeed: data.seed,
        gameWinner: null,
        opponentState: null,
        opponentNickname: opponent ? opponent.nickname : get().opponentNickname,
      });
    });

    activeSocket.on('state_sync', (state: PlayerGameState) => {
      const current = get();
      if (state.isGameOver && current.status === 'PLAYING') {
        // 상대방이 게임 중 먼저 KO 되었으므로 내가 승리!
        set({ opponentState: state, gameWinner: 'ME', status: 'GAME_OVER' });
      } else {
        set({ opponentState: state });
      }
    });

    activeSocket.on('game_over', () => {
      if (get().status === 'PLAYING') {
        set({ gameWinner: 'ME', status: 'GAME_OVER' });
      }
    });

    activeSocket.on('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
      const lines = Math.max(0, Math.min(8, Math.floor(Number(data?.linesCount) || 0)));
      if (lines === 0) return;
      const hole = Math.max(0, Math.min(9, Math.floor(Number(data?.holePosition) || 0)));

      set((s) => {
        const pendingGarbage = [...s.pendingGarbage, { lines, hole }];
        return { pendingGarbage, pendingGarbageLines: totalGarbageLines(pendingGarbage) };
      });
    });

    activeSocket.on('chat_message', (msg: ChatMessage) => {
      // 채팅 로그가 무한히 늘어나 렌더 비용이 커지는 것을 막는다.
      set((s) => ({ chatMessages: [...s.chatMessages, msg].slice(-100) }));
    });

    activeSocket.on('opponent_left', () => {
      const status = get().status;
      if (status === 'PLAYING') {
        set({ gameWinner: 'ME', status: 'GAME_OVER', opponentNickname: null, opponentState: null, opponentReady: false });
      } else if (status === 'GAME_OVER') {
        // 결과 화면이 떠 있는 동안 상대가 나간 경우. 상태를 WAITING으로 되돌리면
        // 승패 표시가 지워지고 재대결 버튼이 상대 없이 무한 대기에 빠진다.
        set({ opponentNickname: null, opponentState: null, opponentReady: false });
      } else {
        set({ opponentNickname: null, opponentState: null, opponentReady: false, status: 'WAITING' });
      }
    });

    activeSocket.on('quick_match_assigned', (data: { roomId: string }) => {
      get().joinRoom(data.roomId, get().nickname);
    });

    return activeSocket;
  },

  requestQuickMatch: (nickname: string) => {
    set({
      nickname,
      status: 'CONNECTING',
      opponentNickname: null,
      opponentState: null,
      isReady: false,
      opponentReady: false,
      gameWinner: null,
      chatMessages: [],
      pendingGarbage: [],
      pendingGarbageLines: 0,
      joinError: null,
    });
    const socket = get().connectSocket();

    const doRequest = () => {
      socket.emit('quick_match_request', { nickname });
    };

    if (socket.connected) {
      doRequest();
    } else {
      socket.once('connect', doRequest);
    }
  },

  joinRoom: (roomId: string, nickname: string) => {
    set({
      roomId,
      nickname,
      status: 'CONNECTING',
      opponentNickname: null,
      opponentState: null,
      isReady: false,
      opponentReady: false,
      gameWinner: null,
      chatMessages: [],
      pendingGarbage: [],
      pendingGarbageLines: 0,
      joinError: null,
    });
    const socket = get().connectSocket();

    const doJoin = () => {
      socket.emit('join_room', { roomId, nickname, clientId: getClientId() });
      // 실제 입장 확정은 서버의 room_info / room_full 응답으로 결정된다.
      set((s) => (s.status === 'CONNECTING' ? { status: 'WAITING' } : {}));
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once('connect', doJoin);
    }
  },

  toggleReady: () => {
    const { socket, isReady } = get();
    const nextReady = !isReady;
    set({ isReady: nextReady });
    if (socket && socket.connected) {
      socket.emit('player_ready', { isReady: nextReady });
    }
  },

  leaveRoom: () => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('leave_room');
    }
    set({
      roomId: null,
      status: 'IDLE',
      opponentNickname: null,
      opponentState: null,
      isReady: false,
      opponentReady: false,
      pendingGarbage: [],
      pendingGarbageLines: 0,
      gameWinner: null,
      gameSeed: null,
      chatMessages: [],
      joinError: null,
    });
  },

  sendStateSync: (state: PlayerGameState) => {
    const { socket, status } = get();
    if (socket && socket.connected && status === 'PLAYING') {
      socket.emit('state_sync', state);
    }
  },

  sendGarbageAttack: (linesCount: number, holePosition: number) => {
    const { socket, status } = get();
    if (socket && socket.connected && status === 'PLAYING') {
      socket.emit('attack_garbage', { linesCount, holePosition });
    }
  },

  sendGameOver: (finalScore: number, survivedTime: number) => {
    const { socket, status } = get();
    // 이미 승패가 결정되었거나 상대방이 먼저 KO되어 GAME_OVER 상태인 경우 재설정 방지
    if (status === 'GAME_OVER') return;

    set({ status: 'GAME_OVER', gameWinner: 'OPPONENT' });
    if (socket && socket.connected) {
      socket.emit('game_over', { finalScore, survivedTime });
    }
  },

  sendChatMessage: (message: string) => {
    const { socket } = get();
    if (socket && socket.connected && message.trim().length > 0) {
      socket.emit('chat_message', { message: message.trim() });
    }
  },

  offsetPendingGarbage: (lines: number) => {
    let remaining = Math.max(0, Math.floor(lines));
    if (remaining === 0) return 0;

    const queue = get().pendingGarbage.map((item) => ({ ...item }));
    let consumed = 0;

    while (remaining > 0 && queue.length > 0) {
      const head = queue[0];
      const take = Math.min(head.lines, remaining);
      head.lines -= take;
      remaining -= take;
      consumed += take;
      if (head.lines === 0) queue.shift();
    }

    if (consumed > 0) {
      set({ pendingGarbage: queue, pendingGarbageLines: totalGarbageLines(queue) });
    }
    return consumed;
  },

  takePendingGarbage: (maxLines: number) => {
    let budget = Math.max(0, Math.floor(maxLines));
    const queue = get().pendingGarbage.map((item) => ({ ...item }));
    if (budget === 0 || queue.length === 0) return [];

    const taken: GarbageAttack[] = [];
    while (budget > 0 && queue.length > 0) {
      const head = queue[0];
      const take = Math.min(head.lines, budget);
      taken.push({ lines: take, hole: head.hole });
      head.lines -= take;
      budget -= take;
      if (head.lines === 0) queue.shift();
    }

    set({ pendingGarbage: queue, pendingGarbageLines: totalGarbageLines(queue) });
    return taken;
  },

  fetchLeaderboard: (mode: string) => {
    const socket = get().connectSocket();
    if (socket.connected) {
      socket.emit('get_leaderboard', { mode });
    } else {
      socket.once('connect', () => {
        socket.emit('get_leaderboard', { mode });
      });
    }
  },

  submitScore: (name: string, score: number, lines: number, mode: string) => {
    const socket = get().connectSocket();
    if (socket.connected) {
      socket.emit('submit_score', { name, score, lines, mode });
    } else {
      socket.once('connect', () => {
        socket.emit('submit_score', { name, score, lines, mode });
      });
    }
  },
}));

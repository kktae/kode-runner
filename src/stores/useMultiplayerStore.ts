import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { PlayerGameState } from '../types/network';

export type RoomStatus = 'IDLE' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

export interface ChatMessage {
  sender: string;
  socketId: string;
  message: string;
  timestamp: number;
}

interface MultiplayerStore {
  roomId: string | null;
  status: RoomStatus;
  nickname: string;
  opponentNickname: string | null;
  isReady: boolean;
  opponentReady: boolean;
  opponentState: PlayerGameState | null;
  pendingGarbageLines: number;
  gameSeed: number | null;
  gameWinner: 'ME' | 'OPPONENT' | null;
  chatMessages: ChatMessage[];

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
  clearPendingGarbage: () => void;
  fetchLeaderboard: (mode: string) => void;
  submitScore: (name: string, score: number, lines: number, mode: string) => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  roomId: null,
  status: 'IDLE',
  nickname: '',
  opponentNickname: null,
  isReady: false,
  opponentReady: false,
  opponentState: null,
  pendingGarbageLines: 0,
  gameSeed: null,
  gameWinner: null,
  chatMessages: [],
  socket: null,

  connectSocket: () => {
    let { socket } = get();
    if (!socket || !socket.connected) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
      socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socket.on('leaderboard_data', (data: { mode: any; entries: any[] }) => {
        if (data && data.mode && Array.isArray(data.entries)) {
          window.dispatchEvent(new CustomEvent('leaderboard_updated', { detail: data }));
        }
      });

      socket.on('leaderboard_update', (data: { mode: any; entries: any[] }) => {
        if (data && data.mode && Array.isArray(data.entries)) {
          window.dispatchEvent(new CustomEvent('leaderboard_updated', { detail: data }));
        }
      });

      socket.on('room_info', (data: { roomId: string; players: { nickname: string; socketId: string; isReady: boolean }[] }) => {
        const curSocket = get().socket;
        const mySocketId = curSocket ? curSocket.id : null;
        const me = data.players.find((p) => p.socketId === mySocketId);
        const opponent = data.players.find((p) => p.socketId !== mySocketId);

        set({
          roomId: data.roomId,
          opponentNickname: opponent ? opponent.nickname : null,
          isReady: me ? me.isReady : false,
          opponentReady: opponent ? opponent.isReady : false,
          status: get().status === 'PLAYING' ? 'PLAYING' : 'WAITING',
        });
      });

      socket.on('game_start', (data: { seed: number; startTime: number; players: { nickname: string; socketId: string }[] }) => {
        const curSocket = get().socket;
        const mySocketId = curSocket ? curSocket.id : null;
        const opponent = data.players.find((p) => p.socketId !== mySocketId);

        set({
          status: 'PLAYING',
          isReady: false,
          opponentReady: false,
          pendingGarbageLines: 0,
          gameSeed: data.seed,
          gameWinner: null,
          opponentNickname: opponent ? opponent.nickname : get().opponentNickname,
        });
      });

      socket.on('state_sync', (state: PlayerGameState) => {
        if (state.isGameOver && get().status === 'PLAYING') {
          // 상대방이 먼저 KO 되었으므로 내가 승리!
          set({ opponentState: state, gameWinner: 'ME', status: 'GAME_OVER' });
        } else {
          set({ opponentState: state });
        }
      });

      socket.on('game_over', () => {
        if (get().status === 'PLAYING') {
          set({ gameWinner: 'ME', status: 'GAME_OVER' });
        }
      });

      socket.on('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
        set((s) => ({ pendingGarbageLines: s.pendingGarbageLines + data.linesCount }));
      });

      socket.on('chat_message', (msg: ChatMessage) => {
        set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
      });

      socket.on('opponent_left', () => {
        if (get().status === 'PLAYING') {
          set({ gameWinner: 'ME', status: 'GAME_OVER', opponentNickname: null, opponentState: null, opponentReady: false });
        } else {
          set({ opponentNickname: null, opponentState: null, opponentReady: false, status: 'WAITING' });
        }
      });

      socket.on('quick_match_assigned', (data: { roomId: string }) => {
        const myNick = get().nickname;
        get().joinRoom(data.roomId, myNick);
      });

      set({ socket });
    }
    return socket;
  },

  requestQuickMatch: (nickname: string) => {
    set({ nickname, status: 'CONNECTING', opponentNickname: null, opponentState: null, isReady: false, opponentReady: false, gameWinner: null, chatMessages: [] });
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
    set({ roomId, nickname, status: 'CONNECTING', opponentNickname: null, opponentState: null, isReady: false, opponentReady: false, gameWinner: null, chatMessages: [] });
    const socket = get().connectSocket();

    const doJoin = () => {
      socket.emit('join_room', { roomId, nickname });
      set({ status: 'WAITING' });
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
    const { socket } = get();
    if (socket) {
      socket.emit('leave_room');
    }
    set({
      roomId: null,
      status: 'IDLE',
      opponentNickname: null,
      opponentState: null,
      isReady: false,
      opponentReady: false,
      pendingGarbageLines: 0,
      gameWinner: null,
      gameSeed: null,
      chatMessages: [],
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
    const { socket } = get();
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

  clearPendingGarbage: () => {
    set({ pendingGarbageLines: 0 });
  },

  fetchLeaderboard: (mode: string) => {
    const socket = get().connectSocket();
    if (socket && socket.connected) {
      socket.emit('get_leaderboard', { mode });
    } else {
      socket.once('connect', () => {
        socket.emit('get_leaderboard', { mode });
      });
    }
  },

  submitScore: (name: string, score: number, lines: number, mode: string) => {
    const socket = get().connectSocket();
    if (socket && socket.connected) {
      socket.emit('submit_score', { name, score, lines, mode });
    } else {
      socket.once('connect', () => {
        socket.emit('submit_score', { name, score, lines, mode });
      });
    }
  },
}));

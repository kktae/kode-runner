import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { PlayerGameState } from '../types/network';

export type RoomStatus = 'IDLE' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

interface MultiplayerStore {
  roomId: string | null;
  status: RoomStatus;
  nickname: string;
  opponentNickname: string | null;
  opponentState: PlayerGameState | null;
  pendingGarbageLines: number;

  socket: Socket | null;

  connectSocket: () => Socket;
  requestQuickMatch: (nickname: string) => void;
  joinRoom: (roomId: string, nickname: string) => void;
  leaveRoom: () => void;
  sendStateSync: (state: PlayerGameState) => void;
  sendGarbageAttack: (linesCount: number, holePosition: number) => void;
  clearPendingGarbage: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  roomId: null,
  status: 'IDLE',
  nickname: '',
  opponentNickname: null,
  opponentState: null,
  pendingGarbageLines: 0,
  socket: null,

  connectSocket: () => {
    let { socket } = get();
    if (!socket || !socket.connected) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
      socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socket.on('room_info', (data: { roomId: string; players: { nickname: string; socketId: string }[] }) => {
        const myNick = get().nickname;
        const opponent = data.players.find((p) => p.nickname !== myNick);
        set({
          roomId: data.roomId,
          opponentNickname: opponent ? opponent.nickname : null,
          status: data.players.length >= 2 ? 'PLAYING' : 'WAITING',
        });
      });

      socket.on('game_start', (data: { seed: number; startTime: number; players: { nickname: string; socketId: string }[] }) => {
        const myNick = get().nickname;
        const opponent = data.players.find((p) => p.nickname !== myNick);
        set({
          status: 'PLAYING',
          pendingGarbageLines: 0,
          opponentNickname: opponent ? opponent.nickname : get().opponentNickname,
        });
      });

      socket.on('state_sync', (state: PlayerGameState) => {
        set({ opponentState: state });
      });

      socket.on('attack_garbage', (data: { linesCount: number; holePosition: number }) => {
        set((s) => ({ pendingGarbageLines: s.pendingGarbageLines + data.linesCount }));
      });

      socket.on('opponent_left', () => {
        set({ opponentNickname: null, opponentState: null, status: 'GAME_OVER' });
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
    set({ nickname, status: 'CONNECTING', opponentNickname: null, opponentState: null });
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
    set({ roomId, nickname, status: 'CONNECTING', opponentNickname: null, opponentState: null });
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
      pendingGarbageLines: 0,
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

  clearPendingGarbage: () => {
    set({ pendingGarbageLines: 0 });
  },
}));

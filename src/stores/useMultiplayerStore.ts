import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Packet, PlayerGameState } from '../types/network';

export type RoomStatus = 'IDLE' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

interface MultiplayerStore {
  // Room State
  roomId: string | null;
  status: RoomStatus;
  nickname: string;
  opponentNickname: string | null;
  opponentState: PlayerGameState | null;
  pendingGarbageLines: number;

  // Socket.io Client Instance
  socket: Socket | null;

  // Actions
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

  joinRoom: (roomId: string, nickname: string) => {
    // 기존 소켓 연결 정리
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.disconnect();
    }

    set({ status: 'CONNECTING', roomId, nickname });

    // 표준 백엔드 서버 URL (Cloud Run 호스팅 URL 등)
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      query: { roomId, nickname },
    });

    socket.on('connect', () => {
      set({ status: 'WAITING' });
      const joinPacket: Packet = {
        type: 'JOIN_ROOM',
        payload: { nickname },
      };
      socket.emit('packet', joinPacket);
    });

    socket.on('packet', (data: Packet) => {
      try {
        switch (data.type) {
          case 'JOIN_ROOM':
            set({ opponentNickname: data.payload.nickname });
            break;

          case 'GAME_START':
            set({ status: 'PLAYING', pendingGarbageLines: 0 });
            break;

          case 'STATE_SYNC':
            set({ opponentState: data.payload });
            break;

          case 'ATTACK_GARBAGE':
            set((state) => ({
              pendingGarbageLines: state.pendingGarbageLines + data.payload.linesCount,
            }));
            break;

          case 'GAME_OVER':
            set({ status: 'GAME_OVER' });
            break;
        }
      } catch (err) {
        console.error('Failed to handle socket packet:', err);
      }
    });

    socket.on('disconnect', () => {
      set({ status: 'IDLE', socket: null, roomId: null });
    });

    set({ socket });
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({
      socket: null,
      roomId: null,
      status: 'IDLE',
      opponentNickname: null,
      opponentState: null,
      pendingGarbageLines: 0,
    });
  },

  sendStateSync: (state: PlayerGameState) => {
    const { socket, status } = get();
    if (socket && status === 'PLAYING') {
      const packet: Packet = {
        type: 'STATE_SYNC',
        payload: state,
      };
      socket.emit('packet', packet);
    }
  },

  sendGarbageAttack: (linesCount: number, holePosition: number) => {
    const { socket, status } = get();
    if (socket && status === 'PLAYING') {
      const packet: Packet = {
        type: 'ATTACK_GARBAGE',
        payload: { linesCount, holePosition },
      };
      socket.emit('packet', packet);
    }
  },

  clearPendingGarbage: () => {
    set({ pendingGarbageLines: 0 });
  },
}));

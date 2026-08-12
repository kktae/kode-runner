import { create } from 'zustand';
import PartySocket from 'partysocket';
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

  // PartySocket Instance
  socket: PartySocket | null;

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
    // 기존 소켓 정리
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.close();
    }

    set({ status: 'CONNECTING', roomId, nickname });

    // PartyKit 호스트 설정 (환경변수 또는 default host)
    const host = import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999';

    const socket = new PartySocket({
      host,
      room: roomId,
    });

    socket.addEventListener('open', () => {
      set({ status: 'WAITING' });
      // JOIN_ROOM 패킷 전송
      const joinPacket: Packet = {
        type: 'JOIN_ROOM',
        payload: { nickname },
      };
      socket.send(JSON.stringify(joinPacket));
    });

    socket.addEventListener('message', (event) => {
      try {
        const packet: Packet = JSON.parse(event.data);

        switch (packet.type) {
          case 'JOIN_ROOM':
            set({ opponentNickname: packet.payload.nickname });
            break;

          case 'GAME_START':
            set({ status: 'PLAYING', pendingGarbageLines: 0 });
            break;

          case 'STATE_SYNC':
            set({ opponentState: packet.payload });
            break;

          case 'ATTACK_GARBAGE':
            // 상대방의 공격 수신 -> 쌓인 가비지 라인 카운트 증가
            set((state) => ({
              pendingGarbageLines: state.pendingGarbageLines + packet.payload.linesCount,
            }));
            break;

          case 'GAME_OVER':
            set({ status: 'GAME_OVER' });
            break;
        }
      } catch (err) {
        console.error('Failed to parse multiplayer message:', err);
      }
    });

    socket.addEventListener('close', () => {
      set({ status: 'IDLE', socket: null, roomId: null });
    });

    set({ socket });
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
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
      socket.send(JSON.stringify(packet));
    }
  },

  sendGarbageAttack: (linesCount: number, holePosition: number) => {
    const { socket, status } = get();
    if (socket && status === 'PLAYING') {
      const packet: Packet = {
        type: 'ATTACK_GARBAGE',
        payload: { linesCount, holePosition },
      };
      socket.send(JSON.stringify(packet));
    }
  },

  clearPendingGarbage: () => {
    set({ pendingGarbageLines: 0 });
  },
}));

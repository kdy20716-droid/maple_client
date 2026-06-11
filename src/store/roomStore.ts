import { create } from 'zustand';

export type GameMode = 'INDIVIDUAL' | 'COOP';
export type SlotStatus = 'PLAYER' | 'OPEN' | 'CLOSED';

export interface RoomSlot {
  id: number;
  status: SlotStatus;
  playerName?: string;
}

export interface RoomInfo {
  id: string;
  title: string;
  mode: GameMode;
  slots: RoomSlot[];
}

interface RoomState {
  rooms: RoomInfo[];
  currentRoom: RoomInfo | null;
  
  createRoom: (title: string, mode: GameMode) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  toggleSlot: (slotId: number) => void;
  setMode: (mode: GameMode) => void;
}

// 더미 방 데이터 20개 생성 (페이징 테스트용)
const generateDummyRooms = (): RoomInfo[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `room-${i}`,
    title: `초보만 오세요 ${i + 1}`,
    mode: i % 2 === 0 ? 'INDIVIDUAL' : 'COOP',
    slots: [
      { id: 1, status: 'PLAYER', playerName: `Host${i}` },
      { id: 2, status: 'OPEN' },
      { id: 3, status: 'CLOSED' },
      { id: 4, status: 'OPEN' },
    ]
  }));
};

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: generateDummyRooms(),
  currentRoom: null,

  createRoom: (title, mode) => {
    const newRoom: RoomInfo = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      mode,
      slots: [
        { id: 1, status: 'PLAYER', playerName: '나(방장)' },
        { id: 2, status: 'OPEN' },
        { id: 3, status: 'OPEN' },
        { id: 4, status: 'OPEN' },
      ]
    };
    set((state) => ({
      rooms: [newRoom, ...state.rooms],
      currentRoom: newRoom,
    }));
  },

  joinRoom: (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      set({ currentRoom: room });
    }
  },

  leaveRoom: () => set({ currentRoom: null }),

  toggleSlot: (slotId) => set((state) => {
    if (!state.currentRoom || slotId === 1) return {}; // 1번 방장 슬롯은 변경 불가
    const newSlots: RoomSlot[] = state.currentRoom.slots.map(slot => {
      if (slot.id === slotId) {
        if (slot.status === 'PLAYER') return slot; // 플레이어가 있으면 닫지 못하게 방어 (임시)
        return { ...slot, status: slot.status === 'OPEN' ? 'CLOSED' : 'OPEN' };
      }
      return slot;
    });
    return { currentRoom: { ...state.currentRoom, slots: newSlots } };
  }),

  setMode: (mode) => set((state) => {
    if (!state.currentRoom) return {};
    return { currentRoom: { ...state.currentRoom, mode } };
  }),
}));

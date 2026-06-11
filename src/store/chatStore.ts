import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  text: string;
  color?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isChatActive: boolean;
  addMessage: (text: string, color?: string) => void;
  removeMessage: (id: string) => void;
  setChatActive: (active: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isChatActive: false,
  
  addMessage: (text, color) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ messages: [...state.messages, { id, text, color }] }));
    
    // 5초 후 자동 삭제
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id)
      }));
    }, 5000);
  },
  
  removeMessage: (id) => set((state) => ({
    messages: state.messages.filter((m) => m.id !== id)
  })),
  setChatActive: (active) => set({ isChatActive: active }),
}));

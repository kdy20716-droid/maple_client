import { create } from 'zustand';

export type AppView = 'LOBBY' | 'ROOM' | 'GAME';

interface AppState {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'LOBBY',
  setView: (view) => set({ currentView: view }),
}));

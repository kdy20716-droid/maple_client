import { create } from 'zustand';

export type AppView = 'LOGIN' | 'LOBBY' | 'ROOM' | 'GAME';

interface AppState {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'LOGIN',
  setView: (view) => set({ currentView: view }),
}));

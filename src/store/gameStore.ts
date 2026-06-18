import { create } from 'zustand';

interface GameState {
  gold: number;
  wave: number;
  stageTimeLeft: number; // 남은 시간 (초 단위)
  monsterCount: number;
  maxMonsterCount: number;
  killCount: number;
  isGameOver: boolean;
  upgrades: {
    Warrior: number;
    Mage: number;
    Archer: number;
  };
  gameSpeed: number; // 기본 2배속, 4배속 조절 가능
  isBgmOff: boolean;
  isSfxOff: boolean;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  nextWave: () => void;
  tickStageTime: (amount: number) => void;
  addMonster: () => void;
  removeMonster: () => void;
  recordKill: () => void;
  upgradeClass: (unitClass: 'Warrior' | 'Mage' | 'Archer') => void;
  setGameSpeed: (speed: number) => void;
  setBgmOff: (off: boolean) => void;
  setSfxOff: (off: boolean) => void;
  resetGame: () => void;
}

let accumulatedTime = 0;

export const useGameStore = create<GameState>((set, get) => ({
  gold: 20, 
  wave: 1,
  stageTimeLeft: 140, // 2분 20초 (140초)
  monsterCount: 0,
  maxMonsterCount: 80,
  killCount: 0,
  isGameOver: false,
  upgrades: {
    Warrior: 0,
    Mage: 0,
    Archer: 0,
  },
  gameSpeed: 2, // 기본 2배속
  isBgmOff: false,
  isSfxOff: false,
  
  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  
  spendGold: (amount) => {
    if (get().gold >= amount) {
      set((state) => ({ gold: state.gold - amount }));
      return true;
    }
    return false;
  },
  
  nextWave: () => {
    accumulatedTime = 0;
    set((state) => ({ wave: state.wave + 1, stageTimeLeft: 140 }));
  },
  
  tickStageTime: (amount) => {
    accumulatedTime += amount;
    if (accumulatedTime >= 1.0) {
      const secondsPassed = Math.floor(accumulatedTime);
      accumulatedTime -= secondsPassed;
      
      const nextTime = Math.max(0, get().stageTimeLeft - secondsPassed);
      if (nextTime <= 0) {
        accumulatedTime = 0;
        set((state) => ({
          wave: state.wave + 1,
          stageTimeLeft: 140
        }));
      } else {
        set({ stageTimeLeft: nextTime });
      }
    }
  },
  
  addMonster: () => {
    const nextCount = get().monsterCount + 1;
    if (nextCount >= get().maxMonsterCount) {
      set({ monsterCount: nextCount, isGameOver: true });
    } else {
      set({ monsterCount: nextCount });
    }
  },
  
  removeMonster: () => set((state) => ({ monsterCount: Math.max(0, state.monsterCount - 1) })),

  recordKill: () => {
    const nextKills = get().killCount + 1;
    if (nextKills % 5 === 0) {
      get().addGold(5);
    }
    set({ killCount: nextKills });
    get().removeMonster();
  },
  
  upgradeClass: (unitClass) => {
    const cost = unitClass === 'Archer' ? 5 : 10;
    if (get().spendGold(cost)) {
      set((state) => ({
        upgrades: {
          ...state.upgrades,
          [unitClass]: state.upgrades[unitClass] + 1
        }
      }));
    }
  },

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  setBgmOff: (off) => set({ isBgmOff: off }),
  setSfxOff: (off) => set({ isSfxOff: off }),

  resetGame: () => {
    accumulatedTime = 0;
    set({
      gold: 20,
      wave: 1,
      stageTimeLeft: 140,
      monsterCount: 0,
      killCount: 0,
      isGameOver: false,
      upgrades: { Warrior: 0, Mage: 0, Archer: 0 },
      gameSpeed: 2,
      isBgmOff: false,
      isSfxOff: false
    });
  }
}));

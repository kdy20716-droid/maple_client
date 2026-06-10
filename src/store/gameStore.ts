import { create } from 'zustand';

interface GameState {
  gold: number;
  wave: number;
  monsterCount: number;
  maxMonsterCount: number;
  killCount: number;
  isGameOver: boolean;
  upgrades: {
    Warrior: number;
    Mage: number;
    Archer: number;
  };
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  nextWave: () => void;
  addMonster: () => void;
  removeMonster: () => void;
  recordKill: () => void;
  upgradeClass: (unitClass: 'Warrior' | 'Mage' | 'Archer') => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gold: 20, 
  wave: 1,
  monsterCount: 0,
  maxMonsterCount: 80,
  killCount: 0,
  isGameOver: false,
  upgrades: {
    Warrior: 0,
    Mage: 0,
    Archer: 0,
  },
  
  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  
  spendGold: (amount) => {
    if (get().gold >= amount) {
      set((state) => ({ gold: state.gold - amount }));
      return true;
    }
    return false;
  },
  
  nextWave: () => set((state) => ({ wave: state.wave + 1 })),
  
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

  resetGame: () => set({
    gold: 20,
    wave: 1,
    monsterCount: 0,
    killCount: 0,
    isGameOver: false,
    upgrades: { Warrior: 0, Mage: 0, Archer: 0 }
  })
}));

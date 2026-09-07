import { create } from 'zustand';
import type { UnitClass } from '../types/game';
import { isBossStage } from '../utils/monsterUtils';

interface GameState {
  mineral: number; // 미네랄 (뽑기/교환/판매)
  gas: number;     // 가스 (업그레이드 전용)
  wave: number;
  maxWave: number;
  stageTimeLeft: number; // 남은 시간 (초 단위)
  monsterCount: number;
  maxMonsterCount: number; // 스타 원작 기준 100마리
  killCount: number;
  comboCount: number;
  isGameOver: boolean;
  isGameWon: boolean;
  tickets: {
    Artifact: number;  // 유물 선택권
    Narrative: number; // 서사 선택권
    Legendary: number; // 전설 선택권
  };
  upgrades: {
    Ghost: number;
    Dragoon: number;
    Hydra: number;
  };
  gameSpeed: number; // 2배속, 4배속
  isBgmOff: boolean;
  isSfxOff: boolean;

  // 재화 조작
  addMineral: (amount: number) => void;
  spendMineral: (amount: number) => boolean;
  addGas: (amount: number) => void;
  spendGas: (amount: number) => boolean;

  // 구버전 호환용 gold alias
  gold: number;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;

  nextWave: () => void;
  tickStageTime: (amount: number) => void;
  addMonster: () => void;
  removeMonster: () => void;
  recordKill: () => { combo: number; gasEarned: number; bonusMineral: number };

  // 업그레이드
  getUpgradeCost: (unitClass: UnitClass) => number; // 가스 비용 반환
  upgradeClass: (unitClass: UnitClass) => boolean;
  calculateUnitDamage: (baseDamage: number, unitClass: UnitClass) => number;

  // 선택권
  addTicket: (ticket: 'Artifact' | 'Narrative' | 'Legendary') => void;
  consumeTicket: (ticket: 'Artifact' | 'Narrative' | 'Legendary') => boolean;

  // 환전 (미네랄 -> 가스 1:1)
  exchangeMineralForGas: (mineralAmount: number) => boolean;

  setGameSpeed: (speed: number) => void;
  setBgmOff: (off: boolean) => void;
  setSfxOff: (off: boolean) => void;
  setGameWon: (won: boolean) => void;
  resetGame: () => void;
}

let accumulatedTime = 0;
let lastKillTimestamp = 0;

export const useGameStore = create<GameState>((set, get) => ({
  mineral: 100, // 스타 메운디 시작 미네랄 100
  gas: 0,
  gold: 100, // 호환용
  wave: 1,
  maxWave: 150,
  stageTimeLeft: 100, // 메운디 9.0 기준 일반 타이머 100초 (보스 140초)
  monsterCount: 0,
  maxMonsterCount: 100, // 원작 100마리 라인사
  killCount: 0,
  comboCount: 0,
  isGameOver: false,
  isGameWon: false,
  tickets: {
    Artifact: 0,
    Narrative: 0,
    Legendary: 0,
  },
  upgrades: {
    Ghost: 0,
    Dragoon: 0,
    Hydra: 0,
  },
  gameSpeed: 2,
  isBgmOff: false,
  isSfxOff: false,

  addMineral: (amount) => set((state) => ({ 
    mineral: state.mineral + amount, 
    gold: state.gold + amount 
  })),

  spendMineral: (amount) => {
    if (get().mineral >= amount) {
      set((state) => ({ 
        mineral: state.mineral - amount, 
        gold: state.gold - amount 
      }));
      return true;
    }
    return false;
  },

  addGas: (amount) => set((state) => ({ gas: state.gas + amount })),

  spendGas: (amount) => {
    if (get().gas >= amount) {
      set((state) => ({ gas: state.gas - amount }));
      return true;
    }
    return false;
  },

  // 호환용 골드 함수
  addGold: (amount) => get().addMineral(amount),
  spendGold: (amount) => get().spendMineral(amount),

  nextWave: () => {
    accumulatedTime = 0;
    const current = get().wave;
    if (current >= get().maxWave) {
      set({ isGameWon: true });
      return;
    }
    const nextW = current + 1;
    const timer = isBossStage(nextW) ? 140 : 100;
    set({ wave: nextW, stageTimeLeft: timer });
  },

  tickStageTime: (amount) => {
    accumulatedTime += amount;
    if (accumulatedTime >= 1.0) {
      const secondsPassed = Math.floor(accumulatedTime);
      accumulatedTime -= secondsPassed;

      const nextTime = Math.max(0, get().stageTimeLeft - secondsPassed);
      if (nextTime <= 0) {
        accumulatedTime = 0;
        const current = get().wave;
        if (isBossStage(current)) {
          // 보스 타임어택 제한시간 종료 -> 게임 오버
          set({ isGameOver: true, stageTimeLeft: 0 });
          return;
        }
        if (current >= get().maxWave) {
          set({ isGameWon: true });
        } else {
          const nextW = current + 1;
          const timer = isBossStage(nextW) ? 140 : 100;
          set({ wave: nextW, stageTimeLeft: timer });
        }
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
    const now = Date.now();
    const nextKills = get().killCount + 1;
    let nextCombo = 1;

    if (now - lastKillTimestamp < 3500) {
      nextCombo = get().comboCount + 1;
    }
    lastKillTimestamp = now;

    // 메운디 원작 가스 수급:
    // 1~61단계: 1가스
    // 62~130단계: 2가스
    // 131+단계: 3가스
    const wave = get().wave;
    const gasEarned = wave <= 61 ? 1 : wave <= 130 ? 2 : 3;
    get().addGas(gasEarned);

    // 콤보 보너스 미네랄
    let bonusMineral = 0;
    if (nextCombo === 10) bonusMineral = 5;
    else if (nextCombo === 25) bonusMineral = 15;
    else if (nextCombo === 50) bonusMineral = 35;
    else if (nextCombo === 100) bonusMineral = 100;
    else if (nextCombo > 100 && nextCombo % 50 === 0) bonusMineral = 50;

    if (bonusMineral > 0) {
      get().addMineral(bonusMineral);
    }

    set({ killCount: nextKills, comboCount: nextCombo });
    get().removeMonster();

    return { combo: nextCombo, gasEarned, bonusMineral };
  },

  getUpgradeCost: (unitClass: UnitClass) => {
    const currentLv = get().upgrades[unitClass] || 0;
    // 메운디 공식 업그레이드 비용 (가스 소모)
    // 고스트: 12 + lv * 3 가스
    // 드라군: 12 + lv * 3 가스
    // 히드라: 9 + lv * 2 가스
    if (unitClass === 'Hydra') {
      return 9 + currentLv * 2;
    }
    return 12 + currentLv * 3;
  },

  upgradeClass: (unitClass: UnitClass) => {
    const cost = get().getUpgradeCost(unitClass);
    if (get().spendGas(cost)) {
      set((state) => ({
        upgrades: {
          ...state.upgrades,
          [unitClass]: state.upgrades[unitClass] + 1,
        }
      }));
      return true;
    }
    return false;
  },

  calculateUnitDamage: (baseDamage: number, unitClass: UnitClass) => {
    const lv = get().upgrades[unitClass] || 0;
    // 스타크래프트 원작 공격력 증가 공식: 기본데미지 + (업글 레벨 * 업글당 추가 데미지)
    // 고스트: 업당 +4 데미지
    // 드라군: 업당 +3 데미지
    // 히드라: 업당 +2 데미지
    const addPerLv = unitClass === 'Ghost' ? 4 : unitClass === 'Dragoon' ? 3 : 2;
    return baseDamage + lv * addPerLv;
  },

  addTicket: (ticket) => set((state) => ({
    tickets: {
      ...state.tickets,
      [ticket]: state.tickets[ticket] + 1,
    }
  })),

  consumeTicket: (ticket) => {
    if (get().tickets[ticket] > 0) {
      set((state) => ({
        tickets: {
          ...state.tickets,
          [ticket]: state.tickets[ticket] - 1,
        }
      }));
      return true;
    }
    return false;
  },

  exchangeMineralForGas: (mineralAmount: number) => {
    if (get().spendMineral(mineralAmount)) {
      get().addGas(mineralAmount);
      return true;
    }
    return false;
  },

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  setBgmOff: (off) => set({ isBgmOff: off }),
  setSfxOff: (off) => set({ isSfxOff: off }),
  setGameWon: (won) => set({ isGameWon: won }),

  resetGame: () => {
    accumulatedTime = 0;
    lastKillTimestamp = 0;
    set({
      mineral: 100,
      gas: 0,
      gold: 100,
      wave: 1,
      maxWave: 150,
      stageTimeLeft: 100,
      monsterCount: 0,
      maxMonsterCount: 100,
      killCount: 0,
      comboCount: 0,
      isGameOver: false,
      isGameWon: false,
      tickets: { Artifact: 0, Narrative: 0, Legendary: 0 },
      upgrades: { Ghost: 0, Dragoon: 0, Hydra: 0 },
      gameSpeed: 2,
      isBgmOff: false,
      isSfxOff: false,
    });
  }
}));

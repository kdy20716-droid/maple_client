import { create } from 'zustand';
import type { Enemy, Position } from '../types/game';
import { useGameStore } from './gameStore';
import { useChatStore } from './chatStore';

interface EnemyState {
  enemies: Enemy[];
  spawnEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  updateEnemyPositions: (deltaTime: number, waypoints: Position[]) => void;
  damageEnemy: (id: string, damage: number) => void;
}

export const useEnemyStore = create<EnemyState>((set, get) => ({
  enemies: [],

  spawnEnemy: (enemy) => {
    set((state) => ({ enemies: [...state.enemies, enemy] }));
    useGameStore.getState().addMonster();
  },

  removeEnemy: (id) => set((state) => ({ 
    enemies: state.enemies.filter((e) => e.id !== id) 
  })),

  updateEnemyPositions: (deltaTime, waypoints) => {
    set((state) => ({
      enemies: state.enemies.map((enemy) => {
        const target = waypoints[enemy.waypointIndex];
        if (!target) return enemy;

        const dx = target.x - enemy.position.x;
        const dy = target.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          const nextIndex = (enemy.waypointIndex + 1) % waypoints.length;
          return { ...enemy, waypointIndex: nextIndex };
        }

        const moveDist = enemy.speed * deltaTime;
        const ratio = Math.min(1, moveDist / distance);

        return {
          ...enemy,
          position: {
            x: enemy.position.x + dx * ratio,
            y: enemy.position.y + dy * ratio,
          },
        };
      }),
    }));
  },

  damageEnemy: (id, damage) => {
    const enemy = get().enemies.find(e => e.id === id);
    if (!enemy) return;

    let remainingDamage = damage;
    let newShield = enemy.shield;
    let newHp = enemy.hp;

    if (newShield > 0) {
      const shieldDamage = Math.min(newShield, remainingDamage);
      newShield -= shieldDamage;
      remainingDamage -= shieldDamage;
    }

    if (remainingDamage > 0) {
      newHp = Math.max(0, newHp - remainingDamage);
    }

    if (newHp <= 0) {
      const isBoss = !!(enemy as any).isBoss;
      set((state) => ({ enemies: state.enemies.filter(e => e.id !== id) }));
      useGameStore.getState().recordKill();

      if (enemy.reward > 0) {
        useGameStore.getState().addGold(enemy.reward);
      }

      if (isBoss) {
        const game = useGameStore.getState();
        const chat = useChatStore.getState();
        const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        chat.addMessage(sep, '#ffd700');
        chat.addMessage(`🏆 [보스 격파 대성공!] ${enemy.name}을(를) 격파했습니다!`, '#ffd700');
        chat.addMessage(`💎 보스 보상: +${enemy.reward} 미네랄 획득!`, '#38bdf8');

        if (enemy.bossTicket) {
          game.addTicket(enemy.bossTicket);
          const tName = enemy.bossTicket === 'Artifact' ? '유물' : enemy.bossTicket === 'Narrative' ? '서사' : '전설';
          chat.addMessage(`🎫 [보스 특전] [★ ${tName} 유닛 선택권 ★]을 획득했습니다! (뽑기 창에서 사용)`, '#fbbf24');
        }

        chat.addMessage(sep, '#ffd700');

        if (game.wave >= game.maxWave) {
          game.setGameWon(true);
        } else {
          game.nextWave();
        }
      }
    } else {
      set((state) => ({
        enemies: state.enemies.map(e => e.id === id ? { ...e, hp: newHp, shield: newShield } : e)
      }));
    }
  }
}));

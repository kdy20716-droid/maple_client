import type { Enemy, Position, MonsterSize, AttackType } from '../types/game';
import { generateId } from './gachaUtils';

export interface MonsterTemplate {
  name: string;
  emoji: string;
  baseHp: number;
  speed: number;
  reward: number; // 미네랄
  size: MonsterSize; // 소형, 중형, 대형
  armor: number; // 방어력
  isBoss?: boolean;
  bossTicket?: 'Artifact' | 'Narrative' | 'Legendary';
}

// 메운디 정통 공식 보스 라운드 (24, 37, 52, 79, 90, 95, 100 + 115, 130, 140, 150)
export const BOSS_STAGES = [24, 37, 52, 79, 90, 95, 100, 115, 130, 140, 150] as const;

export const isBossStage = (wave: number): boolean => {
  return BOSS_STAGES.includes(wave as any);
};

// 메운디 원작 고증 보스 데이터
export const BOSS_DATA: Record<number, MonsterTemplate> = {
  24: {
    name: '👑 [BOSS] 크림슨 발록',
    emoji: '🦇',
    baseHp: 6500,
    speed: 0.75,
    reward: 50,
    size: 'Small', // 소형 보스 (고스트 특화)
    armor: 4,
    isBoss: true,
    bossTicket: 'Artifact',
  },
  37: {
    name: '👑 [BOSS] 피아누스',
    emoji: '🐟',
    baseHp: 28000,
    speed: 0.7,
    reward: 50,
    size: 'Medium', // 중형 보스
    armor: 8,
    isBoss: true,
    bossTicket: 'Narrative',
  },
  52: {
    name: '👑 [BOSS] 파풀라투스 (1차 통곡의 벽)',
    emoji: '⏰',
    baseHp: 110000,
    speed: 0.8,
    reward: 50,
    size: 'Small', // 소형 건물 보스 (고스트/히드라 활약)
    armor: 14,
    isBoss: true,
    bossTicket: 'Narrative',
  },
  79: {
    name: '👑 [BOSS] 자쿰 (2차 통곡의 벽)',
    emoji: '👺',
    baseHp: 380000,
    speed: 0.85,
    reward: 70,
    size: 'Large', // 대형 보스 (드라군 폭딜)
    armor: 22,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  90: {
    name: '👑 [BOSS] 혼테일',
    emoji: '🐉',
    baseHp: 950000,
    speed: 0.8,
    reward: 100,
    size: 'Large', // 대형 보스
    armor: 30,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  95: {
    name: '👑 [BOSS] 핑크빈 (실드 관문)',
    emoji: '🐷',
    baseHp: 1800000,
    speed: 0.75,
    reward: 150,
    size: 'Medium',
    armor: 35,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  100: {
    name: '👑 [BOSS] 시그너스 여제',
    emoji: '👑',
    baseHp: 3200000,
    speed: 0.8,
    reward: 100,
    size: 'Medium',
    armor: 40,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  115: {
    name: '👑 [BOSS] 매그너스',
    emoji: '⚔️',
    baseHp: 5500000,
    speed: 0.85,
    reward: 150,
    size: 'Medium',
    armor: 50,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  130: {
    name: '👑 [BOSS] 힐라',
    emoji: '🧙',
    baseHp: 9000000,
    speed: 0.8,
    reward: 200,
    size: 'Medium',
    armor: 65,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  140: {
    name: '👑 [BOSS] 루시드',
    emoji: '🦋',
    baseHp: 14000000,
    speed: 0.85,
    reward: 250,
    size: 'Small',
    armor: 75,
    isBoss: true,
    bossTicket: 'Legendary',
  },
  150: {
    name: '👑 [FINAL BOSS] 검은 마법사',
    emoji: '🌌',
    baseHp: 22000000,
    speed: 0.7,
    reward: 500,
    size: 'Large', // 최종 보스 (대형)
    armor: 90,
    isBoss: true,
    bossTicket: 'Legendary',
  },
};

// 일반 몬스터 테마 기본군 (소형, 중형, 대형 상성 포함)
export const NORMAL_MONSTER_POOL: MonsterTemplate[] = [
  { name: '달팽이', emoji: '🐌', baseHp: 40, speed: 1.0, reward: 1, size: 'Small', armor: 0 },
  { name: '파란달팽이', emoji: '🐌', baseHp: 65, speed: 1.05, reward: 1, size: 'Small', armor: 0 },
  { name: '빨간달팽이', emoji: '🐌', baseHp: 95, speed: 1.1, reward: 1, size: 'Small', armor: 1 },
  { name: '슬라임', emoji: '🟢', baseHp: 130, speed: 1.15, reward: 1, size: 'Small', armor: 1 },
  { name: '주황버섯', emoji: '🍄', baseHp: 180, speed: 1.2, reward: 1, size: 'Medium', armor: 2 },
  { name: '리본돼지', emoji: '🐷', baseHp: 240, speed: 1.25, reward: 1, size: 'Medium', armor: 2 },
  { name: '초록버섯', emoji: '🍄', baseHp: 310, speed: 1.2, reward: 1, size: 'Medium', armor: 3 },
  { name: '뿔버섯', emoji: '🍄', baseHp: 390, speed: 1.3, reward: 1, size: 'Small', armor: 3 },
  { name: '옥토퍼스', emoji: '🐙', baseHp: 490, speed: 1.25, reward: 1, size: 'Small', armor: 4 },
  { name: '스티지', emoji: '🦇', baseHp: 600, speed: 1.4, reward: 1, size: 'Small', armor: 4 },
  { name: '와일드보어', emoji: '🐗', baseHp: 750, speed: 1.35, reward: 2, size: 'Medium', armor: 5 },
  { name: '스톤골렘', emoji: '🗿', baseHp: 950, speed: 0.95, reward: 2, size: 'Large', armor: 8 },
  { name: '커즈아이', emoji: '🦎', baseHp: 1200, speed: 1.3, reward: 2, size: 'Small', armor: 6 },
  { name: '루팡', emoji: '🐒', baseHp: 1500, speed: 1.35, reward: 2, size: 'Small', armor: 6 },
  { name: '좀비버섯', emoji: '🍄', baseHp: 1850, speed: 1.25, reward: 2, size: 'Medium', armor: 7 },
  { name: '다크스톤골렘', emoji: '🗿', baseHp: 2300, speed: 1.0, reward: 2, size: 'Large', armor: 10 },
  { name: '드레이크', emoji: '🐲', baseHp: 2900, speed: 1.3, reward: 3, size: 'Large', armor: 12 },
  { name: '콜드아이', emoji: '🦎', baseHp: 3600, speed: 1.35, reward: 3, size: 'Small', armor: 8 },
  { name: '아이스드레이크', emoji: '❄️', baseHp: 4500, speed: 1.3, reward: 3, size: 'Large', armor: 14 },
  { name: '타우로마시스', emoji: '🐂', baseHp: 5600, speed: 1.2, reward: 4, size: 'Large', armor: 18 },
];

export const getWaveMonsterTemplate = (wave: number): MonsterTemplate => {
  if (isBossStage(wave)) {
    return BOSS_DATA[wave];
  }

  const poolIndex = (wave - 1) % NORMAL_MONSTER_POOL.length;
  const baseTmpl = NORMAL_MONSTER_POOL[poolIndex];

  // 웨이브 계수: wave가 오를수록 체력 스케일링
  const waveScale = Math.pow(1.055, wave - 1);
  const hp = Math.floor(baseTmpl.baseHp * waveScale);
  const armor = Math.floor(baseTmpl.armor + wave * 0.4);

  return {
    name: `${baseTmpl.name} (W.${wave})`,
    emoji: baseTmpl.emoji,
    baseHp: hp,
    speed: baseTmpl.speed,
    reward: baseTmpl.reward,
    size: baseTmpl.size,
    armor,
  };
};

export const createEnemyForWave = (wave: number, spawnPos: Position): Enemy & { emoji: string; isBoss: boolean } => {
  const tmpl = getWaveMonsterTemplate(wave);
  const isBoss = isBossStage(wave);
  // 핑크빈은 50% 쉴드, 일반 보스는 30%, 일반몹은 30웨이브 이후부터 15% 쉴드
  const shieldRate = wave === 95 ? 0.5 : isBoss ? 0.3 : (wave > 30 ? 0.15 : 0);
  const shield = Math.floor(tmpl.baseHp * shieldRate);

  return {
    id: generateId(),
    name: tmpl.name,
    hp: tmpl.baseHp,
    maxHp: tmpl.baseHp,
    shield,
    maxShield: shield,
    armor: tmpl.armor,
    size: tmpl.size,
    speed: tmpl.speed,
    position: { ...spawnPos },
    reward: tmpl.reward,
    waypointIndex: 1,
    emoji: tmpl.emoji,
    isBoss,
    bossTicket: tmpl.bossTicket,
  };
};

// 스타크래프트 원작 공격 상성 및 데미지 계산 공식
export const calculateAuthenticDamage = (
  rawDamage: number,
  attackType: AttackType,
  targetSize: MonsterSize,
  targetArmor: number,
  hasShield: boolean
): { finalDamage: number; multiplier: number } => {
  let multiplier = 1.0;

  // 스타 쉴드 룰: 쉴드가 남아있을 때는 모든 공격이 100% 데미지
  if (!hasShield) {
    if (attackType === 'Concussive') {
      // 진동형 (고스트): 소형 100%, 중형 50%, 대형 25%
      multiplier = targetSize === 'Small' ? 1.0 : targetSize === 'Medium' ? 0.5 : 0.25;
    } else if (attackType === 'Explosive') {
      // 폭발형 (드라군): 소형 50%, 중형 75%, 대형 100%
      multiplier = targetSize === 'Large' ? 1.0 : targetSize === 'Medium' ? 0.75 : 0.5;
    } else {
      // 일반형 (히드라): 모든 크기 100%
      multiplier = 1.0;
    }
  }

  const effectiveDmg = Math.floor(rawDamage * multiplier);
  const finalDamage = Math.max(1, effectiveDmg - targetArmor);

  return { finalDamage, multiplier };
};

import type { UnitRarity, UnitClass, AttackType, Position } from '../types/game';

export const findSpawnPosition = (
  centerX: number,
  centerY: number,
  existingUnits: { position: Position }[],
  minDist = 34
): Position => {
  let attempts = 0;
  const maxAttempts = 150;
  let tx = centerX;
  let ty = centerY;
  let angle = 0;
  let radius = 0;

  while (attempts < maxAttempts) {
    const isOverlapping = existingUnits.some(u => {
      if (!u.position) return false;
      const dx = u.position.x - tx;
      const dy = u.position.y - ty;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });

    if (!isOverlapping) {
      return { x: tx, y: ty };
    }

    attempts++;
    angle += 0.5;
    radius = (attempts / 5) * minDist;
    tx = centerX + Math.cos(angle) * radius;
    ty = centerY + Math.sin(angle) * radius;
  }

  return { 
    x: centerX + (Math.random() * 20 - 10), 
    y: centerY + (Math.random() * 20 - 10) 
  };
};

export const RARITY_COLORS: Record<UnitRarity, string> = {
  Common: '#9ca3af',    // 일반 (회색)
  Rare: '#60a5fa',      // 레어 (파란색)
  Ancient: '#34d399',   // 고대 (초록색)
  Artifact: '#c084fc',  // 유물 (보라색)
  Narrative: '#f472b6', // 서사 (분홍색)
  Legendary: '#fb923c', // 전설 (주황색)
  Epic: '#38bdf8',      // 에픽 (하늘색 특수유닛)
  Mythic: '#ffd700',    // 신화 (황금색)
  Primeval: '#ff2222',  // 태초 (붉은색)
};

export const RARITY_LABELS: Record<UnitRarity, string> = {
  Common: '일반',
  Rare: '레어',
  Ancient: '고대',
  Artifact: '유물',
  Narrative: '서사',
  Legendary: '전설',
  Epic: '에픽',
  Mythic: '신화',
  Primeval: '태초',
};

// 메운디 공식 뽑기 확률 (%)
export const GACHA_RATES: Record<UnitRarity, number> = {
  Primeval: 0.06,
  Mythic: 0.31,
  Epic: 0.30,
  Legendary: 1.00,
  Narrative: 2.30,
  Artifact: 8.00,
  Ancient: 15.00,
  Rare: 33.00,
  Common: 40.03,
};

export const UNIT_CLASSES: UnitClass[] = ['Ghost', 'Dragoon', 'Hydra'];

export const CLASS_LABELS: Record<UnitClass, string> = {
  Ghost: '고스트 (진동형)',
  Dragoon: '드라군 (폭발형)',
  Hydra: '히드라 (일반형)',
};

export const CLASS_EMOJIS: Record<UnitClass, string> = {
  Ghost: '👻',
  Dragoon: '🤖',
  Hydra: '🦎',
};

export const getAttackType = (unitClass: UnitClass): AttackType => {
  switch (unitClass) {
    case 'Ghost': return 'Concussive';
    case 'Dragoon': return 'Explosive';
    case 'Hydra': return 'Normal';
  }
};

export const rollGacha = (): { rarity: UnitRarity; unitClass: UnitClass; attackType: AttackType } => {
  const rand = Math.random() * 100;
  let cumulative = 0;

  const rarities: UnitRarity[] = [
    'Primeval', 'Mythic', 'Epic', 'Legendary', 'Narrative', 'Artifact', 'Ancient', 'Rare', 'Common'
  ];

  let pickedRarity: UnitRarity = 'Common';
  for (const r of rarities) {
    cumulative += GACHA_RATES[r];
    if (rand < cumulative) {
      pickedRarity = r;
      break;
    }
  }

  const unitClass = UNIT_CLASSES[Math.floor(Math.random() * UNIT_CLASSES.length)];
  return {
    rarity: pickedRarity,
    unitClass,
    attackType: getAttackType(unitClass),
  };
};

export const getBaseStats = (rarity: UnitRarity, unitClass: UnitClass) => {
  const attackType = getAttackType(unitClass);
  let damage = 10;
  let attackSpeed = 0.8;
  let range = 240;

  if (rarity === 'Legendary' || rarity === 'Epic') {
    range = 280;
  } else if (rarity === 'Mythic' || rarity === 'Primeval') {
    range = 340;
  }

  if (unitClass === 'Ghost') {
    // 고스트 (진동형)
    const ghostDmg: Record<UnitRarity, number> = {
      Common: 8,
      Rare: 10,
      Ancient: 15,
      Artifact: 20,
      Narrative: 24,
      Legendary: 29,
      Epic: 32,
      Mythic: 38,
      Primeval: 40,
    };
    damage = ghostDmg[rarity];
    attackSpeed = 0.85;
  } else if (unitClass === 'Dragoon') {
    // 드라군 (폭발형 - 상위 등급일수록 공속 대폭 상승)
    const dragoonDmg: Record<UnitRarity, number> = {
      Common: 6,
      Rare: 8,
      Ancient: 12,
      Artifact: 16,
      Narrative: 20,
      Legendary: 27,
      Epic: 30,
      Mythic: 33,
      Primeval: 36,
    };
    damage = dragoonDmg[rarity];
    if (rarity === 'Common' || rarity === 'Rare') attackSpeed = 0.9;
    else if (rarity === 'Ancient' || rarity === 'Artifact' || rarity === 'Narrative') attackSpeed = 0.65;
    else if (rarity === 'Legendary' || rarity === 'Epic') attackSpeed = 0.5;
    else attackSpeed = 0.35; // Mythic, Primeval
  } else {
    // 히드라 (일반형 - 모든 크기 100% 빠른 공속)
    const hydraDmg: Record<UnitRarity, number> = {
      Common: 3,
      Rare: 4,
      Ancient: 6,
      Artifact: 8,
      Narrative: 10,
      Legendary: 14,
      Epic: 15,
      Mythic: 17,
      Primeval: 22,
    };
    damage = hydraDmg[rarity];
    attackSpeed = 0.45;
  }

  return { damage, attackSpeed, range, attackType };
};

// 유닛 판매 시 미네랄 환급
export const getUnitSellValue = (rarity: UnitRarity): number => {
  const sellTable: Record<UnitRarity, number> = {
    Common: 1,
    Rare: 2,
    Ancient: 4,
    Artifact: 8,
    Narrative: 16,
    Legendary: 35,
    Epic: 50,
    Mythic: 100,
    Primeval: 200,
  };
  return sellTable[rarity];
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

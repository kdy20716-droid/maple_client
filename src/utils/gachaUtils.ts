import type { UnitRarity, UnitClass } from '../types/game';

export const RARITY_COLORS: Record<UnitRarity, string> = {
  Normal: '#9ca3af',
  Rare: '#60a5fa',
  Epic: '#c084fc',
  Unique: '#f472b6',
  Legendary: '#fb923c',
  Hero: '#22d3ee',
  Mythic: '#fbbf24',
  Primeval: '#f87171',
  Apocalypse: '#a5b4fc',
};

export const RARITY_LABELS: Record<UnitRarity, string> = {
  Normal: '일반',
  Rare: '레어',
  Epic: '에픽',
  Unique: '유니크',
  Legendary: '레전더리',
  Hero: '영웅',
  Mythic: '신화',
  Primeval: '태초',
  Apocalypse: '종말',
};

const GACHA_RATES: Record<UnitRarity, number> = {
  Normal: 50.0,
  Rare: 25.0,
  Epic: 12.0,
  Unique: 6.0,
  Legendary: 4.0,
  Hero: 2.0,
  Mythic: 0.9,
  Primeval: 0.09,
  Apocalypse: 0.01,
};

const UNIT_CLASSES: UnitClass[] = ['Warrior', 'Mage', 'Archer'];

export const rollGacha = (): { rarity: UnitRarity, unitClass: UnitClass } => {
  const rand = Math.random() * 100;
  let cumulative = 0;

  const rarities: UnitRarity[] = [
    'Apocalypse', 'Primeval', 'Mythic', 'Hero', 'Legendary', 'Unique', 'Epic', 'Rare', 'Normal'
  ];

  for (const r of rarities) {
    cumulative += GACHA_RATES[r];
    if (rand < cumulative) {
      return { rarity: r, unitClass: UNIT_CLASSES[Math.floor(Math.random() * UNIT_CLASSES.length)] };
    }
  }

  return { rarity: 'Normal', unitClass: UNIT_CLASSES[Math.floor(Math.random() * UNIT_CLASSES.length)] };
};

export const getBaseStats = (rarity: UnitRarity, unitClass: UnitClass) => {
  let baseDamage = 10;
  let attackSpeed = 1.0;
  let range = 200;

  // 등급별 스탯 설정
  switch (rarity) {
    case 'Apocalypse':
      baseDamage = 50000;
      attackSpeed = 0.3;
      range = 600;
      break;
    case 'Primeval':
      baseDamage = 10000;
      attackSpeed = 0.4;
      range = 500;
      break;
    case 'Mythic':
      baseDamage = 3000;
      attackSpeed = 0.5;
      range = 400;
      break;
    case 'Hero':
      baseDamage = 1000;
      attackSpeed = 0.6;
      range = 350;
      break;
    case 'Legendary':
      baseDamage = 400;
      attackSpeed = 0.7;
      range = 300;
      break;
    case 'Unique':
      baseDamage = 150;
      attackSpeed = 0.8;
      range = 280;
      break;
    case 'Epic':
      baseDamage = 60;
      attackSpeed = 0.9;
      range = 260;
      break;
    case 'Rare':
      baseDamage = 25;
      attackSpeed = 1.0;
      range = 240;
      break;
    case 'Normal':
      baseDamage = 10;
      attackSpeed = 1.2;
      range = 220;
      break;
  }

  // 직업별 특성
  switch (unitClass) {
    case 'Warrior': baseDamage *= 1.5; break;
    case 'Mage': attackSpeed *= 0.8; break; 
    case 'Archer': range += 50; break;
  }

  return { damage: Math.floor(baseDamage), attackSpeed, range };
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

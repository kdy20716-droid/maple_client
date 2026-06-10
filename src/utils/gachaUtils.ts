import type { UnitRarity, UnitClass } from '../types/game';

const GACHA_RATES = {
  Normal: 50.0,
  Rare: 35.0,
  Ancient: 14.0,
  Legendary: 1.0,
};

const UNIT_CLASSES: UnitClass[] = ['Warrior', 'Mage', 'Archer'];

export const rollGacha = (): { rarity: UnitRarity, unitClass: UnitClass } => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let rarity: UnitRarity = 'Normal';

  if (rand < (cumulative += GACHA_RATES.Legendary)) {
    rarity = 'Legendary';
  } else if (rand < (cumulative += GACHA_RATES.Ancient)) {
    rarity = 'Ancient';
  } else if (rand < (cumulative += GACHA_RATES.Rare)) {
    rarity = 'Rare';
  } else {
    rarity = 'Normal';
  }

  const unitClass = UNIT_CLASSES[Math.floor(Math.random() * UNIT_CLASSES.length)];
  
  return { rarity, unitClass };
};

export const getBaseStats = (rarity: UnitRarity, unitClass: UnitClass) => {
  let baseDamage = 10;
  let attackSpeed = 1.0;
  let range = 200;

  // 등급별 사거리 및 스탯 설정 (모든 직업 공통 사거리)
  switch (rarity) {
    case 'Legendary': 
      baseDamage = 100; 
      attackSpeed = 0.5; 
      range = 400; 
      break;
    case 'Ancient': 
      baseDamage = 50; 
      attackSpeed = 0.8; 
      range = 300; 
      break;
    case 'Rare': 
      baseDamage = 20; 
      attackSpeed = 1.0; 
      range = 250; 
      break;
    case 'Normal': 
      baseDamage = 10; 
      attackSpeed = 1.2; 
      range = 200; 
      break;
  }

  // 직업별 특성 (데미지/공속 차이만 둠)
  switch (unitClass) {
    case 'Warrior': baseDamage *= 1.5; break;
    case 'Mage': attackSpeed *= 1.2; break;
    case 'Archer': break;
  }

  return { damage: Math.floor(baseDamage), attackSpeed, range };
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

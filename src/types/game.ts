export type UnitRarity = 'Normal' | 'Rare' | 'Ancient' | 'Legendary';
export type UnitClass = 'Warrior' | 'Mage' | 'Archer';

export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  name: string;
  rarity: UnitRarity;
  class: UnitClass;
  damage: number;
  attackSpeed: number;
  range: number;
  position: Position;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  position: Position;
  reward: number;
  waypointIndex: number;
}

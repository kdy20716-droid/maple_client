export type UnitRarity = 
  | 'Common'     // 일반
  | 'Rare'       // 레어
  | 'Ancient'    // 고대
  | 'Artifact'   // 유물
  | 'Narrative'  // 서사
  | 'Legendary'  // 전설
  | 'Epic'       // 에픽 (특수 유닛)
  | 'Mythic'     // 신화
  | 'Primeval';   // 태초

export type UnitClass = 'Ghost' | 'Dragoon' | 'Hydra'; // 고스트, 드라군, 히드라리스크

export type AttackType = 'Concussive' | 'Explosive' | 'Normal'; // 진동형, 폭발형, 일반형

export type MonsterSize = 'Small' | 'Medium' | 'Large'; // 소형, 중형, 대형

export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  name: string;
  rarity: UnitRarity;
  class: UnitClass;
  attackType: AttackType;
  damage: number;
  attackSpeed: number; // 초 단위 쿨타임
  range: number;
  position: Position;
  isGimmickUnit?: boolean;
  playerId?: number;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  armor: number; // 스타크래프트 방어력
  size: MonsterSize; // 소형, 중형, 대형
  speed: number;
  position: Position;
  reward: number; // 보상 미네랄
  waypointIndex: number;
  emoji?: string;
  isBoss?: boolean;
  bossTicket?: 'Artifact' | 'Narrative' | 'Legendary';
}

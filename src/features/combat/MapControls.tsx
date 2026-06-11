import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useChatStore } from '../../store/chatStore';
import { rollGacha, getBaseStats, generateId, RARITY_COLORS, RARITY_LABELS } from '../../utils/gachaUtils';
import type { UnitRarity } from '../../types/game';

interface MapControlsProps {
  x: number;
  y: number;
  playerIdx: number;
}

const MapControls: React.FC<MapControlsProps> = ({ x, y, playerIdx }) => {
  const { gold, spendGold, upgrades, upgradeClass, isGameOver } = useGameStore();
  const { addUnit } = useUnitStore();
  const { addMessage } = useChatStore();

  const GACHA_COST = 10;
  
  const handleGacha = () => {
    if (isGameOver) return;
    if (spendGold(GACHA_COST)) {
      const { rarity, unitClass } = rollGacha();
      const stats = getBaseStats(rarity, unitClass);
      const unitLabel = RARITY_LABELS[rarity];
      const unitName = `${unitLabel} ${unitClass}`;
      
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 40;
      const spawnX = x + Math.cos(angle) * dist;
      const spawnY = y + Math.sin(angle) * dist;
      
      addUnit({
        id: generateId(),
        name: unitName,
        rarity,
        class: unitClass,
        damage: stats.damage,
        attackSpeed: stats.attackSpeed,
        range: stats.range,
        position: { x: spawnX, y: spawnY },
      });

      if (playerIdx === 0) {
        const specialRarities: UnitRarity[] = ['Legendary', 'Epic', 'Mythic', 'Primeval', 'Apocalypse'];
        
        if (specialRarities.includes(rarity)) {
          const color = RARITY_COLORS[rarity];
          const sep = '------------------------------------------';
          addMessage(sep, color);
          addMessage(`[경축] 상위 등급 유닛이 탄생했습니다!`, color);
          addMessage(`▶▶ ★ ${unitLabel} ★ ◀◀`, color);
          addMessage(`( ${unitClass} 클래스 유닛 )`, color);
          addMessage(sep, color);
        } else {
          addMessage(`[시스템] ${unitName} 획득!`, RARITY_COLORS[rarity]);
        }
      }
    } else {
      if (playerIdx === 0) addMessage(`[경고] 골드가 부족합니다!`, '#dc2626');
    }
  };

  const isMyMap = playerIdx === 0;

  return (
    <div 
      className="absolute flex flex-col gap-2 z-20"
      style={{ left: x, top: y - 500, transform: 'translateX(-50%)' }}
    >
      <div className="flex gap-2 bg-white/90 p-2 rounded-lg border-2 border-[#dccfc4] shadow-lg backdrop-blur-sm">
        <button 
          onClick={handleGacha}
          disabled={!isMyMap || gold < GACHA_COST}
          className="maple-button !py-2 !px-4 !text-sm whitespace-nowrap"
        >
          뽑기 (10G)
        </button>
        <button 
          onClick={() => upgradeClass('Warrior')}
          disabled={!isMyMap}
          className="maple-button !py-2 !px-4 !text-sm whitespace-nowrap !bg-gradient-to-b !from-red-400 !to-red-600"
        >
          전사강화 ({upgrades.Warrior})
        </button>
        <button 
          onClick={() => upgradeClass('Mage')}
          disabled={!isMyMap}
          className="maple-button !py-2 !px-4 !text-sm whitespace-nowrap !bg-gradient-to-b !from-purple-400 !to-purple-600"
        >
          마법강화 ({upgrades.Mage})
        </button>
        <button 
          onClick={() => upgradeClass('Archer')}
          disabled={!isMyMap}
          className="maple-button !py-2 !px-4 !text-sm whitespace-nowrap !bg-gradient-to-b !from-green-400 !to-green-600"
        >
          궁수강화 ({upgrades.Archer})
        </button>
      </div>
    </div>
  );
};

export default MapControls;

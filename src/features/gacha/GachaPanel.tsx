import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useChatStore } from '../../store/chatStore';
import { rollGacha, getBaseStats, generateId } from '../../utils/gachaUtils';

const rarityColors = {
  Normal: '#6b7280',
  Rare: '#3b82f6',
  Ancient: '#9333ea',
  Legendary: '#ea580c',
};

const GachaPanel: React.FC = () => {
  const { gold, spendGold, isGameOver } = useGameStore();
  const { units, addUnit } = useUnitStore();
  const { addMessage } = useChatStore();

  const GACHA_COST = 10;

  const handleGacha = () => {
    if (isGameOver) return;
    if (spendGold(GACHA_COST)) {
      const { rarity, unitClass } = rollGacha();
      const stats = getBaseStats(rarity, unitClass);
      const unitName = `${rarity} ${unitClass}`;
      
      // 중앙 네모(1000, 1000) 내부 우선 스폰
      // 유닛이 많아지면 범위를 넓힘
      const radius = units.length < 5 ? 40 : 80; 
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const spawnX = 1000 + Math.cos(angle) * dist;
      const spawnY = 1000 + Math.sin(angle) * dist;
      
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

      addMessage(`[시스템] ${unitName} 획득!`, rarityColors[rarity]);
    } else {
      addMessage(`[경고] 골드가 부족합니다!`, '#dc2626');
    }
  };

  return (
    <div className="maple-panel h-full">
      <div className="maple-panel-header">
        <span>🎲 유닛 뽑기</span>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center flex-1 gap-4">
        <button 
          onClick={handleGacha}
          disabled={gold < GACHA_COST}
          className="maple-button w-full text-xl py-3"
        >
          뽑기 ({GACHA_COST} G)
        </button>

        <div className="w-full text-sm font-bold bg-[#fdfaf7] rounded p-2 border border-[#dccfc4] shadow-inner">
          <div className="flex justify-between border-b border-[#eaddcf] pb-1 mb-1">
            <span className="text-gray-500">일반</span>
            <span className="text-[#5a4b3c]">50%</span>
          </div>
          <div className="flex justify-between border-b border-[#eaddcf] pb-1 mb-1">
            <span className="text-blue-500">희귀</span>
            <span className="text-[#5a4b3c]">35%</span>
          </div>
          <div className="flex justify-between border-b border-[#eaddcf] pb-1 mb-1">
            <span className="text-purple-500">고대</span>
            <span className="text-[#5a4b3c]">14%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-500">전설</span>
            <span className="text-orange-500">1%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GachaPanel;

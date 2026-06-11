import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useChatStore } from '../../store/chatStore';
import { rollGacha, getBaseStats, generateId, RARITY_COLORS, RARITY_LABELS } from '../../utils/gachaUtils';
import type { UnitRarity } from '../../types/game';

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
      const unitLabel = RARITY_LABELS[rarity];
      const unitName = `${unitLabel} ${unitClass}`;
      
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

      // 레전더리 이상 등급은 5줄짜리 특별 공지 출력
      const specialRarities: UnitRarity[] = ['Legendary', 'Hero', 'Mythic', 'Primeval', 'Apocalypse'];
      
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
    } else {
      addMessage(`[경고] 골드가 부족합니다!`, '#dc2626');
    }
  };

  return (
    <div className="maple-panel h-full">
      <div className="maple-panel-header">
        <span>🎲 유닛 뽑기</span>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center flex-1 gap-4 overflow-y-auto">
        <button 
          onClick={handleGacha}
          disabled={gold < GACHA_COST}
          className="maple-button w-full text-xl py-3"
        >
          뽑기 ({GACHA_COST} G)
        </button>

        <div className="w-full text-xs font-bold bg-[#fdfaf7] rounded p-2 border border-[#dccfc4] shadow-inner max-h-[300px] overflow-y-auto">
          {(Object.keys(RARITY_LABELS) as UnitRarity[]).map((r) => (
            <div key={r} className="flex justify-between border-b border-[#eaddcf] pb-1 mb-1 last:border-0 last:pb-0">
              <span style={{ color: RARITY_COLORS[r] }}>{RARITY_LABELS[r]}</span>
              <span className="text-[#5a4b3c]">
                {r === 'Normal' ? '50%' : r === 'Rare' ? '25%' : r === 'Epic' ? '12%' : r === 'Unique' ? '6%' : r === 'Legendary' ? '4%' : r === 'Hero' ? '2%' : r === 'Mythic' ? '0.9%' : r === 'Primeval' ? '0.09%' : '0.01%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GachaPanel;

import React from 'react';
import { useUnitStore } from '../../store/unitStore';
import { RARITY_LABELS } from '../../utils/gachaUtils';
import type { UnitRarity } from '../../types/game';

// Tailwind 클래스로 변환하기 힘든 동적 컬러는 인라인 스타일로 처리하거나 매핑을 유지합니다.
// 여기서는 기존 Tailwind 매핑 방식을 새로운 등급에 맞춰 업데이트합니다.
const rarityTailwindStyles: Record<UnitRarity, string> = {
  Common: 'text-gray-700 border-gray-400 bg-[#e2d2ba]',
  Rare: 'text-blue-700 border-blue-500 bg-blue-100',
  Ancient: 'text-green-700 border-green-500 bg-green-100',
  Artifact: 'text-pink-700 border-pink-500 bg-pink-100',
  Narrative: 'text-purple-700 border-purple-500 bg-purple-100',
  Legendary: 'text-orange-600 border-orange-500 bg-orange-100 drop-shadow-[0_0_2px_rgba(255,255,255,1)]',
  Epic: 'text-red-700 border-red-500 bg-red-100',
  Mythic: 'text-yellow-700 border-yellow-500 bg-yellow-100',
  Primeval: 'text-cyan-700 border-cyan-500 bg-cyan-100 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
};

const InventoryPanel: React.FC = () => {
  const { units } = useUnitStore();

  return (
    <div className="maple-panel h-full flex flex-col">
      <div className="maple-panel-header">
        <span>🎒 보유 유닛</span>
        <span className="text-sm bg-[#1d3d6b] px-2 py-1 rounded-full">{units.length} / 50</span>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-[#f1e4d1] shadow-inner">
        {units.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8e6d46] font-bold text-lg">
            유닛이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {units.map((unit) => (
              <div 
                key={unit.id} 
                className={`p-2 rounded shadow-md border-2 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${rarityTailwindStyles[unit.rarity]}`}
              >
                <span className="text-[10px] mb-1 opacity-80 font-bold bg-white/50 px-1 rounded">{RARITY_LABELS[unit.rarity]}</span>
                <span className="font-bold text-sm tracking-wide">{unit.name}</span>
                <span className="text-[11px] font-bold mt-1 bg-black/10 px-2 py-0.5 rounded-full">
                  공격력: {unit.damage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;

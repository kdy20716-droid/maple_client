import React from 'react';
import { useUnitStore } from '../../store/unitStore';
import type { UnitRarity } from '../../types/game';

// 베이지색 배경에 어울리는 등급별 텍스트 및 보더 컬러 설정
const rarityColors: Record<UnitRarity, string> = {
  Normal: 'text-gray-700 border-gray-400 bg-[#e2d2ba]',
  Rare: 'text-blue-700 border-blue-500 bg-blue-100',
  Ancient: 'text-purple-700 border-purple-500 bg-purple-100',
  Legendary: 'text-orange-600 border-orange-500 bg-orange-100 drop-shadow-[0_0_2px_rgba(255,255,255,1)]',
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
                className={`p-2 rounded shadow-md border-2 flex flex-col items-center justify-center text-center ${rarityColors[unit.rarity]}`}
              >
                <span className="text-xs mb-1 opacity-80 font-bold bg-white/50 px-1 rounded">{unit.rarity}</span>
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

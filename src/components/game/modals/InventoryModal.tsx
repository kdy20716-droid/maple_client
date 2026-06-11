import React, { useEffect } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import type { UnitRarity } from '../../../types/game';

const rarityColors: Record<UnitRarity, string> = {
  Normal: 'text-gray-700 border-gray-400 bg-[#e2d2ba]',
  Rare: 'text-blue-700 border-blue-500 bg-blue-100',
  Ancient: 'text-purple-700 border-purple-500 bg-purple-100',
  Hero: 'text-pink-700 border-pink-500 bg-pink-100',
  Legendary: 'text-orange-600 border-orange-500 bg-orange-100 drop-shadow-[0_0_2px_rgba(255,255,255,1)]',
  Epic: 'text-cyan-700 border-cyan-500 bg-cyan-100',
  Mythic: 'text-yellow-700 border-yellow-500 bg-yellow-100',
  Primeval: 'text-red-700 border-red-500 bg-red-100',
  Apocalypse: 'text-indigo-900 border-indigo-900 bg-indigo-200 shadow-[0_0_5px_rgba(0,0,0,0.3)]',
};

const rarityLabels: Record<UnitRarity, string> = {
  Normal: '일반',
  Rare: '레어',
  Ancient: '고대',
  Hero: '영웅',
  Legendary: '전설',
  Epic: '에픽',
  Mythic: '신화',
  Primeval: '태초',
  Apocalypse: '종말',
};

const InventoryModal: React.FC = () => {
  const { isInventoryModalOpen, setInventoryModalOpen } = useUIStore();
  const { units } = useUnitStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInventoryModalOpen) {
        setInventoryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryModalOpen, setInventoryModalOpen]);

  if (!isInventoryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="maple-panel w-[600px] h-[500px] flex flex-col shadow-2xl animate-in zoom-in duration-200">
        <div className="maple-panel-header">
          <div className="flex items-center gap-3">
            <span>🎒 보유 유닛 정보</span>
            <span className="text-sm bg-black/30 px-3 py-1 rounded-full font-mono">{units.length} / 50</span>
          </div>
          <button onClick={() => setInventoryModalOpen(false)} className="hover:text-red-200 text-xl">✖</button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#f1e4d1] shadow-inner">
          {units.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#8e6d46] gap-4">
              <span className="text-6xl opacity-20">empty</span>
              <span className="font-bold text-xl">보유 중인 유닛이 없습니다.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {units.map((unit) => (
                <div 
                  key={unit.id} 
                  className={`p-3 rounded-lg shadow-md border-2 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-lg ${rarityColors[unit.rarity]}`}
                >
                  <span className="text-[10px] mb-1 opacity-80 font-bold bg-white/40 px-2 py-0.5 rounded-full border border-black/5">
                    {rarityLabels[unit.rarity]}
                  </span>
                  <div className="text-2xl mb-1">
                    {unit.class === 'Warrior' ? '⚔️' : unit.class === 'Mage' ? '🔮' : '🏹'}
                  </div>
                  <span className="font-bold text-sm tracking-tight">{unit.name}</span>
                  <div className="w-full mt-2 pt-2 border-t border-black/5 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-black/60 uppercase">Power</span>
                    <span className="text-xs font-black">{unit.damage.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#eaddcf] border-t border-[#dccfc4]">
          <button 
            onClick={() => setInventoryModalOpen(false)}
            className="maple-button w-full py-2.5 font-bold"
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;

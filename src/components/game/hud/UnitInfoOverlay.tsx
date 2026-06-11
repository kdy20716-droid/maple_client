import React from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { useEnemyStore } from '../../../store/enemyStore';
import { RARITY_LABELS } from '../../../utils/gachaUtils';
import type { UnitRarity } from '../../../types/game';

const rarityStyles: Record<UnitRarity, string> = {
  Normal: 'bg-[#e2d2ba] text-gray-700 border-gray-400',
  Rare: 'bg-blue-100 text-blue-600 border-blue-500',
  Epic: 'bg-purple-100 text-purple-600 border-purple-500',
  Unique: 'bg-pink-100 text-pink-600 border-pink-500',
  Legendary: 'bg-orange-100 text-orange-600 border-orange-500',
  Hero: 'bg-cyan-100 text-cyan-600 border-cyan-500',
  Mythic: 'bg-yellow-100 text-yellow-600 border-yellow-500',
  Primeval: 'bg-red-100 text-red-600 border-red-500',
  Apocalypse: 'bg-indigo-200 text-indigo-900 border-indigo-900 shadow-[0_0_10px_rgba(79,70,229,0.5)]',
};

const UnitInfoOverlay: React.FC = () => {
  const { selectedUnitIds, selectedEnemyId } = useUIStore();
  const { units } = useUnitStore();
  const { enemies } = useEnemyStore();
  
  const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
  const selectedEnemy = enemies.find(e => e.id === selectedEnemyId);

  if (selectedUnits.length === 0 && !selectedEnemy) return null;

  if (selectedEnemy) {
    const hpPercent = (selectedEnemy.hp / selectedEnemy.maxHp) * 100;
    const shieldPercent = (selectedEnemy.shield / selectedEnemy.maxShield) * 100;

    return (
      <div className="fixed bottom-0 z-30 flex p-4 gap-4 bg-black/90 border-t-4 border-x-4 border-red-900/50" style={{ left: '20vw', right: '20vw', height: '14vh', minHeight: '140px' }}>
        <div className="aspect-square h-full bg-slate-900 border-4 border-red-800 rounded-lg flex items-center justify-center text-4xl shadow-inner">
          👹
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div>
            <span className="text-xl font-bold text-red-500 drop-shadow-md">{selectedEnemy.name}</span>
            <span className="ml-3 text-slate-400 text-sm">Enemy Unit</span>
          </div>

          <div className="space-y-1.5">
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs font-bold text-red-400">
                <span>HP</span>
                <span>{Math.ceil(selectedEnemy.hp)} / {selectedEnemy.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-red-900/30">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {selectedEnemy.maxShield > 0 && (
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs font-bold text-blue-400">
                  <span>SHIELD</span>
                  <span>{Math.ceil(selectedEnemy.shield)} / {selectedEnemy.maxShield}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-blue-900/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                    style={{ width: `${shieldPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedUnits.length > 1) {
    return (
      <div className="fixed bottom-0 z-30 p-3 flex flex-col gap-2 bg-black/80 border-t-4 border-x-4 border-[#333]" style={{ left: '20vw', right: '20vw', height: '14vh', minHeight: '140px' }}>
        <div className="text-white font-bold text-sm">선택된 유닛 ({selectedUnits.length} / 10)</div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {selectedUnits.map(unit => (
            <div key={unit.id} className="flex flex-col items-center gap-1 group cursor-pointer flex-shrink-0">
              <div className="w-14 h-14 bg-slate-800 border-4 border-[#5a4b3c] rounded-lg flex items-center justify-center text-2xl shadow-inner group-hover:border-yellow-400 transition-colors">
                {unit.class === 'Warrior' ? '⚔️' : unit.class === 'Mage' ? '🔮' : '🏹'}
              </div>
              <span className="text-[10px] text-slate-300 font-bold">{RARITY_LABELS[unit.rarity]} {unit.class}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedUnit = selectedUnits[0];
  return (
    <div className="fixed bottom-0 z-30 flex p-4 gap-4 bg-black/80 border-t-4 border-x-4 border-[#333]" style={{ left: '20vw', right: '20vw', height: '14vh', minHeight: '140px' }}>
      <div className="aspect-square h-full bg-slate-800 border-4 border-[#5a4b3c] rounded-lg flex items-center justify-center text-4xl shadow-inner">
        {selectedUnit.class === 'Warrior' ? '⚔️' : selectedUnit.class === 'Mage' ? '🔮' : '🏹'}
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white drop-shadow-md">{selectedUnit.name}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border-2 ${rarityStyles[selectedUnit.rarity]}`}>
            {RARITY_LABELS[selectedUnit.rarity]}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/50 p-2 rounded border border-white/10">
            <span className="text-slate-400 text-xs block">공격력</span>
            <span className="text-yellow-400 text-base font-bold">{selectedUnit.damage}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded border border-white/10">
            <span className="text-slate-400 text-xs block">공격 속도</span>
            <span className="text-blue-400 text-base font-bold">{selectedUnit.attackSpeed}s</span>
          </div>
        </div>
        
        <div>
          <span className="text-slate-400 text-xs">클래스: </span>
          <span className="text-white text-sm font-bold">{selectedUnit.class}</span>
          <span className="ml-3 text-slate-400 text-xs">사거리: </span>
          <span className="text-yellow-200 text-sm font-bold">{selectedUnit.range}</span>
        </div>
      </div>
    </div>
  );
};

export default UnitInfoOverlay;

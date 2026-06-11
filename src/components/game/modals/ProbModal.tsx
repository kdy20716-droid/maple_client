import React, { useEffect } from 'react';
import { useUIStore } from '../../../store/uiStore';
import type { UnitRarity } from '../../../types/game';
import { RARITY_COLORS, RARITY_LABELS } from '../../../utils/gachaUtils';

const GACHA_RATES = {
  Normal: '50.0%',
  Rare: '25.0%',
  Epic: '12.0%',
  Unique: '6.0%',
  Legendary: '4.0%',
  Hero: '2.0%',
  Mythic: '0.9%',
  Primeval: '0.09%',
  Apocalypse: '0.01%',
};

const ProbModal: React.FC = () => {
  const { isProbModalOpen, setProbModalOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProbModalOpen) {
        setProbModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProbModalOpen, setProbModalOpen]);

  if (!isProbModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="maple-panel w-96 shadow-2xl animate-in zoom-in duration-200">
        <div className="maple-panel-header">
          <span>🎲 유닛 획득 확률</span>
          <button onClick={() => setProbModalOpen(false)} className="hover:text-red-200 text-xl">✖</button>
        </div>
        
        <div className="p-6">
          <div className="w-full text-sm font-bold bg-[#fdfaf7] rounded p-4 border border-[#dccfc4] shadow-inner space-y-2">
            {(Object.keys(GACHA_RATES) as UnitRarity[]).map((rarity) => (
              <div key={rarity} className="flex justify-between border-b border-[#eaddcf] pb-2 last:border-0 last:pb-0">
                <span style={{ color: RARITY_COLORS[rarity] }} className="text-lg">
                  {RARITY_LABELS[rarity]}
                </span>
                <span className="text-[#5a4b3c] text-lg font-mono">
                  {GACHA_RATES[rarity]}
                </span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setProbModalOpen(false)}
            className="maple-button w-full mt-6 py-3 text-lg"
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProbModal;

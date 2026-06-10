import React from 'react';
import { useGameStore } from '../../store/gameStore';

const GameHeader: React.FC = () => {
  const { gold, wave, monsterCount, maxMonsterCount } = useGameStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#fdfaf7] border-b-2 border-[#dccfc4] flex justify-between items-center px-6 z-50 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl text-[#5a4b3c] drop-shadow-sm tracking-tighter font-black">
          MAPLE DEFENSE
        </h1>
        <div className="bg-[#f1e4d1] px-4 py-1 rounded-full border border-[#dccfc4] text-[#5a4b3c] flex items-center gap-2">
          <span className="text-[#8e6d46] text-xs font-bold">WAVE</span>
          <span className="text-lg font-bold">{wave}</span>
        </div>
      </div>
      
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border-2 border-[#dccfc4] shadow-inner">
          <span className="text-[#8e6d46] font-bold">💰 골드</span>
          <span className="text-[#5a4b3c] font-bold text-lg">{gold}</span>
        </div>
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border-2 shadow-inner transition-colors ${
          monsterCount >= 70 ? 'bg-red-50 border-red-300' : 'bg-white border-[#dccfc4]'
        }`}>
          <span className={`font-bold ${monsterCount >= 70 ? 'text-red-600' : 'text-[#8e6d46]'}`}>
            👾 {monsterCount >= 70 ? '위험!' : '몬스터'}
          </span>
          <span className={`font-bold text-lg ${monsterCount >= 70 ? 'text-red-600 animate-pulse' : 'text-[#5a4b3c]'}`}>
            {monsterCount} / {maxMonsterCount}
          </span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;

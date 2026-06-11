import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useUnitStore } from '../../store/unitStore';
import { getBaseStats, generateId, RARITY_COLORS, RARITY_LABELS } from '../../utils/gachaUtils';
import type { UnitRarity } from '../../types/game';

const ChatOverlay: React.FC = () => {
  const { messages, isChatActive, setChatActive, addMessage } = useChatStore();
  const { addUnit } = useUnitStore();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isChatActive) {
          setChatActive(true);
          e.preventDefault();
        } else {
          if (inputValue.trim() !== '') {
            // 치트 명령어 체크
            if (inputValue.startsWith('/spawn ')) {
              const parts = inputValue.split(' ');
              if (parts.length >= 2) {
                const inputRarity = parts[1].toLowerCase();
                // 등급 매핑 업데이트
                const rarityMap: Record<string, string> = {
                  '일반': 'Normal', '레어': 'Rare', '에픽': 'Epic', '유니크': 'Unique', 
                  '레전더리': 'Legendary', '영웅': 'Hero', '신화': 'Mythic', '태초': 'Primeval', '종말': 'Apocalypse',
                  'normal': 'Normal', 'rare': 'Rare', 'epic': 'Epic', 'unique': 'Unique',
                  'legendary': 'Legendary', 'hero': 'Hero', 'mythic': 'Mythic', 'primeval': 'Primeval', 'apocalypse': 'Apocalypse'
                };

                const requestedRarity = rarityMap[inputRarity];

                if (requestedRarity) {
                  const unitRarity = requestedRarity as UnitRarity;
                  const unitClass = (['Warrior', 'Mage', 'Archer'] as any[])[Math.floor(Math.random() * 3)];
                  const stats = getBaseStats(unitRarity, unitClass);
                  const unitLabel = RARITY_LABELS[unitRarity];
                  const unitName = `${unitLabel} ${unitClass}`;
                  
                  addUnit({
                    id: generateId(),
                    name: unitName,
                    rarity: unitRarity,
                    class: unitClass,
                    damage: stats.damage,
                    attackSpeed: stats.attackSpeed,
                    range: stats.range,
                    position: { x: 1000 + (Math.random() * 60 - 30), y: 1000 + (Math.random() * 60 - 30) },
                  });

                  const specialRarities = ['Legendary', 'Hero', 'Mythic', 'Primeval', 'Apocalypse'];
                  if (specialRarities.includes(unitRarity)) {
                    const color = RARITY_COLORS[unitRarity];
                    const sep = '------------------------------------------';
                    addMessage(sep, color);
                    addMessage(`[치트] ★ ${unitLabel} ★ 소환 성공!`, color);
                    addMessage(sep, color);
                  } else {
                    addMessage(`[치트] ${unitName} 소환됨`, RARITY_COLORS[unitRarity]);
                  }
                } else {
                  addMessage(`[오류] 등급명이 정확하지 않습니다. (예: /spawn 종말)`, '#ff4444');
                }
              }
            } else {
              addMessage(`[나] ${inputValue}`, '#ffffff');
            }
            setInputValue('');
          }
          setChatActive(false);
          e.preventDefault();
        }
      } else if (e.key === 'Escape' && isChatActive) {
        setChatActive(false);
        setInputValue('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatActive, inputValue, setChatActive, addMessage, addUnit]);

  useEffect(() => {
    if (isChatActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatActive]);

  return (
    <div className="fixed flex flex-col justify-end gap-2 z-[9999] w-96 pointer-events-none" style={{ bottom: 'calc(20vw + 8px)', left: '4px' }}>
      {/* 채팅 메시지 목록 */}
      <div className="flex flex-col gap-1.5 mb-1">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="bg-[#000000]/80 border border-white/20 px-3 py-1.5 rounded-sm shadow-2xl animate-fade-in-up backdrop-blur-sm self-start max-w-full break-words"
          >
            <span 
              className="relative block font-bold text-sm tracking-wide"
              style={{ 
                color: msg.color || '#ffffff', 
                zIndex: 100,
                textShadow: '2px 2px 2px rgba(0,0,0,1), -1px -1px 0px rgba(0,0,0,1), 1px -1px 0px rgba(0,0,0,1), -1px 1px 0px rgba(0,0,0,1)'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* 채팅 입력창 */}
      <div className={`transition-all duration-150 ${isChatActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none h-0'}`}>
        <div className="flex items-center w-full bg-[#111111]/95 border-2 border-[#8e6d46] rounded-sm shadow-2xl overflow-hidden pointer-events-auto">
          <span className="bg-[#8e6d46] px-3 py-2 text-white font-bold border-r-2 border-[#8e6d46] text-xs">CHAT</span>
          <input 
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
               setTimeout(() => setChatActive(false), 200);
            }}
            className="flex-1 px-4 py-2 outline-none text-white font-bold bg-transparent text-sm"
            placeholder="입력 후 Enter..."
            style={{ textShadow: '1px 1px 2px #000' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;

import React, { useState } from 'react';
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

/* ── 맵 위에 떠있는 메이플 스타일 컨트롤 버튼 ── */
const MapBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, color = '#b07820', children }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        padding: '5px 12px',
        background: disabled
          ? 'linear-gradient(180deg,#2a2a2a,#1a1a1a)'
          : hover
          ? `linear-gradient(180deg,${color}ee,${color}88)`
          : `linear-gradient(180deg,${color}cc,${color}66)`,
        border: `1px solid ${disabled ? '#333' : color}`,
        borderRadius: '3px',
        color: disabled ? '#555' : '#fff8e0',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: '"Gulim","Dotum",sans-serif',
        boxShadow: disabled ? 'none' : `0 2px 0 ${color}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
        transform: active ? 'translateY(1px)' : 'translateY(0)',
        transition: 'all 0.08s',
        outline: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '0.5px',
      }}
    >
      {children}
    </button>
  );
};

const MapControls: React.FC<MapControlsProps> = ({ x, y, playerIdx }) => {
  const { mineral, gas, spendMineral, upgrades, upgradeClass, isGameOver, getUpgradeCost } = useGameStore();
  const { addUnit } = useUnitStore();
  const { addMessage } = useChatStore();

  const GACHA_COST = 10;
  const isMyMap = playerIdx === 0;

  const handleGacha = () => {
    if (isGameOver || !isMyMap) return;
    if (!spendMineral(GACHA_COST)) {
      addMessage('[경고] 미네랄이 부족합니다!', '#ff4444');
      return;
    }

    const { rarity, unitClass } = rollGacha();
    const stats = getBaseStats(rarity, unitClass);
    const unitLabel = RARITY_LABELS[rarity];
    const unitClassName = unitClass === 'Ghost' ? '고스트' : unitClass === 'Dragoon' ? '드라군' : '히드라';
    const unitName = `${unitLabel} ${unitClassName}`;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 40;
    addUnit({
      id: generateId(),
      name: unitName,
      rarity,
      class: unitClass,
      attackType: stats.attackType,
      damage: stats.damage,
      attackSpeed: stats.attackSpeed,
      range: stats.range,
      position: { x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist },
    });

    const special: UnitRarity[] = ['Legendary', 'Epic', 'Mythic', 'Primeval'];
    if (special.includes(rarity)) {
      const color = RARITY_COLORS[rarity];
      const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      addMessage(sep, color);
      addMessage(`[경축] 상위 등급 유닛이 탄생했습니다!`, color);
      addMessage(`▶▶ ★ ${unitLabel} ★ ◀◀`, color);
      addMessage(`( ${unitClassName} )`, color);
      addMessage(sep, color);
    } else {
      addMessage(`[시스템] ${unitName} 획득!`, RARITY_COLORS[rarity]);
    }
  };

  const isUpper = playerIdx < 2;

  return (
    <div
      className="absolute z-20"
      style={{ left: x, top: isUpper ? y - 510 : y + 460, transform: 'translateX(-50%)' }}
    >
      <div style={{
        display: 'flex', gap: '5px', alignItems: 'center',
        padding: '6px 10px',
        background: 'linear-gradient(180deg,rgba(20,10,4,0.92),rgba(10,5,2,0.88))',
        border: '2px solid #6a4010',
        borderRadius: '4px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,180,80,0.08)',
      }}>
        {/* 플레이어 표시 */}
        <div style={{
          padding: '3px 8px',
          background: isMyMap ? 'rgba(200,146,42,0.2)' : 'rgba(50,50,80,0.3)',
          border: `1px solid ${isMyMap ? '#8b5e2e' : '#303060'}`,
          borderRadius: '2px',
          color: isMyMap ? '#f0d080' : '#6080c0',
          fontSize: '10px', fontWeight: 'bold', fontFamily: '"Gulim",sans-serif',
          marginRight: '4px',
        }}>
          {isMyMap ? '🍁 P1' : `👤 P${playerIdx + 1}`}
        </div>

        {/* 뽑기 버튼 */}
        <MapBtn
          onClick={handleGacha}
          disabled={!isMyMap || mineral < GACHA_COST}
          color="#0284c7"
        >
          💎 뽑기 ({GACHA_COST}M)
        </MapBtn>

        {/* 강화 버튼들 (가스 소모) */}
        <MapBtn
          onClick={() => upgradeClass('Ghost')}
          disabled={!isMyMap || gas < getUpgradeCost('Ghost')}
          color="#cc3030"
        >
          👻 고스트 Lv.{upgrades.Ghost} ({getUpgradeCost('Ghost')}G)
        </MapBtn>
        <MapBtn
          onClick={() => upgradeClass('Dragoon')}
          disabled={!isMyMap || gas < getUpgradeCost('Dragoon')}
          color="#2563eb"
        >
          🤖 드라군 Lv.{upgrades.Dragoon} ({getUpgradeCost('Dragoon')}G)
        </MapBtn>
        <MapBtn
          onClick={() => upgradeClass('Hydra')}
          disabled={!isMyMap || gas < getUpgradeCost('Hydra')}
          color="#16a34a"
        >
          🦎 히드라 Lv.{upgrades.Hydra} ({getUpgradeCost('Hydra')}G)
        </MapBtn>
      </div>
    </div>
  );
};

export default MapControls;

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useChatStore } from '../../store/chatStore';
import { rollGacha, getBaseStats, generateId, RARITY_COLORS, RARITY_LABELS, findSpawnPosition } from '../../utils/gachaUtils';
import type { UnitRarity } from '../../types/game';

const GACHA_COST = 10;

const RATES: Record<UnitRarity, string> = {
  Normal: '50%', Rare: '25%', Epic: '12%', Unique: '6%',
  Legendary: '4%', Hero: '2%', Mythic: '0.9%', Primeval: '0.09%', Apocalypse: '0.01%',
};

/* ── 뽑기 애니메이션 오버레이 ─────────────────────── */
const GachaFlash: React.FC<{ rarity: UnitRarity; label: string; onDone: () => void }> = ({ rarity, label, onDone }) => {
  const color = RARITY_COLORS[rarity];
  React.useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSpecial = ['Legendary', 'Hero', 'Mythic', 'Primeval', 'Apocalypse'].includes(rarity);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at center, ${color}22 0%, rgba(0,0,0,0.85) 70%)`,
      animation: 'gachaFadeIn 0.2s ease',
    }}>
      <div style={{ textAlign: 'center', animation: 'gachaZoom 0.3s ease' }}>
        {isSpecial && (
          <div style={{ color: color, fontSize: '13px', letterSpacing: '4px', marginBottom: '12px', opacity: 0.8, fontFamily: '"Gulim",sans-serif' }}>
            ★★★ 상위 등급 등장 ★★★
          </div>
        )}
        <div style={{
          fontSize: isSpecial ? '64px' : '48px',
          fontWeight: 'bold',
          color,
          textShadow: `0 0 30px ${color}, 0 0 60px ${color}88`,
          fontFamily: '"Gulim","Dotum",sans-serif',
          letterSpacing: '2px',
        }}>
          {label}
        </div>
        {isSpecial && (
          <div style={{ color: '#f0d080', fontSize: '14px', marginTop: '12px', fontFamily: '"Gulim",sans-serif' }}>
            ✦ 획득을 축하드립니다! ✦
          </div>
        )}
      </div>
    </div>
  );
};

/* ── GachaPanel ─────────────────────────────────── */
const GachaPanel: React.FC = () => {
  const { gold, spendGold, isGameOver } = useGameStore();
  const { units, addUnit } = useUnitStore();
  const { addMessage } = useChatStore();
  const [flash, setFlash] = useState<{ rarity: UnitRarity; label: string } | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleGacha = () => {
    if (isGameOver) return;
    if (!spendGold(GACHA_COST)) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      addMessage('[경고] 골드가 부족합니다!', '#ff4444');
      return;
    }

    const { rarity, unitClass } = rollGacha();
    const stats = getBaseStats(rarity, unitClass);
    const unitLabel = RARITY_LABELS[rarity];
    const unitName = `${unitLabel} ${unitClass}`;

    const spawnPos = findSpawnPosition(1000, 1000, units, 34);
    addUnit({
      id: generateId(), name: unitName, rarity, class: unitClass,
      damage: stats.damage, attackSpeed: stats.attackSpeed, range: stats.range,
      position: spawnPos,
    });

    const special: UnitRarity[] = ['Legendary', 'Hero', 'Mythic', 'Primeval', 'Apocalypse'];
    if (special.includes(rarity)) {
      const color = RARITY_COLORS[rarity];
      const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      addMessage(sep, color);
      addMessage(`[경축] 상위 등급 유닛이 탄생했습니다!`, color);
      addMessage(`▶▶ ★ ${unitLabel} ★ ◀◀`, color);
      addMessage(`( ${unitClass} 클래스 유닛 )`, color);
      addMessage(sep, color);
      setFlash({ rarity, label: unitLabel });
    } else {
      addMessage(`[시스템] ${unitName} 획득!`, RARITY_COLORS[rarity]);
    }
  };

  const canGacha = gold >= GACHA_COST && !isGameOver;

  return (
    <>
      {flash && <GachaFlash rarity={flash.rarity} label={flash.label} onDone={() => setFlash(null)} />}

      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg,#1e1006,#120a04)',
        borderRight: '2px solid #5a3818',
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(90deg,#3a1e08,#2a1208,#3a1e08)',
          borderBottom: '2px solid #5a3818',
          padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>🎲</span>
          <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', textShadow: '0 0 8px rgba(240,200,80,0.4)' }}>
            유닛 뽑기
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 골드 표시 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 10px',
            background: 'rgba(200,146,42,0.1)', border: '1px solid #4a2e10', borderRadius: '3px',
          }}>
            <span style={{ color: '#7a5828', fontSize: '11px' }}>보유 골드</span>
            <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px', textShadow: '0 0 6px rgba(255,215,0,0.4)' }}>
              💰 {gold.toLocaleString()} G
            </span>
          </div>

          {/* 뽑기 버튼 */}
          <button
            onClick={handleGacha}
            disabled={!canGacha}
            className={shaking ? 'animate-shake' : ''}
            style={{
              width: '100%', padding: '12px',
              background: canGacha
                ? 'linear-gradient(180deg,#d09028,#8b5e10)'
                : 'linear-gradient(180deg,#333,#222)',
              border: `2px solid ${canGacha ? '#6a3e08' : '#333'}`,
              borderRadius: '3px',
              color: canGacha ? '#fff8e0' : '#555',
              fontSize: '14px', fontWeight: 'bold',
              cursor: canGacha ? 'pointer' : 'not-allowed',
              fontFamily: '"Gulim",sans-serif',
              boxShadow: canGacha ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 0 #4a2a04' : 'none',
              letterSpacing: '1px',
              transition: 'all 0.1s',
              outline: 'none',
            }}
            onMouseEnter={e => {
              if (canGacha) (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg,#e0a830,#9a6e18)';
            }}
            onMouseLeave={e => {
              if (canGacha) (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg,#d09028,#8b5e10)';
            }}
          >
            🎲 뽑기 ({GACHA_COST} G)
          </button>

          {/* 등급 확률표 */}
          <div style={{
            border: '1px solid #3a2010', borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '5px 10px',
              background: 'rgba(0,0,0,0.4)',
              borderBottom: '1px solid #3a2010',
              color: '#7a5828', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px',
            }}>
              등급 확률표
            </div>
            {(Object.keys(RARITY_LABELS) as UnitRarity[]).map((r, i, arr) => (
              <div key={r} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 10px',
                borderBottom: i < arr.length - 1 ? '1px solid #2a1508' : 'none',
                background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
              }}>
                <span style={{ color: RARITY_COLORS[r], fontSize: '11px', fontWeight: 'bold' }}>
                  {RARITY_LABELS[r]}
                </span>
                <span style={{ color: '#5a3818', fontSize: '11px' }}>{RATES[r]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gachaFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes gachaZoom { from { transform:scale(0.5); opacity:0 } to { transform:scale(1); opacity:1 } }
      `}</style>
    </>
  );
};

export default GachaPanel;

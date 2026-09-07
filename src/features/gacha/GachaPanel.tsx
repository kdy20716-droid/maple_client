import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUnitStore } from '../../store/unitStore';
import { useChatStore } from '../../store/chatStore';
import { rollGacha, getBaseStats, generateId, RARITY_COLORS, RARITY_LABELS, findSpawnPosition } from '../../utils/gachaUtils';
import type { UnitRarity, UnitClass } from '../../types/game';

const GACHA_COST = 10;

// 공식 메이플 운빨 디펜스 뽑기 확률
const RATES: Record<UnitRarity, string> = {
  Common: '40.03%',
  Rare: '33.00%',
  Ancient: '15.00%',
  Artifact: '8.00%',
  Narrative: '2.30%',
  Legendary: '1.00%',
  Epic: '0.30%',
  Mythic: '0.31%',
  Primeval: '0.06%',
};

/* ── 뽑기 애니메이션 오버레이 ─────────────────────── */
const GachaFlash: React.FC<{ rarity: UnitRarity; label: string; onDone: () => void }> = ({ rarity, label, onDone }) => {
  const color = RARITY_COLORS[rarity];
  React.useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSpecial = ['Legendary', 'Epic', 'Mythic', 'Primeval'].includes(rarity);

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
  const { mineral, gas, spendMineral, isGameOver, tickets, consumeTicket, exchangeMineralForGas } = useGameStore();
  const { units, addUnit } = useUnitStore();
  const { addMessage } = useChatStore();
  const [flash, setFlash] = useState<{ rarity: UnitRarity; label: string } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'gacha' | 'tickets' | 'exchange'>('gacha');

  const handleGacha = () => {
    if (isGameOver) return;
    if (!spendMineral(GACHA_COST)) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      addMessage('[경고] 미네랄이 부족합니다!', '#ff4444');
      return;
    }

    const { rarity, unitClass } = rollGacha();
    const stats = getBaseStats(rarity, unitClass);
    const unitLabel = RARITY_LABELS[rarity];
    const unitClassName = unitClass === 'Ghost' ? '고스트' : unitClass === 'Dragoon' ? '드라군' : '히드라';
    const unitName = `${unitLabel} ${unitClassName}`;

    const spawnPos = findSpawnPosition(1000, 1000, units, 34);
    addUnit({
      id: generateId(),
      name: unitName,
      rarity,
      class: unitClass,
      attackType: stats.attackType,
      damage: stats.damage,
      attackSpeed: stats.attackSpeed,
      range: stats.range,
      position: spawnPos,
    });

    const special: UnitRarity[] = ['Legendary', 'Epic', 'Mythic', 'Primeval'];
    if (special.includes(rarity)) {
      const color = RARITY_COLORS[rarity];
      const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      addMessage(sep, color);
      addMessage(`[경축] 상위 등급 유닛이 탄생했습니다!`, color);
      addMessage(`▶▶ ★ ${unitLabel} ★ ◀◀`, color);
      addMessage(`( ${unitClassName} 유닛 )`, color);
      addMessage(sep, color);
      setFlash({ rarity, label: unitLabel });
    } else {
      addMessage(`[시스템] ${unitName} 획득!`, RARITY_COLORS[rarity]);
    }
  };

  const handleUseTicket = (tier: 'Artifact' | 'Narrative' | 'Legendary', unitClass: UnitClass) => {
    if (isGameOver) return;
    if (!consumeTicket(tier)) {
      addMessage('[경고] 보유한 선택권이 부족합니다!', '#ff4444');
      return;
    }

    const stats = getBaseStats(tier, unitClass);
    const unitLabel = RARITY_LABELS[tier];
    const unitClassName = unitClass === 'Ghost' ? '고스트' : unitClass === 'Dragoon' ? '드라군' : '히드라';
    const unitName = `${unitLabel} ${unitClassName}`;

    const spawnPos = findSpawnPosition(1000, 1000, units, 34);
    addUnit({
      id: generateId(),
      name: unitName,
      rarity: tier,
      class: unitClass,
      attackType: stats.attackType,
      damage: stats.damage,
      attackSpeed: stats.attackSpeed,
      range: stats.range,
      position: spawnPos,
    });

    const color = RARITY_COLORS[tier];
    addMessage(`[선택권 사용] ${unitName}을(를) 직접 소환했습니다!`, color);
    setFlash({ rarity: tier, label: unitLabel });
  };

  const handleExchange = () => {
    if (exchangeMineralForGas(10)) {
      addMessage('[환전 완료] 10 미네랄을 10 가스로 교환했습니다.', '#4ade80');
    } else {
      addMessage('[경고] 환전할 미네랄이 부족합니다 (최소 10 M)', '#ff4444');
    }
  };

  const canGacha = mineral >= GACHA_COST && !isGameOver;
  const totalTickets = tickets.Artifact + tickets.Narrative + tickets.Legendary;

  return (
    <>
      {flash && <GachaFlash rarity={flash.rarity} label={flash.label} onDone={() => setFlash(null)} />}

      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg,#1e1006,#120a04)',
        borderRight: '2px solid #5a3818',
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
      }}>
        {/* 상단 탭 네비게이션 */}
        <div style={{
          display: 'flex', borderBottom: '2px solid #5a3818',
          background: 'rgba(0,0,0,0.5)',
        }}>
          <button
            onClick={() => setActiveTab('gacha')}
            style={{
              flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: 'bold',
              background: activeTab === 'gacha' ? 'rgba(200,146,42,0.3)' : 'transparent',
              color: activeTab === 'gacha' ? '#ffd700' : '#888',
              border: 'none', cursor: 'pointer', outline: 'none',
              borderBottom: activeTab === 'gacha' ? '2px solid #ffd700' : 'none',
            }}
          >
            🎲 뽑기
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: 'bold',
              background: activeTab === 'tickets' ? 'rgba(200,146,42,0.3)' : 'transparent',
              color: activeTab === 'tickets' ? '#ffd700' : '#888',
              border: 'none', cursor: 'pointer', outline: 'none',
              borderBottom: activeTab === 'tickets' ? '2px solid #ffd700' : 'none',
            }}
          >
            🎫 선택권 ({totalTickets})
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            style={{
              flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: 'bold',
              background: activeTab === 'exchange' ? 'rgba(200,146,42,0.3)' : 'transparent',
              color: activeTab === 'exchange' ? '#ffd700' : '#888',
              border: 'none', cursor: 'pointer', outline: 'none',
              borderBottom: activeTab === 'exchange' ? '2px solid #ffd700' : 'none',
            }}
          >
            🔄 환전소
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 재화 현황 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 10px',
            background: 'rgba(200,146,42,0.1)', border: '1px solid #4a2e10', borderRadius: '3px',
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div>
                <span style={{ color: '#7a5828', fontSize: '10px', marginRight: '4px' }}>미네랄</span>
                <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}>💎 {mineral.toLocaleString()} M</span>
              </div>
              <div>
                <span style={{ color: '#7a5828', fontSize: '10px', marginRight: '4px' }}>가스</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '13px' }}>🟢 {gas.toLocaleString()} G</span>
              </div>
            </div>
          </div>

          {activeTab === 'gacha' && (
            <>
              {/* 뽑기 버튼 */}
              <button
                onClick={handleGacha}
                disabled={!canGacha}
                className={shaking ? 'animate-shake' : ''}
                style={{
                  width: '100%', padding: '12px',
                  background: canGacha
                    ? 'linear-gradient(180deg,#0284c7,#0369a1)'
                    : 'linear-gradient(180deg,#333,#222)',
                  border: `2px solid ${canGacha ? '#38bdf8' : '#333'}`,
                  borderRadius: '3px',
                  color: canGacha ? '#fff' : '#555',
                  fontSize: '14px', fontWeight: 'bold',
                  cursor: canGacha ? 'pointer' : 'not-allowed',
                  fontFamily: '"Gulim",sans-serif',
                  boxShadow: canGacha ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 #075985' : 'none',
                  letterSpacing: '1px',
                  transition: 'all 0.1s',
                  outline: 'none',
                }}
              >
                💎 유닛 뽑기 ({GACHA_COST} 미네랄)
              </button>

              {/* 공식 등급 확률표 */}
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
                  공식 메운디 확률표
                </div>
                {(Object.keys(RATES) as UnitRarity[]).map((r, i, arr) => (
                  <div key={r} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 10px',
                    borderBottom: i < arr.length - 1 ? '1px solid #2a1508' : 'none',
                    background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
                  }}>
                    <span style={{ color: RARITY_COLORS[r], fontSize: '11px', fontWeight: 'bold' }}>
                      {RARITY_LABELS[r]}
                    </span>
                    <span style={{ color: '#aaa', fontSize: '11px' }}>{RATES[r]}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#cbbba9', lineHeight: '1.4' }}>
                보스 처치 시 획득한 티켓으로 원하는 직업의 유닛을 확정 소환할 수 있습니다.
              </div>

              {(['Artifact', 'Narrative', 'Legendary'] as const).map(tier => {
                const count = tickets[tier];
                const label = RARITY_LABELS[tier];
                const color = RARITY_COLORS[tier];

                return (
                  <div key={tier} style={{
                    background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}66`,
                    borderRadius: '4px', padding: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color, fontWeight: 'bold', fontSize: '12px' }}>
                        🎫 {label} 선택권
                      </span>
                      <span style={{ color: count > 0 ? '#4ade80' : '#666', fontWeight: 'bold', fontSize: '12px' }}>
                        {count} 장 보유
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      <button
                        onClick={() => handleUseTicket(tier, 'Ghost')}
                        disabled={count <= 0}
                        style={{
                          padding: '4px', fontSize: '10px', fontWeight: 'bold',
                          background: count > 0 ? '#cc3030' : '#222',
                          color: count > 0 ? '#fff' : '#555',
                          border: 'none', borderRadius: '2px', cursor: count > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        👻 고스트
                      </button>
                      <button
                        onClick={() => handleUseTicket(tier, 'Dragoon')}
                        disabled={count <= 0}
                        style={{
                          padding: '4px', fontSize: '10px', fontWeight: 'bold',
                          background: count > 0 ? '#2563eb' : '#222',
                          color: count > 0 ? '#fff' : '#555',
                          border: 'none', borderRadius: '2px', cursor: count > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        🤖 드라군
                      </button>
                      <button
                        onClick={() => handleUseTicket(tier, 'Hydra')}
                        disabled={count <= 0}
                        style={{
                          padding: '4px', fontSize: '10px', fontWeight: 'bold',
                          background: count > 0 ? '#16a34a' : '#222',
                          color: count > 0 ? '#fff' : '#555',
                          border: 'none', borderRadius: '2px', cursor: count > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        🦎 히드라
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'exchange' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#cbbba9', lineHeight: '1.4' }}>
                미네랄을 직업 공격력 강화에 필요한 가스로 1:1 환전합니다.
              </div>

              <div style={{
                padding: '12px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid #4a2e10', borderRadius: '4px',
                display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#f0d080', fontWeight: 'bold' }}>
                  💎 10 미네랄 ➔ 🟢 10 가스
                </div>
                <button
                  onClick={handleExchange}
                  disabled={mineral < 10}
                  style={{
                    padding: '8px 16px',
                    background: mineral >= 10 ? 'linear-gradient(180deg,#16a34a,#15803d)' : '#333',
                    border: `1px solid ${mineral >= 10 ? '#22c55e' : '#444'}`,
                    borderRadius: '3px',
                    color: mineral >= 10 ? '#fff' : '#666',
                    fontSize: '12px', fontWeight: 'bold',
                    cursor: mineral >= 10 ? 'pointer' : 'not-allowed',
                  }}
                >
                  가스로 교환하기
                </button>
              </div>
            </div>
          )}
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

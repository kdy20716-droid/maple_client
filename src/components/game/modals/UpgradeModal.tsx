import React, { useEffect } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useGameStore } from '../../../store/gameStore';
import { useChatStore } from '../../../store/chatStore';
import type { UnitClass } from '../../../types/game';

const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setUpgradeModalOpen } = useUIStore();
  const { mineral, gas, upgrades, getUpgradeCost, upgradeClass } = useGameStore();
  const { addMessage } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUpgradeModalOpen) {
        setUpgradeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUpgradeModalOpen, setUpgradeModalOpen]);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = (unitClass: UnitClass, name: string) => {
    const cost = getUpgradeCost(unitClass);
    if (gas < cost) {
      addMessage(`[경고] ${name} 강화에 필요한 가스(${cost}G)가 부족합니다!`, '#ff4444');
      return;
    }
    const success = upgradeClass(unitClass);
    if (success) {
      addMessage(`[강화 성공] ${name} 공격력이 강화되었습니다! (Lv.${upgrades[unitClass] + 1})`, '#55ff55');
    }
  };

  const classes: { type: UnitClass; name: string; icon: string; color: string; desc: string; dmgInc: number; typeDesc: string }[] = [
    { 
      type: 'Ghost', 
      name: '고스트 (진동형)', 
      icon: '👻', 
      color: '#cc3030', 
      desc: '소형 100% / 중형 50% / 대형 25% (기본 피해량 최상급)', 
      dmgInc: 4,
      typeDesc: '레벨당 공격력 +4'
    },
    { 
      type: 'Dragoon', 
      name: '드라군 (폭발형)', 
      icon: '🤖', 
      color: '#3182ce', 
      desc: '소형 50% / 중형 75% / 대형 100% (보스 및 대형 특화)', 
      dmgInc: 3,
      typeDesc: '레벨당 공격력 +3'
    },
    { 
      type: 'Hydra', 
      name: '히드라 (일반형)', 
      icon: '🦎', 
      color: '#229944', 
      desc: '모든 크기 100% 풀데미지 (빠른 연사 속도 & 안정성)', 
      dmgInc: 2,
      typeDesc: '레벨당 공격력 +2'
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)',
        fontFamily: '"Gulim", "Dotum", sans-serif',
      }}
    >
      <div
        style={{
          width: '450px',
          background: 'linear-gradient(160deg, #2c1a0e, #180d07)',
          border: '3px solid #8b5e2e',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 모달 헤더 */}
        <div
          style={{
            background: 'linear-gradient(90deg, #50351d, #2d1a0b)',
            borderBottom: '2px solid #8b5e2e',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#f0d080',
            fontWeight: 'bold',
            fontSize: '13px',
            textShadow: '1px 1px 1px #000',
            userSelect: 'none',
          }}
        >
          <span>⬆️ 직업 공격력 강화 (가스 소모)</span>
          <button
            onClick={() => setUpgradeModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b5e2e',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
              outline: 'none',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ff6060')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#8b5e2e')}
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div style={{ padding: '16px', background: '#0d0804', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 보유 재화 안내 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 12px', background: 'rgba(200,146,42,0.1)', border: '1px solid #4a2e10', borderRadius: '3px',
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <span style={{ color: '#8b5e2e', fontSize: '11px', fontWeight: 'bold', marginRight: '6px' }}>보유 가스</span>
                <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: 'bold' }}>🟢 {gas.toLocaleString()} Gas</span>
              </div>
              <div>
                <span style={{ color: '#8b5e2e', fontSize: '11px', fontWeight: 'bold', marginRight: '6px' }}>보유 미네랄</span>
                <span style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold' }}>💎 {mineral.toLocaleString()} M</span>
              </div>
            </div>
          </div>

          {/* 직업 카드들 */}
          {classes.map((cls) => {
            const lv = upgrades[cls.type];
            const cost = getUpgradeCost(cls.type);
            const totalAddDmg = lv * cls.dmgInc;
            const canAfford = gas >= cost;

            return (
              <div
                key={cls.type}
                style={{
                  background: 'linear-gradient(135deg, #1c1109, #100a05)',
                  border: `1.5px solid ${cls.color}55`,
                  borderRadius: '4px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '4px',
                    background: `${cls.color}22`, border: `2px solid ${cls.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', flexShrink: 0,
                  }}>
                    {cls.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>{cls.name}</span>
                      <span style={{ color: cls.color, fontWeight: 'bold', fontSize: '11px' }}>Lv.{lv}</span>
                    </div>
                    <div style={{ color: '#ddccaa', fontSize: '11px', marginTop: '2px' }}>
                      기본 공격력: <span style={{ color: '#55ff55', fontWeight: 'bold' }}>+{totalAddDmg}</span> ({cls.typeDesc})
                    </div>
                    <div style={{ color: '#aaa', fontSize: '9.5px', marginTop: '1px' }}>{cls.desc}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(cls.type, cls.name)}
                  disabled={!canAfford}
                  style={{
                    padding: '8px 14px',
                    background: canAfford
                      ? 'linear-gradient(180deg,#16a34a,#15803d)'
                      : 'linear-gradient(180deg,#333,#222)',
                    border: `2px solid ${canAfford ? '#22c55e' : '#444'}`,
                    borderRadius: '3px',
                    color: canAfford ? '#fff8e0' : '#666',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    boxShadow: canAfford ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 0 #14532d' : 'none',
                    whiteSpace: 'nowrap',
                    outline: 'none',
                  }}
                >
                  강화 ({cost} Gas)
                </button>
              </div>
            );
          })}

          <button
            onClick={() => setUpgradeModalOpen(false)}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '8px',
              background: 'linear-gradient(180deg, #b07820, #7a4e10)',
              border: '2px solid #6a3e08',
              borderRadius: '3px',
              color: '#fff8e0',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

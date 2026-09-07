import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import type { UnitRarity, UnitClass } from '../../../types/game';
import { RARITY_COLORS, RARITY_LABELS, getBaseStats } from '../../../utils/gachaUtils';

const RARITIES: UnitRarity[] = [
  'Common', 'Rare', 'Ancient', 'Artifact', 'Narrative', 'Legendary', 'Epic', 'Mythic', 'Primeval'
];

const CLASSES: { type: UnitClass; name: string; icon: string; attackTypeDesc: string }[] = [
  { type: 'Ghost', name: '고스트 (진동형)', icon: '👻', attackTypeDesc: '소형 100% / 중형 50% / 대형 25%' },
  { type: 'Dragoon', name: '드라군 (폭발형)', icon: '🤖', attackTypeDesc: '소형 50% / 중형 75% / 대형 100%' },
  { type: 'Hydra', name: '히드라 (일반형)', icon: '🦎', attackTypeDesc: '소형 100% / 중형 100% / 대형 100%' },
];

const CodexModal: React.FC = () => {
  const { isCodexModalOpen, setCodexModalOpen } = useUIStore();
  const [selectedRarity, setSelectedRarity] = useState<UnitRarity>('Common');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCodexModalOpen) {
        setCodexModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCodexModalOpen, setCodexModalOpen]);

  if (!isCodexModalOpen) return null;

  const currentColor = RARITY_COLORS[selectedRarity];

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
          width: '580px',
          height: '520px',
          background: 'linear-gradient(160deg, #2c1a0e, #180d07)',
          border: '3px solid #8b5e2e',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
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
          <span>📖 메이플 유닛 종합 도감 (UNIT CODEX)</span>
          <button
            onClick={() => setCodexModalOpen(false)}
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

        {/* 바디 (좌측 탭 + 우측 상세) */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, background: '#0d0804' }}>
          {/* 좌측 등급 탭 */}
          <div style={{ width: '130px', borderRight: '2px solid #3a2212', overflowY: 'auto', padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {RARITIES.map((r) => {
              const active = selectedRarity === r;
              const color = RARITY_COLORS[r];
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRarity(r)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '3px',
                    border: `1.5px solid ${active ? color : '#3a2212'}`,
                    background: active ? 'rgba(200,146,42,0.2)' : 'transparent',
                    color: active ? '#fff8e0' : '#888',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none',
                  }}
                >
                  <span style={{ color }}>{RARITY_LABELS[r]}</span>
                  {active && <span style={{ color }}>▶</span>}
                </button>
              );
            })}
          </div>

          {/* 우측 직업별 스탯 표시 */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #3a2212', paddingBottom: '8px' }}>
              <span style={{ color: currentColor, fontWeight: 'bold', fontSize: '18px', textShadow: `0 0 10px ${currentColor}66` }}>
                ★ {RARITY_LABELS[selectedRarity]} 등급 ({selectedRarity})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CLASSES.map((cls) => {
                const stats = getBaseStats(selectedRarity, cls.type);
                return (
                  <div
                    key={cls.type}
                    style={{
                      background: 'linear-gradient(135deg, #1a1008, #100a05)',
                      border: '1px solid #3a2212',
                      borderRadius: '4px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{cls.icon}</span>
                        <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>
                          {RARITY_LABELS[selectedRarity]} {cls.name}
                        </span>
                      </div>
                      <span style={{ color: currentColor, fontSize: '11px', fontWeight: 'bold', border: `1px solid ${currentColor}44`, padding: '1px 6px', borderRadius: '2px' }}>
                        {cls.type}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      <div style={{ background: '#0a0604', padding: '4px 8px', borderRadius: '2px', border: '1px solid #2a180d' }}>
                        <span style={{ color: '#6a4820', fontSize: '9px', display: 'block' }}>기본 공격력</span>
                        <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '13px' }}>{stats.damage.toLocaleString()}</span>
                      </div>
                      <div style={{ background: '#0a0604', padding: '4px 8px', borderRadius: '2px', border: '1px solid #2a180d' }}>
                        <span style={{ color: '#6a4820', fontSize: '9px', display: 'block' }}>공격 딜레이</span>
                        <span style={{ color: '#88aaff', fontWeight: 'bold', fontSize: '13px' }}>{stats.attackSpeed}s</span>
                      </div>
                      <div style={{ background: '#0a0604', padding: '4px 8px', borderRadius: '2px', border: '1px solid #2a180d' }}>
                        <span style={{ color: '#6a4820', fontSize: '9px', display: 'block' }}>사거리</span>
                        <span style={{ color: '#55ff55', fontWeight: 'bold', fontSize: '13px' }}>{stats.range}</span>
                      </div>
                      <div style={{ background: '#0a0604', padding: '4px 8px', borderRadius: '2px', border: '1px solid #2a180d' }}>
                        <span style={{ color: '#6a4820', fontSize: '9px', display: 'block' }}>상성</span>
                        <span style={{ color: '#ddaaff', fontWeight: 'bold', fontSize: '10px' }}>{cls.attackTypeDesc}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodexModal;

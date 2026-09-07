import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import type { UnitRarity } from '../../../types/game';
import { RARITY_COLORS, RARITY_LABELS } from '../../../utils/gachaUtils';

const GACHA_RATES: Record<UnitRarity, string> = {
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

const ProbModal: React.FC = () => {
  const { isProbModalOpen, setProbModalOpen } = useUIStore();
  const [hoverClose, setHoverClose] = useState(false);
  const [activeClose, setActiveClose] = useState(false);

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(2px)',
        fontFamily: '"Gulim", "Dotum", sans-serif',
      }}
    >
      <div
        style={{
          width: '360px',
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
          <span>🎲 SPAWN RATES</span>
          <button
            onClick={() => setProbModalOpen(false)}
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

        {/* 모달 바디 */}
        <div
          style={{
            padding: '20px',
            background: '#0d0804',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 확률 판넬 내부 프레임 */}
          <div
            style={{
              background: '#150d08',
              border: '2px solid #3a2212',
              borderRadius: '3px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
            }}
          >
            {(Object.keys(GACHA_RATES) as UnitRarity[]).map((rarity) => (
              <div
                key={rarity}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #28180d',
                  paddingBottom: '6px',
                }}
              >
                <span
                  style={{
                    color: RARITY_COLORS[rarity],
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textShadow: `0 0 4px ${RARITY_COLORS[rarity]}33`,
                  }}
                >
                  {RARITY_LABELS[rarity]}
                </span>
                <span
                  style={{
                    color: '#ddccaa',
                    fontSize: '13px',
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 'bold',
                  }}
                >
                  {GACHA_RATES[rarity]}
                </span>
              </div>
            ))}
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={() => setProbModalOpen(false)}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => {
              setHoverClose(false);
              setActiveClose(false);
            }}
            onMouseDown={() => setActiveClose(true)}
            onMouseUp={() => setActiveClose(false)}
            style={{
              width: '100%',
              padding: '10px',
              background: hoverClose
                ? 'linear-gradient(180deg, #c8922a, #8b5e1a)'
                : 'linear-gradient(180deg, #b07820, #7a4e10)',
              border: '2px solid #6a3e08',
              borderRadius: '3px',
              color: '#fff8e0',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 #4a2a04`,
              transform: activeClose ? 'translateY(2px)' : 'translateY(0)',
              transition: 'background 0.1s, transform 0.08s',
              outline: 'none',
              textAlign: 'center',
            }}
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProbModal;

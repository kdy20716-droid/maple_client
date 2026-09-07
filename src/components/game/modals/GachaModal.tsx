import React, { useEffect } from 'react';
import { useUIStore } from '../../../store/uiStore';
import GachaPanel from '../../../features/gacha/GachaPanel';

const GachaModal: React.FC = () => {
  const { isGachaModalOpen, setGachaModalOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGachaModalOpen) {
        setGachaModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGachaModalOpen, setGachaModalOpen]);

  if (!isGachaModalOpen) return null;

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
          width: '380px',
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
          <span>🎲 유닛 뽑기 (GACHA SUMMON)</span>
          <button
            onClick={() => setGachaModalOpen(false)}
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

        {/* 가챠 패널 본문 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GachaPanel />
        </div>
      </div>
    </div>
  );
};

export default GachaModal;

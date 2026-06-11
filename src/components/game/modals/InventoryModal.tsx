import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { RARITY_COLORS, RARITY_LABELS } from '../../../utils/gachaUtils';

const InventoryModal: React.FC = () => {
  const { isInventoryModalOpen, setInventoryModalOpen } = useUIStore();
  const { units } = useUnitStore();
  const [hoverClose, setHoverClose] = useState(false);
  const [activeClose, setActiveClose] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInventoryModalOpen) {
        setInventoryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryModalOpen, setInventoryModalOpen]);

  if (!isInventoryModalOpen) return null;

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
          width: '560px',
          height: '480px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎒 INVENTORY</span>
            <span
              style={{
                fontSize: '10px',
                background: 'rgba(0,0,0,0.4)',
                padding: '2px 8px',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'monospace',
                border: '1px solid #3a2212',
              }}
            >
              {units.length} / 50
            </span>
          </div>
          <button
            onClick={() => setInventoryModalOpen(false)}
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

        {/* 인벤토리 격자 바디 영역 */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            background: '#0d0804',
            overflowY: 'auto',
            boxShadow: 'inset 0 0 16px rgba(0,0,0,0.9)',
          }}
          className="custom-scrollbar"
        >
          {units.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5a3818',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '48px', opacity: 0.3 }}>🍄</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>인벤토리가 비어 있습니다.</span>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
              }}
            >
              {units.map((unit) => {
                const rarityColor = RARITY_COLORS[unit.rarity];
                return (
                  <div
                    key={unit.id}
                    style={{
                      background: 'linear-gradient(135deg, #1e120a, #100a05)',
                      border: `1.5px solid #3c2415`,
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = rarityColor;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#3c2415';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* 상단 뱃지 */}
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: rarityColor,
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '1px 6px',
                        borderRadius: '2px',
                        border: `1px solid ${rarityColor}44`,
                        marginBottom: '8px',
                        textShadow: `0 0 4px ${rarityColor}88`,
                      }}
                    >
                      {RARITY_LABELS[unit.rarity]}
                    </span>

                    {/* 유닛 이모지 아이콘 */}
                    <div
                      style={{
                        fontSize: '28px',
                        marginBottom: '6px',
                        filter: `drop-shadow(0 0 6px ${rarityColor}44)`,
                      }}
                    >
                      {unit.class === 'Warrior' ? '⚔️' : unit.class === 'Mage' ? '🔮' : '🏹'}
                    </div>

                    {/* 이름 */}
                    <span
                      style={{
                        color: '#f0d080',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        width: '100%',
                        marginBottom: '6px',
                      }}
                    >
                      {unit.name}
                    </span>

                    {/* 공격력 수치 표시 */}
                    <div
                      style={{
                        width: '100%',
                        borderTop: '1px solid #28180d',
                        paddingTop: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '8px', color: '#5a3818', textTransform: 'uppercase' }}>ATTACK</span>
                      <span style={{ fontSize: '11px', color: '#ddccaa', fontWeight: 'bold' }}>
                        {unit.damage.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 바 */}
        <div
          style={{
            padding: '12px',
            background: 'linear-gradient(180deg, #180d07, #0d0804)',
            borderTop: '2.5px solid #8b5e2e',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setInventoryModalOpen(false)}
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

export default InventoryModal;

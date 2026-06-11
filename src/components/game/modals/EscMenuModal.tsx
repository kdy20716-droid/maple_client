import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useAppStore } from '../../../store/appStore';

const EscMenuModal: React.FC = () => {
  const { isEscMenuOpen, setEscMenuOpen, setProbModalOpen, setInventoryModalOpen } = useUIStore();
  const { setView } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscMenuOpen(!isEscMenuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEscMenuOpen, setEscMenuOpen]);

  if (!isEscMenuOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          width: '320px',
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
          <span>⚙️ SYSTEM MENU</span>
          <button
            onClick={() => setEscMenuOpen(false)}
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
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#0d0804',
          }}
        >
          <MenuButton onClick={() => setEscMenuOpen(false)}>계속하기</MenuButton>
          <MenuButton
            onClick={() => {
              setProbModalOpen(true);
              setEscMenuOpen(false);
            }}
          >
            유닛 획득 확률
          </MenuButton>
          <MenuButton
            onClick={() => {
              setInventoryModalOpen(true);
              setEscMenuOpen(false);
            }}
          >
            보유 유닛 정보
          </MenuButton>

          <div style={{ height: '1.5px', background: '#3a2212', margin: '4px 0' }} />

          <MenuButton
            danger
            onClick={() => {
              if (confirm('정말 로비로 나가시겠습니까?')) {
                setView('LOBBY');
                setEscMenuOpen(false);
              }
            }}
          >
            🚪 로비로 나가기
          </MenuButton>
        </div>
      </div>
    </div>
  );
};

/* ── 내부 버튼 컴포넌트 ── */
const MenuButton: React.FC<{
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, danger = false, children }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const bg = danger
    ? hover
      ? 'linear-gradient(180deg, #ee4444, #aa1010)'
      : 'linear-gradient(180deg, #cc2828, #880808)'
    : hover
    ? 'linear-gradient(180deg, #c8922a, #8b5e1a)'
    : 'linear-gradient(180deg, #b07820, #7a4e10)';

  const border = danger ? '#660404' : '#6a3e08';
  const shadow = danger ? '#330202' : '#4a2a04';
  const text = '#fff8e0';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: '100%',
        padding: '10px',
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: '3px',
        color: text,
        fontFamily: 'inherit',
        fontWeight: 'bold',
        fontSize: '13px',
        cursor: 'pointer',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 ${shadow}`,
        transform: active ? 'translateY(2px)' : 'translateY(0)',
        transition: 'background 0.1s, transform 0.08s',
        outline: 'none',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
};

export default EscMenuModal;

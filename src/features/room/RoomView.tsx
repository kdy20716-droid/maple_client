import React, { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { useAppStore } from '../../store/appStore';
import ChatOverlay from '../../components/chat/ChatOverlay';

/* ── 메이플 버튼 ───────────────────────────────── */
const MBtn: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'orange' | 'green' | 'blue' | 'red' | 'brown';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ onClick, disabled, variant = 'brown', children, style }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const themes: Record<string, { bg: string; border: string; shadow: string; text: string }> = {
    orange: {
      bg: hover ? 'linear-gradient(180deg,#f0b040,#d06000)' : 'linear-gradient(180deg,#d89030,#b05000)',
      border: '#8b4000', shadow: '#5a2800', text: '#fff8e0',
    },
    green: {
      bg: hover ? 'linear-gradient(180deg,#56c840,#2a8c14)' : 'linear-gradient(180deg,#44b830,#1e7c08)',
      border: '#186004', shadow: '#0a4000', text: '#ffffff',
    },
    blue: {
      bg: hover ? 'linear-gradient(180deg,#4488ff,#1a44cc)' : 'linear-gradient(180deg,#2a66ee,#0e2eaa)',
      border: '#0a1e88', shadow: '#060e55', text: '#ffffff',
    },
    red: {
      bg: hover ? 'linear-gradient(180deg,#ee4444,#aa1010)' : 'linear-gradient(180deg,#cc2828,#880808)',
      border: '#660404', shadow: '#330202', text: '#ffffff',
    },
    brown: {
      bg: hover ? 'linear-gradient(180deg,#c8922a,#8b5e1a)' : 'linear-gradient(180deg,#b07820,#7a4e10)',
      border: '#6a3e08', shadow: '#4a2a04', text: '#fff8e0',
    },
  };
  const t = themes[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        background: disabled ? '#333' : t.bg,
        border: `2px solid ${disabled ? '#444' : t.border}`,
        borderRadius: '3px',
        color: disabled ? '#666' : t.text,
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
        fontWeight: 'bold',
        fontSize: '13px',
        padding: '7px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 ${t.shadow}`,
        transform: active ? 'translateY(2px)' : 'translateY(0)',
        transition: 'background 0.1s,transform 0.08s',
        letterSpacing: '0.5px',
        outline: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

/* ── 슬롯 카드 ─────────────────────────────────── */
const SlotCard: React.FC<{
  slot: { id: number; status: string; playerName?: string };
  isHost: boolean;
  onClick: () => void;
}> = ({ slot, isHost, onClick }) => {
  const [hover, setHover] = useState(false);

  const isPlayer = slot.status === 'PLAYER';
  const isClosed = slot.status === 'CLOSED';

  const borderColor = isPlayer ? '#c8922a' : isClosed ? '#3a2010' : hover ? '#8b5e2e' : '#5a3818';
  const bgColor = isPlayer
    ? 'linear-gradient(160deg,rgba(200,146,42,0.15),rgba(200,146,42,0.05))'
    : isClosed
    ? 'rgba(0,0,0,0.4)'
    : hover
    ? 'rgba(200,146,42,0.08)'
    : 'rgba(0,0,0,0.2)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        padding: '24px',
        position: 'relative',
        transition: 'all 0.15s',
        minHeight: '180px',
      }}
    >
      {/* 방장 뱃지 */}
      {isHost && (
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'linear-gradient(135deg,#f0d080,#c8922a)',
          color: '#3a1e08',
          fontSize: '10px', fontWeight: 'bold',
          padding: '2px 8px', borderRadius: '2px',
          fontFamily: '"Gulim",sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}>
          ★ 방장
        </div>
      )}

      {/* 아이콘 */}
      <div style={{
        fontSize: '48px',
        filter: isClosed ? 'grayscale(100%) brightness(0.4)' : 'none',
        textShadow: isPlayer ? '0 0 20px rgba(255,200,80,0.6)' : 'none',
      }}>
        {isPlayer ? '🍄' : isClosed ? '🔒' : '➕'}
      </div>

      {/* 이름 / 상태 */}
      <div style={{
        color: isPlayer ? '#f0d080' : isClosed ? '#444' : '#7a5828',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: '"Gulim",sans-serif',
        textShadow: isPlayer ? '0 0 8px rgba(240,200,80,0.4)' : 'none',
      }}>
        {isPlayer ? slot.playerName || '플레이어' : isClosed ? '닫힌 슬롯' : '빈 자리'}
      </div>

      {/* 상태 뱃지 */}
      <div style={{
        padding: '3px 12px',
        border: `1px solid ${isPlayer ? '#8b5e2e' : isClosed ? '#333' : '#3a2010'}`,
        borderRadius: '2px',
        background: isPlayer ? 'rgba(200,146,42,0.2)' : 'transparent',
        color: isPlayer ? '#c8922a' : isClosed ? '#444' : '#5a3818',
        fontSize: '11px',
        fontFamily: '"Gulim",sans-serif',
      }}>
        {isPlayer ? '● 대기 중' : isClosed ? '폐쇄' : '클릭하여 열기/닫기'}
      </div>
    </div>
  );
};

/* ── 메인 RoomView ─────────────────────────────── */
const RoomView: React.FC = () => {
  const { currentRoom, leaveRoom, toggleSlot, setMode } = useRoomStore();
  const { setView } = useAppStore();

  if (!currentRoom) {
    setView('LOBBY');
    return null;
  }

  const handleStartGame = () => setView('GAME');
  const handleLeave = () => { leaveRoom(); setView('LOBBY'); };

  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative', overflow: 'hidden',
      fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
    }}>
      {/* 배경 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/room_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,rgba(5,5,20,0.65) 0%,rgba(10,5,20,0.5) 100%)',
      }} />

      {/* 메인 패널 */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '24px 32px',
        boxSizing: 'border-box', gap: '16px',
      }}>

        {/* ── 상단 바 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
          background: 'linear-gradient(90deg,#3a1e08,#2a1408,#3a1e08)',
          border: '2px solid #8b5e2e',
          borderRadius: '4px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,180,80,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚔️</span>
            <div>
              <div style={{ color: '#f0d080', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 12px rgba(240,200,80,0.5)' }}>
                {currentRoom.title}
              </div>
              <div style={{ color: '#7a5828', fontSize: '11px', letterSpacing: '2px' }}>
                {currentRoom.mode === 'INDIVIDUAL' ? '개인전 모드' : '협동전 모드'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* 모드 선택 */}
            {(['INDIVIDUAL', 'COOP'] as const).map(m => (
              <MBtn
                key={m}
                variant={currentRoom.mode === m ? 'orange' : 'brown'}
                onClick={() => setMode(m)}
              >
                {m === 'INDIVIDUAL' ? '⚔️ 개인전' : '🤝 협동전'}
              </MBtn>
            ))}
            <div style={{ width: '1px', height: '28px', background: '#3a2010', margin: '0 4px' }} />
            <MBtn variant="red" onClick={handleLeave}>🚪 나가기</MBtn>
          </div>
        </div>

        {/* ── 슬롯 그리드 ── */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '16px',
          background: 'linear-gradient(160deg,rgba(20,10,5,0.7),rgba(10,5,2,0.8))',
          border: '2px solid #5a3818',
          borderRadius: '4px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.3)',
        }}>
          {currentRoom.slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isHost={slot.id === 1}
              onClick={() => toggleSlot(slot.id)}
            />
          ))}
        </div>

        {/* ── 하단 바: 게임 시작 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'linear-gradient(90deg,#2a1408,#1a0e04,#2a1408)',
          border: '2px solid #5a3818',
          borderRadius: '4px',
        }}>
          {/* 팁 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#c8922a', fontSize: '11px' }}>[안내]</span>
            <span style={{ color: '#6a4818', fontSize: '11px' }}>
              슬롯을 클릭하면 열기/닫기 전환 · 4명이 모이면 게임 시작 가능
            </span>
          </div>

          {/* 게임 시작 버튼 */}
          <MBtn variant="orange" onClick={handleStartGame} style={{ padding: '10px 36px', fontSize: '16px' }}>
            ⚔ 게임 시작!
          </MBtn>
        </div>
      </div>

      {/* 채팅 오버레이 */}
      <div style={{ position: 'absolute', bottom: '90px', left: '24px', zIndex: 20 }}>
        <ChatOverlay />
      </div>
    </div>
  );
};

export default RoomView;

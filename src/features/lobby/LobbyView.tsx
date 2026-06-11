import React, { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import type { RoomInfo } from '../../store/roomStore';
import { useAppStore } from '../../store/appStore';

const ITEMS_PER_PAGE = 12;

/* ── 메이플 스타일 버튼 ─────────────────────────── */
const MBtn: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'green' | 'blue' | 'brown' | 'red';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, variant = 'brown', children, className = '' }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const themes: Record<string, { bg: string; border: string; shadow: string; text: string }> = {
    brown: {
      bg: hover ? 'linear-gradient(180deg,#c8922a,#8b5e1a)' : 'linear-gradient(180deg,#b07820,#7a4e10)',
      border: '#6a3e08', shadow: '#4a2a04', text: '#fff8e0',
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
      className={className}
      style={{
        background: disabled ? '#555' : t.bg,
        border: `2px solid ${disabled ? '#444' : t.border}`,
        borderRadius: '3px',
        color: disabled ? '#999' : t.text,
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
        fontWeight: 'bold',
        fontSize: '13px',
        padding: '6px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 0 ${t.shadow}`,
        transform: active ? 'translateY(2px)' : 'translateY(0)',
        transition: 'background 0.1s,transform 0.08s',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
};

/* ── 패널 래퍼 ─────────────────────────────────── */
const MaplePanel: React.FC<{
  title: string;
  icon?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, icon, children, style }) => (
  <div style={{
    background: 'linear-gradient(160deg,#2a1a0e,#1a0e06)',
    border: '3px solid #8b5e2e',
    borderRadius: '4px',
    boxShadow: '0 0 0 1px #4a2e10, 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,180,80,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...style,
  }}>
    {/* 패널 헤더 */}
    <div style={{
      background: 'linear-gradient(90deg,#5a3010,#3a1e08,#5a3010)',
      borderBottom: '2px solid #8b5e2e',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      <span style={{
        color: '#f0d080',
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
        fontWeight: 'bold',
        fontSize: '14px',
        letterSpacing: '1px',
        textShadow: '0 0 8px rgba(240,200,80,0.5)',
      }}>{title}</span>
      {/* 헤더 장식 */}
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(200,146,42,0.4),transparent)', marginLeft: '8px' }} />
    </div>
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </div>
);

/* ── 방 카드 ─────────────────────────────────── */
const RoomCard: React.FC<{ room: RoomInfo; onClick: () => void }> = ({ room, onClick }) => {
  const [hover, setHover] = useState(false);
  const players = room.slots.filter(s => s.status === 'PLAYER').length;
  const open = room.slots.filter(s => s.status === 'OPEN').length;
  const isFull = open === 0;

  return (
    <div
      onClick={!isFull ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 14px',
        borderBottom: '1px solid #3a2010',
        background: hover && !isFull
          ? 'linear-gradient(90deg,rgba(200,146,42,0.15),rgba(200,146,42,0.05))'
          : 'transparent',
        cursor: isFull ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        gap: '12px',
      }}
    >
      {/* 방 번호/아이콘 */}
      <div style={{
        width: '32px', height: '32px',
        background: isFull ? '#333' : 'rgba(200,146,42,0.2)',
        border: `1px solid ${isFull ? '#444' : '#8b5e2e'}`,
        borderRadius: '3px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', flexShrink: 0,
      }}>
        {isFull ? '🔒' : '🍁'}
      </div>

      {/* 방 제목 & 모드 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: isFull ? '#666' : (hover ? '#f0d080' : '#e0c070'),
          fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
          fontWeight: 'bold',
          fontSize: '13px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.15s',
        }}>
          {room.title}
        </div>
        <div style={{ color: '#7a5828', fontSize: '11px', fontFamily: '"Gulim",sans-serif' }}>
          {room.mode === 'INDIVIDUAL' ? '개인전' : '협동전'}
        </div>
      </div>

      {/* 인원 */}
      <div style={{
        background: isFull ? '#330000' : 'rgba(30,80,180,0.3)',
        border: `1px solid ${isFull ? '#550000' : '#1a44cc'}`,
        borderRadius: '3px',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: isFull ? '#aa4444' : '#88aaff',
        fontFamily: '"Gulim",sans-serif',
        flexShrink: 0,
      }}>
        {players} / 4
      </div>

      {/* 상태 뱃지 */}
      <div style={{
        width: '52px', textAlign: 'center',
        background: isFull ? '#440000' : 'rgba(20,100,20,0.3)',
        border: `1px solid ${isFull ? '#880000' : '#186004'}`,
        borderRadius: '3px',
        padding: '2px 0',
        fontSize: '11px',
        fontWeight: 'bold',
        color: isFull ? '#ff6666' : '#66ee66',
        fontFamily: '"Gulim",sans-serif',
        flexShrink: 0,
      }}>
        {isFull ? '가득참' : '입장가능'}
      </div>
    </div>
  );
};

/* ── 방 만들기 모달 ─────────────────────────────── */
const CreateRoomModal: React.FC<{
  onClose: () => void;
  onCreate: (title: string, mode: 'INDIVIDUAL' | 'COOP') => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'INDIVIDUAL' | 'COOP'>('INDIVIDUAL');

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), mode);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <MaplePanel title="🍁  방 만들기" style={{ width: '380px' }}>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 방 제목 */}
          <div>
            <label style={{ color: '#b8902a', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontFamily: '"Gulim",sans-serif', letterSpacing: '1px' }}>
              방 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={20}
              placeholder="방 제목을 입력하세요 (최대 20자)"
              autoFocus
              style={{
                width: '100%', padding: '8px 10px', boxSizing: 'border-box',
                background: '#0d0803', border: '2px solid #5a3818', borderRadius: '2px',
                color: '#f0d080', fontSize: '13px', outline: 'none',
                fontFamily: '"Gulim",sans-serif', caretColor: '#f0d080',
              }}
              onFocus={e => { e.target.style.borderColor = '#c8922a'; }}
              onBlur={e => { e.target.style.borderColor = '#5a3818'; }}
            />
          </div>

          {/* 모드 선택 */}
          <div>
            <label style={{ color: '#b8902a', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', fontFamily: '"Gulim",sans-serif', letterSpacing: '1px' }}>
              게임 모드
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['INDIVIDUAL', 'COOP'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: '8px', border: `2px solid ${mode === m ? '#c8922a' : '#3a2010'}`,
                    borderRadius: '3px', background: mode === m ? 'rgba(200,146,42,0.2)' : 'transparent',
                    color: mode === m ? '#f0d080' : '#7a5828', cursor: 'pointer',
                    fontFamily: '"Gulim",sans-serif', fontWeight: 'bold', fontSize: '13px',
                    transition: 'all 0.15s', outline: 'none',
                  }}
                >
                  {m === 'INDIVIDUAL' ? '⚔️ 개인전' : '🤝 협동전'}
                </button>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <MBtn variant="green" onClick={handleCreate} className="flex-1">
              ✅ 방 만들기
            </MBtn>
            <MBtn variant="red" onClick={onClose}>
              ✕ 취소
            </MBtn>
          </div>
        </div>
      </MaplePanel>
    </div>
  );
};

/* ── 메인 로비 ─────────────────────────────────── */
const LobbyView: React.FC = () => {
  const { rooms, createRoom, joinRoom } = useRoomStore();
  const { setView } = useAppStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = rooms.filter(r => r.title.includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleJoin = (room: RoomInfo) => {
    const open = room.slots.filter(s => s.status === 'OPEN').length;
    if (open === 0) return;
    joinRoom(room.id);
    setView('ROOM');
  };

  const handleCreate = (title: string, mode: 'INDIVIDUAL' | 'COOP') => {
    createRoom(title, mode);
    setView('ROOM');
  };

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
    }}>
      {/* ── 배경 ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/lobby_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      {/* 배경 어둠 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,rgba(5,10,30,0.55) 0%,rgba(10,20,50,0.4) 60%,rgba(0,0,0,0.6) 100%)',
      }} />

      {/* ── 낙엽 파티클 ── */}
      {LEAVES.map((l, i) => <FloatLeaf key={i} leaf={l} />)}

      {/* ── 컨텐츠 영역 ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '24px 32px',
        boxSizing: 'border-box',
        gap: '16px',
      }}>

        {/* ── 상단 타이틀 바 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>🍁</span>
            <div>
              <div style={{
                color: '#f0d080', fontSize: '22px', fontWeight: 'bold',
                textShadow: '0 0 20px rgba(240,200,80,0.6), 2px 2px 4px rgba(0,0,0,0.9)',
                letterSpacing: '2px',
              }}>
                메이플 운빨 디펜스
              </div>
              <div style={{ color: '#b8902a', fontSize: '11px', letterSpacing: '3px' }}>
                MAPLESTORY LUCK DEFENSE
              </div>
            </div>
          </div>

          {/* 우측: 접속자 수 */}
          <div style={{
            background: 'rgba(0,0,0,0.6)', border: '1px solid #5a3818',
            borderRadius: '4px', padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44ee44', display: 'inline-block', boxShadow: '0 0 6px #44ee44' }} />
            <span style={{ color: '#a0d0a0', fontSize: '12px' }}>서버 접속 중</span>
          </div>
        </div>

        {/* ── 메인 패널 ── */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', minHeight: 0 }}>

          {/* 방 목록 패널 (좌측 넓은 영역) */}
          <MaplePanel title="⚔  채널 1 — 방 목록" icon="" style={{ flex: 1 }}>
            {/* 검색 + 버튼 바 */}
            <div style={{
              padding: '10px 12px', borderBottom: '1px solid #3a2010',
              display: 'flex', gap: '10px', alignItems: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{
                  position: 'absolute', left: '10px', top: '50%',
                  transform: 'translateY(-50%)', color: '#5a3818', fontSize: '13px',
                }}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="방 제목 검색..."
                  style={{
                    width: '100%', padding: '7px 10px 7px 32px', boxSizing: 'border-box',
                    background: '#0d0803', border: '2px solid #5a3818', borderRadius: '2px',
                    color: '#f0d080', fontSize: '12px', outline: 'none',
                    fontFamily: '"Gulim",sans-serif', caretColor: '#f0d080',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#c8922a'; }}
                  onBlur={e => { e.target.style.borderColor = '#5a3818'; }}
                />
              </div>
              <MBtn variant="green" onClick={() => setShowCreate(true)}>
                + 방 만들기
              </MBtn>
              <MBtn variant="brown" onClick={() => setPage(1)}>
                🔄 새로고침
              </MBtn>
            </div>

            {/* 테이블 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '5px 14px', background: 'rgba(0,0,0,0.4)',
              borderBottom: '1px solid #3a2010',
            }}>
              <div style={{ width: '32px', flexShrink: 0 }} />
              <div style={{ flex: 1, color: '#7a5828', fontSize: '11px', fontWeight: 'bold' }}>방 제목</div>
              <div style={{ width: '50px', color: '#7a5828', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>인원</div>
              <div style={{ width: '52px', color: '#7a5828', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>상태</div>
            </div>

            {/* 방 목록 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {paged.length === 0 ? (
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                }}>
                  <span style={{ fontSize: '48px', opacity: 0.3 }}>🍄</span>
                  <span style={{ color: '#5a3818', fontSize: '14px', fontWeight: 'bold' }}>
                    {search ? '검색 결과가 없습니다.' : '생성된 방이 없습니다. 방을 만들어보세요!'}
                  </span>
                </div>
              ) : (
                paged.map(room => (
                  <RoomCard key={room.id} room={room} onClick={() => handleJoin(room)} />
                ))
              )}
            </div>

            {/* 페이지 네이션 */}
            <div style={{
              padding: '8px 12px', borderTop: '1px solid #3a2010',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#7a5828', fontSize: '11px' }}>
                총 {filtered.length}개 방
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MBtn variant="brown" disabled={page === 1} onClick={() => setPage(p => p - 1)}>◀ 이전</MBtn>
                <span style={{ color: '#c8922a', fontSize: '13px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
                  {page} / {totalPages}
                </span>
                <MBtn variant="brown" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>다음 ▶</MBtn>
              </div>
              <span style={{ color: '#7a5828', fontSize: '11px', width: '60px' }} />
            </div>
          </MaplePanel>

          {/* 우측 사이드 패널 */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* 공지사항 */}
            <MaplePanel title="📢  공지사항" style={{ flex: 1 }}>
              <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                {NOTICES.map((n, i) => (
                  <div key={i} style={{
                    padding: '8px 0',
                    borderBottom: i < NOTICES.length - 1 ? '1px solid #2a1508' : 'none',
                  }}>
                    <div style={{ color: '#c8922a', fontSize: '10px', marginBottom: '3px' }}>{n.date}</div>
                    <div style={{ color: '#d0b070', fontSize: '12px', fontWeight: 'bold', lineHeight: '1.4' }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </MaplePanel>

            {/* 빠른 메뉴 */}
            <MaplePanel title="🗺  빠른 메뉴">
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <MBtn variant="green" onClick={() => setShowCreate(true)} className="w-full">
                  ⚔ 방 만들기
                </MBtn>
                <MBtn variant="blue" onClick={() => {}} className="w-full">
                  🏆 랭킹 보기
                </MBtn>
                <MBtn variant="brown" onClick={() => {}} className="w-full">
                  📖 도감
                </MBtn>
                <div style={{ borderTop: '1px solid #3a2010', paddingTop: '8px', marginTop: '2px' }}>
                  <MBtn variant="red" onClick={() => setView('LOGIN')} className="w-full">
                    🚪 로그아웃
                  </MBtn>
                </div>
              </div>
            </MaplePanel>
          </div>
        </div>

        {/* ── 하단 상태바 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 14px',
          background: 'rgba(0,0,0,0.5)', border: '1px solid #3a2010', borderRadius: '3px',
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {STATUS_TIPS.map((tip, i) => (
              <span key={i} style={{ color: '#6a4818', fontSize: '11px' }}>
                <span style={{ color: '#c8922a' }}>[Tip]</span> {tip}
              </span>
            ))}
          </div>
          <span style={{ color: '#4a3010', fontSize: '10px' }}>© 2003-2025 NEXON / Maple Defense</span>
        </div>
      </div>

      {/* ── 방 만들기 모달 ── */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

/* ── 낙엽 ─────────────────────────────────────── */
const LEAVES = Array.from({ length: 15 }, (_, i) => ({
  x: Math.random() * 100,
  delay: i * 1.2,
  duration: 8 + Math.random() * 6,
  size: 10 + Math.random() * 12,
}));

const LEAF_COLORS = ['#c84010','#e06020','#f0a030','#d05020'];

const FloatLeaf: React.FC<{ leaf: typeof LEAVES[0] }> = ({ leaf }) => (
  <div style={{
    position: 'absolute', left: `${leaf.x}vw`, top: '-20px',
    width: `${leaf.size}px`, height: `${leaf.size}px`,
    zIndex: 5, pointerEvents: 'none', opacity: 0.6,
    animation: `leafFall ${leaf.duration}s ${leaf.delay}s linear infinite`,
  }}>
    <svg viewBox="0 0 24 24" fill={LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]} style={{ width: '100%', height: '100%' }}>
      <path d="M12 2C12 2 8 6 8 10C8 10 4 8 2 10C2 10 4 14 8 14C8 14 6 18 8 20C8 20 11 17 12 14C13 17 16 20 16 20C18 18 16 14 16 14C20 14 22 10 22 10C20 8 16 10 16 10C16 6 12 2 12 2Z"/>
    </svg>
  </div>
);

/* ── 공지사항 데이터 ─── */
const NOTICES = [
  { date: '2025.06.11', text: '메이플 디펜스 서버 오픈!' },
  { date: '2025.06.11', text: '레전더리 이상 등급 등장 이펙트 추가' },
  { date: '2025.06.10', text: '서버 점검 완료 (00:00~02:00)' },
  { date: '2025.06.09', text: '랭킹 시스템 업데이트 예정' },
];

/* ── 팁 ─── */
const STATUS_TIPS = [
  '뽑기로 레전더리 이상 등급이 나오면 특별 연출이 등장합니다!',
  '유닛은 우클릭으로 이동시킬 수 있습니다.',
];

export default LobbyView;

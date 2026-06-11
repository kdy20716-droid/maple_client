import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';

// ──────────────────────────────────────────────
// Phase 1: Nexon / Wizet 제작사 스플래시
// Phase 2: 메이플스토리 로그인 화면
// ──────────────────────────────────────────────

type Phase = 'nexon' | 'wizet' | 'fadein' | 'login';

const LoginView: React.FC = () => {
  const { setView } = useAppStore();
  const [phase, setPhase] = useState<Phase>('nexon');
  const [opacity, setOpacity] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);
  const [leavesPos, setLeavesPos] = useState<{ x: number; y: number; rot: number; speed: number; size: number; delay: number }[]>([]);

  // 낙엽 초기화
  useEffect(() => {
    const leaves = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      rot: Math.random() * 360,
      speed: 0.04 + Math.random() * 0.06,
      size: 12 + Math.random() * 18,
      delay: i * 0.4,
    }));
    setLeavesPos(leaves);
  }, []);

  // 스플래시 시퀀스
  useEffect(() => {
    // Nexon 로고 페이드인
    const t1 = setTimeout(() => setOpacity(1), 100);
    // 로딩바 진행
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 4 + 2;
      if (prog >= 100) { prog = 100; clearInterval(interval); }
      setLoadingProgress(Math.min(prog, 100));
    }, 60);
    // Nexon → Wizet 전환
    const t2 = setTimeout(() => { setOpacity(0); }, 2800);
    const t3 = setTimeout(() => { setPhase('wizet'); setOpacity(1); }, 3200);
    // Wizet → 로그인 페이드인
    const t4 = setTimeout(() => { setOpacity(0); }, 5200);
    const t5 = setTimeout(() => { setPhase('fadein'); setOpacity(0); }, 5600);
    const t6 = setTimeout(() => { setPhase('login'); setOpacity(1); }, 5700);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = () => {
    if (!loginId.trim()) {
      setLoginError('아이디를 입력해 주세요.');
      triggerShake(); return;
    }
    if (!loginPw.trim()) {
      setLoginError('비밀번호를 입력해 주세요.');
      triggerShake(); return;
    }
    setView('LOBBY');
  };

  const handleGuest = () => setView('LOBBY');

  const triggerShake = () => {
    setLoginShake(true);
    setTimeout(() => setLoginShake(false), 500);
  };

  // ── 스플래시 화면 ──
  if (phase === 'nexon' || phase === 'wizet') {
    return (
      <div
        className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
        style={{ transition: 'none' }}
      >
        <div
          style={{
            opacity,
            transition: 'opacity 0.4s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {phase === 'nexon' ? (
            <>
              {/* Nexon 로고 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: '"Arial Black", sans-serif',
                  fontSize: '72px',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '8px',
                  textShadow: '0 0 40px rgba(255,255,255,0.3)',
                  lineHeight: 1,
                }}>
                  NEXON
                </div>
                <div style={{
                  width: '180px',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                  margin: '12px auto 0',
                  opacity: 0.5,
                }} />
                <div style={{
                  color: '#666',
                  fontSize: '12px',
                  letterSpacing: '4px',
                  marginTop: '8px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  A NEXON COMPANY
                </div>
              </div>

              {/* 로딩바 */}
              <div style={{ width: '280px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#222',
                  border: '1px solid #444',
                }}>
                  <div style={{
                    width: `${loadingProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4488ff, #88bbff)',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <div style={{ color: '#555', fontSize: '10px', textAlign: 'right', marginTop: '4px', fontFamily: 'Arial' }}>
                  {Math.floor(loadingProgress)}%
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Wizet 로고 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '56px',
                  fontWeight: 900,
                  background: 'linear-gradient(180deg, #ffdd44, #ff8800)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '6px',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 20px rgba(255,180,0,0.5))',
                  lineHeight: 1,
                }}>
                  WIZET
                </div>
                <div style={{
                  color: '#664400',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  marginTop: '8px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  GAME DEVELOPED BY WIZET
                </div>
                <div style={{
                  color: '#333',
                  fontSize: '10px',
                  marginTop: '4px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  © 2003 NEXON Corporation
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── 로그인 화면 ──
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        opacity,
        transition: 'opacity 0.6s ease',
        fontFamily: '"Gulim", "Dotum", "MS Gothic", sans-serif',
      }}
    >
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/maple_login_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      />

      {/* 배경 어둠 오버레이 */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(10,5,30,0.45) 0%, rgba(20,10,50,0.2) 50%, rgba(0,0,0,0.5) 100%)',
      }} />

      {/* 낙엽 파티클 */}
      {leavesPos.map((leaf, i) => (
        <FallingLeaf key={i} leaf={leaf} />
      ))}





      {/* 중앙 로그인 패널 — 오래된 책/노트북 스타일 */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div
          className={`relative ${loginShake ? 'animate-shake' : ''}`}
          style={{
            width: '340px',
          }}
        >
          {/* 책 배경 패널 */}
          <div style={{
            background: 'linear-gradient(160deg, #2a1a0e 0%, #1a0e06 100%)',
            border: '3px solid #8b5e2e',
            borderRadius: '4px',
            boxShadow: `
              0 0 0 1px #4a2e10,
              0 8px 40px rgba(0,0,0,0.8),
              inset 0 1px 0 rgba(255,180,80,0.15),
              0 0 60px rgba(200,100,20,0.2)
            `,
            padding: '28px 28px 24px',
          }}>
            {/* 상단 장식 */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #5a3818',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#c8922a',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}>
                ✦ MapleStory ✦
              </div>
              <div style={{
                fontSize: '18px',
                color: '#f0d080',
                fontWeight: 'bold',
                marginTop: '4px',
                textShadow: '0 0 10px rgba(240,200,80,0.4)',
              }}>
                로그인
              </div>
              {/* 장식 선 */}
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '2px',
                background: '#c8922a',
              }} />
            </div>

            {/* 아이디 입력 */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#b8902a', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>
                아이디 (ID)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={loginId}
                  onChange={e => { setLoginId(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  maxLength={12}
                  placeholder="아이디를 입력하세요"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#0d0803',
                    border: '2px solid #5a3818',
                    borderRadius: '2px',
                    color: '#f0d080',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    caretColor: '#f0d080',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#c8922a'; e.target.style.boxShadow = '0 0 8px rgba(200,146,42,0.3)'; }}
                  onBlur={e => { e.target.style.borderColor = '#5a3818'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#b8902a', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>
                비밀번호 (PW)
              </label>
              <input
                type="password"
                value={loginPw}
                onChange={e => { setLoginPw(e.target.value); setLoginError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                maxLength={12}
                placeholder="비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#0d0803',
                  border: '2px solid #5a3818',
                  borderRadius: '2px',
                  color: '#f0d080',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  caretColor: '#f0d080',
                }}
                onFocus={e => { e.target.style.borderColor = '#c8922a'; e.target.style.boxShadow = '0 0 8px rgba(200,146,42,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = '#5a3818'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* 오류 메시지 */}
            <div style={{
              height: '16px',
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              {loginError && (
                <span style={{ color: '#ff6060', fontSize: '11px', fontWeight: 'bold' }}>
                  ⚠ {loginError}
                </span>
              )}
            </div>

            {/* 로그인 버튼 */}
            <MapleButton onClick={handleLogin} primary>
              로그인
            </MapleButton>

            {/* 구분선 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '12px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#3a2010' }} />
              <span style={{ color: '#5a4020', fontSize: '10px' }}>또는</span>
              <div style={{ flex: 1, height: '1px', background: '#3a2010' }} />
            </div>

            {/* 비회원 버튼 */}
            <MapleButton onClick={handleGuest}>
              비회원으로 시작
            </MapleButton>

            {/* 하단 링크들 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #2a1810',
            }}>
              {['회원가입', '아이디 찾기', '비밀번호 찾기'].map(text => (
                <button
                  key={text}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7a5828',
                    fontSize: '10px',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                    textDecorationColor: '#4a3818',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c8922a')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7a5828')}
                  onClick={() => setLoginError('현재 지원하지 않는 기능입니다.')}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* 하단 Nexon 저작권 */}
          <div style={{
            textAlign: 'center',
            marginTop: '10px',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '9px',
            letterSpacing: '1px',
          }}>
            © 2003-2025 NEXON Korea Corporation and NEXON America Inc. All Rights Reserved.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease; }

        @keyframes leafFall {
          0%   { transform: translateY(0vh) rotate(0deg); opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }

        input::placeholder { color: #4a3010 !important; }
      `}</style>
    </div>
  );
};

// ── 낙엽 컴포넌트 ──
const LEAF_COLORS = ['#c84010', '#e06020', '#f0a030', '#d05020', '#b83010'];

const FallingLeaf: React.FC<{
  leaf: { x: number; y: number; rot: number; speed: number; size: number; delay: number };
}> = ({ leaf }) => {
  const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
  const duration = 6 + leaf.speed * 60;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${leaf.x}vw`,
        top: `${leaf.y}vh`,
        width: `${leaf.size}px`,
        height: `${leaf.size}px`,
        pointerEvents: 'none',
        zIndex: 5,
        animation: `leafFall ${duration}s ${leaf.delay}s linear infinite`,
      }}
    >
      {/* 단풍잎 SVG */}
      <svg viewBox="0 0 24 24" fill={color} style={{ width: '100%', height: '100%', opacity: 0.85 }}>
        <path d="M12 2C12 2 8 6 8 10C8 10 4 8 2 10C2 10 4 14 8 14C8 14 6 18 8 20C8 20 11 17 12 14C13 17 16 20 16 20C18 18 16 14 16 14C20 14 22 10 22 10C20 8 16 10 16 10C16 6 12 2 12 2Z"/>
      </svg>
    </div>
  );
};

// ── 메이플 스타일 버튼 컴포넌트 ──
const MapleButton: React.FC<{
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ onClick, primary = false, children }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const bg = primary
    ? hover
      ? 'linear-gradient(180deg, #e8a030 0%, #b06010 50%, #903000 100%)'
      : 'linear-gradient(180deg, #d09028 0%, #9a5010 50%, #7a2800 100%)'
    : hover
      ? 'linear-gradient(180deg, #3a2810 0%, #2a1808 100%)'
      : 'linear-gradient(180deg, #2e2010 0%, #1e1006 100%)';

  const border = primary ? '#c8922a' : '#5a3818';
  const textColor = primary ? '#fff8e0' : '#a07838';
  const glow = primary && hover ? '0 0 16px rgba(200,146,42,0.6)' : 'none';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: '100%',
        padding: '9px',
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: '3px',
        color: textColor,
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '1px',
        boxShadow: `inset 0 1px 0 rgba(255,220,100,0.15), ${glow}`,
        transform: active ? 'translateY(1px)' : 'translateY(0)',
        transition: 'all 0.1s ease',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
};

export default LoginView;

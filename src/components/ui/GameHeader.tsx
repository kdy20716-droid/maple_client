import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getStageConfig } from '../../utils/stageUtils';
import { isBossStage } from '../../utils/monsterUtils';

const HeaderQuickBtn: React.FC<{
  icon: string;
  label: string;
  hotkey?: string;
  onClick: () => void;
}> = ({ icon, label, hotkey, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '3px 8px',
        background: hover ? 'linear-gradient(180deg,#c8922a,#8b5e1a)' : 'linear-gradient(180deg,#3a2010,#241408)',
        border: `1px solid ${hover ? '#f0d080' : '#5a3818'}`,
        borderRadius: '3px',
        color: hover ? '#fff8e0' : '#dccfc4',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all 0.1s',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {hotkey && <span style={{ fontSize: '9px', color: hover ? '#ffe090' : '#8e6d46', background: 'rgba(0,0,0,0.3)', padding: '0 3px', borderRadius: '2px' }}>{hotkey}</span>}
    </button>
  );
};

const GameHeader: React.FC = () => {
  const { mineral, gas, wave, monsterCount, maxMonsterCount, stageTimeLeft, tickets } = useGameStore();
  const stageInfo = getStageConfig(wave);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const padMins = String(mins).padStart(2, '0');
    const padSecs = String(secs).padStart(2, '0');
    return `${padMins}:${padSecs}`;
  };

  const danger = monsterCount >= 70;

  // 스폰 대기 시간 계산
  const isSpawnWait = wave === 1 ? stageTimeLeft > 120 : stageTimeLeft > 130;
  const waitTimeLeft = wave === 1 ? stageTimeLeft - 120 : stageTimeLeft - 130;

  return (
    <header
      data-no-pan="true"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '52px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'linear-gradient(180deg,#1a0e06 0%,#120a04 100%)',
        borderBottom: '3px solid #8b5e2e',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,180,80,0.1)',
        fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
      }}
    >
      {/* 왼쪽: 타이틀 & 퀵 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🍁</span>
          <h1 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#f0d080',
            letterSpacing: '2px',
            textShadow: '0 0 12px rgba(240,200,80,0.5)',
          }}>
            메이플 운빨 디펜스
          </h1>
        </div>

        {/* 헤더 퀵 네비게이션 버튼들 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px' }}>
          <HeaderQuickBtn icon="💎" label="뽑기" hotkey="G" onClick={() => useUIStore.getState().setGachaModalOpen(true)} />
          <HeaderQuickBtn icon="🟢" label="강화" hotkey="U" onClick={() => useUIStore.getState().setUpgradeModalOpen(true)} />
          <HeaderQuickBtn icon="🎒" label="인벤" hotkey="I" onClick={() => useUIStore.getState().setInventoryModalOpen(true)} />
          <HeaderQuickBtn icon="📖" label="도감" onClick={() => useUIStore.getState().setCodexModalOpen(true)} />
          <HeaderQuickBtn icon="⚙️" label="메뉴" hotkey="ESC" onClick={() => useUIStore.getState().setEscMenuOpen(true)} />
        </div>
      </div>

      {/* 중앙: 스테이지 표시 및 남은 시간 */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '5px 16px',
        background: 'rgba(200,146,42,0.18)',
        border: '1.5px solid #8b5e2e',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(240,200,80,0.15), inset 0 0 8px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#e2ab54', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1.5px' }}>STAGE</span>
          <span style={{ color: '#ffd700', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 8px rgba(255,215,0,0.5)' }}>
            {wave}
          </span>
          <span style={{ color: '#8b7050', fontSize: '11px', fontWeight: 'bold' }}>/ 150</span>
          {isBossStage(wave) && (
            <span style={{ 
              background: 'linear-gradient(180deg, #ef4444, #991b1b)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              border: '1px solid #fca5a5',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
            }}>
              BOSS
            </span>
          )}
          <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold', marginLeft: '2px', textShadow: '1px 1px 1px #000' }}>
            . {stageInfo.name}
          </span>
        </div>

        {/* 세로 구분선 */}
        <div style={{ width: '1px', height: '16px', background: '#8b5e2e', opacity: 0.6 }} />

        {/* 대기 시간 / 남은 시간 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ 
            color: isSpawnWait ? '#ffd700' : '#cbbba9', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            letterSpacing: '0.5px',
            textShadow: isSpawnWait ? '0 0 6px rgba(255,215,0,0.3)' : 'none'
          }}>
            {isSpawnWait ? '대기 시간' : '남은 시간'}
          </span>
          <span style={{ 
            color: isSpawnWait ? '#ffb000' : (stageTimeLeft < 30 ? '#ff4444' : '#ffcc00'), 
            fontSize: '13px', 
            fontWeight: 'bold', 
            textShadow: isSpawnWait 
              ? '0 0 8px rgba(255,176,0,0.5)' 
              : (stageTimeLeft < 30 ? '0 0 8px rgba(255,68,68,0.6)' : '0 0 6px rgba(255,204,0,0.4)'),
            fontFamily: '"Gulim", sans-serif',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {isSpawnWait ? `${Math.ceil(waitTimeLeft)}초` : formatTime(stageTimeLeft)}
          </span>
        </div>
      </div>

      {/* 오른쪽: 미네랄 + 가스 + 몬스터 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 미네랄 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #0284c7',
          borderRadius: '3px',
        }}>
          <span style={{ fontSize: '13px' }}>💎</span>
          <span style={{ color: '#38bdf8', fontSize: '10px', letterSpacing: '0.5px' }}>미네랄</span>
          <span style={{ color: '#bae6fd', fontSize: '14px', fontWeight: 'bold' }}>
            {mineral.toLocaleString()}
          </span>
        </div>

        {/* 가스 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #16a34a',
          borderRadius: '3px',
        }}>
          <span style={{ fontSize: '13px' }}>🟢</span>
          <span style={{ color: '#4ade80', fontSize: '10px', letterSpacing: '0.5px' }}>가스</span>
          <span style={{ color: '#bbf7d0', fontSize: '14px', fontWeight: 'bold' }}>
            {gas.toLocaleString()}
          </span>
        </div>

        {/* 보스 선택권 티켓 보유 알림 (있을 때만) */}
        {(tickets.Artifact > 0 || tickets.Narrative > 0 || tickets.Legendary > 0) && (
          <div 
            onClick={() => useUIStore.getState().setGachaModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px',
              background: 'linear-gradient(180deg, #d97706, #b45309)',
              border: '1px solid #fde68a',
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
              animation: 'pulse 1.5s infinite'
            }}
          >
            <span style={{ fontSize: '12px' }}>🎫</span>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>
              선택권 {tickets.Artifact + tickets.Narrative + tickets.Legendary}장
            </span>
          </div>
        )}

        {/* 몬스터 카운트 (100마리 제한) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: danger ? 'rgba(200,30,30,0.2)' : 'rgba(30,30,50,0.4)',
          border: `1px solid ${danger ? '#aa2020' : '#2a1e3a'}`,
          borderRadius: '3px',
          transition: 'all 0.3s',
        }}>
          <span style={{ fontSize: '13px' }}>👾</span>
          <span style={{ color: danger ? '#ff8080' : '#8080b0', fontSize: '10px', letterSpacing: '0.5px' }}>
            {danger ? '⚠ 위험!' : '몬스터'}
          </span>
          <span style={{
            color: danger ? '#ff4444' : '#aaaadd',
            fontSize: '14px', fontWeight: 'bold',
            textShadow: danger ? '0 0 8px rgba(255,60,60,0.7)' : 'none',
            animation: danger ? 'pulse 1s infinite' : 'none',
          }}>
            {monsterCount}
            <span style={{ color: '#666', fontSize: '11px' }}> / {maxMonsterCount}</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;

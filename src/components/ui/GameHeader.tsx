import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getStageConfig } from '../../utils/stageUtils';

const GameHeader: React.FC = () => {
  const { gold, wave, monsterCount, maxMonsterCount, stageTimeLeft } = useGameStore();
  const stageInfo = getStageConfig(wave);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  const danger = monsterCount >= 70;

  return (
    <header
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
      {/* 왼쪽: 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            MAPLE DEFENSE
          </h1>
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
          <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold', marginLeft: '2px', textShadow: '1px 1px 1px #000' }}>
            . {stageInfo.name}
          </span>
        </div>

        {/* 세로 구분선 */}
        <div style={{ width: '1px', height: '16px', background: '#8b5e2e', opacity: 0.6 }} />

        {/* 남은 시간 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#cbbba9', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>남은 시간</span>
          <span style={{ 
            color: stageTimeLeft < 30 ? '#ff4444' : '#ffcc00', 
            fontSize: '13px', 
            fontWeight: 'bold', 
            textShadow: stageTimeLeft < 30 ? '0 0 8px rgba(255,68,68,0.6)' : '0 0 6px rgba(255,204,0,0.4)',
            fontFamily: '"Gulim", sans-serif',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {formatTime(stageTimeLeft)}
          </span>
        </div>
      </div>

      {/* 오른쪽: 골드 + 몬스터 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* 골드 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 14px',
          background: 'rgba(200,146,42,0.1)',
          border: '1px solid #6a4018',
          borderRadius: '3px',
        }}>
          <span style={{ fontSize: '14px' }}>💰</span>
          <span style={{ color: '#8b5e2e', fontSize: '10px', letterSpacing: '1px' }}>골드</span>
          <span style={{ color: '#ffd700', fontSize: '16px', fontWeight: 'bold', textShadow: '0 0 6px rgba(255,215,0,0.5)' }}>
            {gold.toLocaleString()}
          </span>
        </div>

        {/* 몬스터 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 14px',
          background: danger ? 'rgba(200,30,30,0.2)' : 'rgba(30,30,50,0.4)',
          border: `1px solid ${danger ? '#aa2020' : '#2a1e3a'}`,
          borderRadius: '3px',
          transition: 'all 0.3s',
        }}>
          <span style={{ fontSize: '14px' }}>👾</span>
          <span style={{ color: danger ? '#ff8080' : '#8080b0', fontSize: '10px', letterSpacing: '1px' }}>
            {danger ? '⚠ 위험!' : '몬스터'}
          </span>
          <span style={{
            color: danger ? '#ff4444' : '#aaaadd',
            fontSize: '16px', fontWeight: 'bold',
            textShadow: danger ? '0 0 8px rgba(255,60,60,0.7)' : 'none',
            animation: danger ? 'pulse 1s infinite' : 'none',
          }}>
            {monsterCount}
            <span style={{ color: '#555', fontSize: '12px' }}> / {maxMonsterCount}</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;

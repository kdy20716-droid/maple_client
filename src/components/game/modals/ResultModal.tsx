import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { useAppStore } from '../../../store/appStore';
import { useUnitStore } from '../../../store/unitStore';

const ResultModal: React.FC = () => {
  const { isGameOver, isGameWon, wave, killCount, mineral, gas, resetGame } = useGameStore();
  const { setView } = useAppStore();
  const { units } = useUnitStore();

  if (!isGameOver && !isGameWon) return null;

  // 점수 계산 공식: (웨이브 * 1000) + (킬수 * 15) + (미네랄 * 5) + (가스 * 10) + (유닛 수 * 20)
  const finalScore = (wave * 1000) + (killCount * 15) + (mineral * 5) + (gas * 10) + (units.length * 20);

  const handleRestart = () => {
    resetGame();
    window.location.reload();
  };

  const handleLobby = () => {
    resetGame();
    setView('LOBBY');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        fontFamily: '"Gulim", "Dotum", sans-serif',
      }}
    >
      <div
        style={{
          width: '440px',
          background: 'linear-gradient(160deg, #2c1a0e, #140a04)',
          border: `3px solid ${isGameWon ? '#ffd700' : '#8b2020'}`,
          borderRadius: '6px',
          boxShadow: `0 10px 40px rgba(0,0,0,0.9), 0 0 30px ${isGameWon ? 'rgba(255,215,0,0.3)' : 'rgba(200,30,30,0.4)'}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          textAlign: 'center',
          animation: 'modalZoom 0.3s ease',
        }}
      >
        {/* 상단 타이틀 배너 */}
        <div
          style={{
            padding: '24px 20px 16px',
            background: isGameWon
              ? 'linear-gradient(180deg, rgba(255,215,0,0.2) 0%, transparent 100%)'
              : 'linear-gradient(180deg, rgba(200,30,30,0.2) 0%, transparent 100%)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>
            {isGameWon ? '🏆' : '💀'}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 900,
              color: isGameWon ? '#ffd700' : '#ff4444',
              letterSpacing: '2px',
              textShadow: `0 0 20px ${isGameWon ? 'rgba(255,215,0,0.6)' : 'rgba(255,50,50,0.6)'}`,
            }}
          >
            {isGameWon ? 'VICTORY - 전설의 수호자' : 'DEFEAT - 방어 실패'}
          </h2>
          <p style={{ margin: '8px 0 0', color: '#cbbba9', fontSize: '12px' }}>
            {isGameWon
              ? '축하합니다! 150웨이브 최종 보스 검은마법사를 격파하고 메이플 월드를 수호했습니다!'
              : '몬스터가 100마리 이상 누적(라인사)되거나 보스 제한 시간이 초과되어 방어선이 무너졌습니다.'}
          </p>
        </div>

        {/* 기록 통계 판넬 */}
        <div style={{ padding: '0 24px 20px' }}>
          <div
            style={{
              background: '#0d0804',
              border: '1.5px solid #4a2e10',
              borderRadius: '4px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #28180d', paddingBottom: '6px' }}>
              <span style={{ color: '#8b5e2e', fontSize: '12px' }}>클리어 웨이브</span>
              <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>Wave {wave} / 150</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #28180d', paddingBottom: '6px' }}>
              <span style={{ color: '#8b5e2e', fontSize: '12px' }}>처치한 몬스터</span>
              <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>👾 {killCount.toLocaleString()} 마리</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #28180d', paddingBottom: '6px' }}>
              <span style={{ color: '#8b5e2e', fontSize: '12px' }}>최종 보유 미네랄</span>
              <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}>💎 {mineral.toLocaleString()} M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #28180d', paddingBottom: '6px' }}>
              <span style={{ color: '#8b5e2e', fontSize: '12px' }}>최종 보유 가스</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '13px' }}>🟢 {gas.toLocaleString()} G</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #28180d', paddingBottom: '6px' }}>
              <span style={{ color: '#8b5e2e', fontSize: '12px' }}>육성한 유닛</span>
              <span style={{ color: '#88aaff', fontWeight: 'bold', fontSize: '13px' }}>총 {units.length} 기</span>
            </div>

            {/* 최종 스코어 */}
            <div
              style={{
                marginTop: '6px',
                padding: '10px',
                background: 'rgba(200,146,42,0.15)',
                border: '1px solid #8b5e2e',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>최종 점수 (SCORE)</span>
              <span style={{ color: '#ffd700', fontWeight: 900, fontSize: '20px', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                {finalScore.toLocaleString()} P
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRestart}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(180deg, #d09028, #8b5e10)',
              border: '2px solid #6a3e08',
              borderRadius: '3px',
              color: '#fff8e0',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 #4a2a04',
              outline: 'none',
            }}
          >
            🔄 다시 시작하기
          </button>
          <button
            onClick={handleLobby}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(180deg, #3a2212, #21130a)',
              border: '2px solid #5a3c24',
              borderRadius: '3px',
              color: '#ddccaa',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            🚪 로비로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;

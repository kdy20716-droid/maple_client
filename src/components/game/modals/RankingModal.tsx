import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';

interface RankItem {
  username: string;
  best_score: number;
  best_wave: number;
  games_played: number;
  last_played: string;
}

const DEFAULT_RANKS: RankItem[] = [
  { username: '타락파워전사', best_score: 185200, best_wave: 30, games_played: 142, last_played: '2025.06.11' },
  { username: '지존궁수', best_score: 164000, best_wave: 29, games_played: 98, last_played: '2025.06.11' },
  { username: '마법소녀썬콜', best_score: 142300, best_wave: 27, games_played: 85, last_played: '2025.06.10' },
  { username: '싸비', best_score: 128900, best_wave: 25, games_played: 67, last_played: '2025.06.10' },
  { username: '번개의신비', best_score: 115000, best_wave: 24, games_played: 54, last_played: '2025.06.09' },
  { username: '메이플마스터', best_score: 98000, best_wave: 21, games_played: 40, last_played: '2025.06.09' },
];

const RankingModal: React.FC = () => {
  const { isRankingModalOpen, setRankingModalOpen } = useUIStore();
  const [ranks, setRanks] = useState<RankItem[]>(DEFAULT_RANKS);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRankingModalOpen) {
        setRankingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRankingModalOpen, setRankingModalOpen]);

  useEffect(() => {
    if (isRankingModalOpen) {
      // 서버에서 랭킹 조회 시도
      fetch('http://localhost:3001/api/ranking')
        .then(res => res.json())
        .then(data => {
          if (data && data.ranking && data.ranking.length > 0) {
            setRanks(data.ranking);
          }
        })
        .catch(() => {
          // 서버 미실행 시 기본 랭킹 유지
        });
    }
  }, [isRankingModalOpen]);

  if (!isRankingModalOpen) return null;

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
          width: '520px',
          height: '460px',
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
          <span>🏆 메이플 디펜스 명예의 전당 (RANKING)</span>
          <button
            onClick={() => setRankingModalOpen(false)}
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

        {/* 바디 테이블 */}
        <div style={{ flex: 1, padding: '16px', background: '#0d0804', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '6px 12px', background: '#1c1109',
            borderBottom: '1px solid #3a2212', color: '#8b5e2e', fontSize: '11px', fontWeight: 'bold'
          }}>
            <span style={{ width: '45px' }}>순위</span>
            <span style={{ flex: 1 }}>용사 닉네임</span>
            <span style={{ width: '80px', textAlign: 'center' }}>최고 웨이브</span>
            <span style={{ width: '90px', textAlign: 'right' }}>최고 점수</span>
          </div>

          {ranks.map((item, idx) => {
            const isTop3 = idx < 3;
            const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}위`;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: idx % 2 === 0 ? 'rgba(30,18,10,0.5)' : 'transparent',
                  border: isTop3 ? '1px solid #8b5e2e' : '1px solid transparent',
                  borderRadius: '3px',
                }}
              >
                <span style={{ width: '45px', fontSize: isTop3 ? '16px' : '12px', fontWeight: 'bold', color: isTop3 ? '#ffd700' : '#888' }}>
                  {rankBadge}
                </span>
                <span style={{ flex: 1, color: isTop3 ? '#ffd700' : '#f0d080', fontWeight: 'bold', fontSize: '13px' }}>
                  {item.username}
                </span>
                <span style={{ width: '80px', textAlign: 'center', color: '#55ff55', fontWeight: 'bold', fontSize: '12px' }}>
                  Wave {item.best_wave}
                </span>
                <span style={{ width: '90px', textAlign: 'right', color: '#ffcc00', fontWeight: 'bold', fontSize: '13px' }}>
                  {item.best_score.toLocaleString()} P
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RankingModal;

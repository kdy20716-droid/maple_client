import React from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { useEnemyStore } from '../../../store/enemyStore';
import { useGameStore } from '../../../store/gameStore';
import { getStageConfig } from '../../../utils/stageUtils';

const WORLD_WIDTH = 4000;

// 미니맵 크기 설정
const MINIMAP_SIZE = 200; // 200px 고정 크기로 디자인 안정성 확보
const ratio = MINIMAP_SIZE / WORLD_WIDTH;

const MAP_CENTERS = [
  { x: 1000, y: 1000 },
  { x: 3000, y: 1000 },
  { x: 1000, y: 3000 },
  { x: 3000, y: 3000 },
];

const MinimapOverlay: React.FC = () => {
  const { scrollPos, setScrollPos } = useUIStore();
  const { units } = useUnitStore();
  const { enemies } = useEnemyStore();
  const { wave } = useGameStore();
  const stageInfo = getStageConfig(wave);

  const viewWidth = window.innerWidth;
  const viewHeight = window.innerHeight;

  const rectX = scrollPos.x * ratio;
  const rectY = scrollPos.y * ratio;
  const rectW = viewWidth * ratio;
  const rectH = viewHeight * ratio;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const wx = mx / ratio;
    const wy = my / ratio;

    const targetX = Math.max(0, Math.min(WORLD_WIDTH - viewWidth, wx - viewWidth / 2));
    const targetY = Math.max(0, Math.min(WORLD_WIDTH - viewHeight, wy - viewHeight / 2));

    setScrollPos(targetX, targetY);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 30,
        width: `${MINIMAP_SIZE + 16}px`, // 패딩 포함
        background: 'linear-gradient(160deg, #2c1a0e, #180d07)',
        border: '3px solid #8b5e2e',
        borderRadius: '4px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        fontFamily: '"Gulim", "Dotum", sans-serif',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* 미니맵 헤더 타이틀 바 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, #50351d, #2d1a0b)',
          border: '1px solid #1a0f07',
          padding: '2px 6px',
          borderRadius: '2px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#f0d080',
          textShadow: '1px 1px 1px #000',
          userSelect: 'none',
        }}
      >
        <span>🍁 {stageInfo.name}</span>
        <span style={{ color: '#888', fontSize: '9px' }}>CH. 1</span>
      </div>

      {/* 미니맵 맵 캔버스 영역 */}
      <div
        onClick={handleMinimapClick}
        style={{
          width: `${MINIMAP_SIZE}px`,
          height: `${MINIMAP_SIZE}px`,
          position: 'relative',
          background: '#0d180f', // 메이플 특유의 어두운 초록/검정 미니맵 배경
          border: '2px solid #1a0f07',
          borderRadius: '2px',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)',
          cursor: 'pointer',
        }}
      >
        {/* 격자 무늬 배경 효과 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '10px 10px',
            pointerEvents: 'none',
          }}
        />

        {/* 4개의 전투 구역 맵 구획 표시 */}
        {MAP_CENTERS.map((center, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              background: 'rgba(34, 76, 42, 0.25)', // 초록색 계열 맵 영역
              border: '1px dashed rgba(100, 200, 120, 0.4)',
              left: `${center.x * ratio}px`,
              top: `${center.y * ratio}px`,
              width: `${800 * ratio}px`,
              height: `${800 * ratio}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '2px',
              boxShadow: '0 0 5px rgba(0,250,100,0.1)',
            }}
          />
        ))}

        {/* 아군 유닛 점들 표시 */}
        {units.map((unit) => {
          if (!unit.position) return null;
          return (
            <div
              key={unit.id}
              style={{
                position: 'absolute',
                left: `${unit.position.x * ratio}px`,
                top: `${unit.position.y * ratio}px`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#55ff55', // 밝은 연두색 점
                border: '1px solid #004400',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                boxShadow: '0 0 4px #55ff55',
              }}
            />
          );
        })}

        {/* 적 몬스터 점들 표시 */}
        {enemies.map((enemy) => {
          if (!enemy.position) return null;
          return (
            <div
              key={enemy.id}
              style={{
                position: 'absolute',
                left: `${enemy.position.x * ratio}px`,
                top: `${enemy.position.y * ratio}px`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#ff3333', // 빨간색 점
                border: '1px solid #440000',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                boxShadow: '0 0 4px #ff3333',
              }}
            />
          );
        })}

        {/* 뷰포트 영역 (현재 화면 영역) */}
        <div
          style={{
            position: 'absolute',
            border: '1.5px solid #ffcc00',
            background: 'rgba(255, 204, 0, 0.08)',
            left: `${rectX}px`,
            top: `${rectY}px`,
            width: `${Math.min(MINIMAP_SIZE - rectX, rectW)}px`,
            height: `${Math.min(MINIMAP_SIZE - rectY, rectH)}px`,
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 0 8px rgba(255,204,0,0.4)',
          }}
        />
      </div>
    </div>
  );
};

export default MinimapOverlay;

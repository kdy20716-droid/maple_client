import React from 'react';
import { useUIStore } from '../../../store/uiStore';

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;
// 미니맵 크기를 화면 너비의 20% (최소 200px)로 동적 계산
const getMinimapSize = () => Math.max(200, Math.floor(window.innerWidth * 0.20));

const MAP_CENTERS = [
  { x: 1000, y: 1000 },
  { x: 3000, y: 1000 },
  { x: 1000, y: 3000 },
  { x: 3000, y: 3000 },
];

const MinimapOverlay: React.FC = () => {
  const { scrollPos } = useUIStore();
  const MINIMAP_SIZE = getMinimapSize();
  const ratio = MINIMAP_SIZE / WORLD_WIDTH;

  const viewWidth = window.innerWidth;
  const viewHeight = window.innerHeight;

  const rectX = scrollPos.x * ratio;
  const rectY = scrollPos.y * ratio;
  const rectW = viewWidth * ratio;
  const rectH = viewHeight * ratio;

  return (
    <div
      className="fixed bottom-0 left-0 bg-black/80 border-t-4 border-r-4 border-[#333] z-30 flex items-center justify-center p-2"
      style={{ width: '20vw', height: '20vw', minWidth: '200px', minHeight: '200px' }}
    >
      <div className="w-full h-full relative bg-slate-900 border border-white/20 shadow-inner overflow-hidden">
        {/* 4개의 계단 모양 사각형 맵 표시 */}
        {MAP_CENTERS.map((center, idx) => (
          <div 
            key={idx}
            className="absolute bg-white/10 border border-white/30"
            style={{
              left: center.x * ratio,
              top: center.y * ratio,
              width: 800 * ratio, // 800 크기로 확대 반영
              height: 800 * ratio,
              transform: 'translate(-50%, -50%)',
              // 미니맵에서도 계단 모양을 흉내내기 위해 살짝 깎음 (미니맵은 작아서 단순 처리)
              borderRadius: '4px' 
            }}
          />
        ))}

        {/* 뷰포트 사각형 */}
        <div 
          className="absolute border-2 border-yellow-400 bg-yellow-400/10 z-10 pointer-events-none"
          style={{
            left: rectX,
            top: rectY,
            width: rectW,
            height: rectH
          }}
        />

        <div className="absolute bottom-1 right-1 text-[10px] text-white/30 font-bold select-none uppercase">
          World 4K
        </div>
      </div>
    </div>
  );
};

export default MinimapOverlay;

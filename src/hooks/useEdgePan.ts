import { useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';

interface EdgePanOptions {
  speed?: number;
  margin?: number;
}

export const useEdgePan = (options: EdgePanOptions = {}) => {
  const { speed = 25, margin = 150 } = options; // 기본 마진 150으로 확대
  const containerRef = useRef<HTMLDivElement>(null);
  const { setScrollPos } = useUIStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let requestRef: number;
    let dx = 0;
    let dy = 0;

    const updatePanning = (x: number, y: number, width: number, height: number) => {
      dx = 0;
      dy = 0;
      if (x < margin) dx = -speed;
      else if (x > width - margin) dx = speed;
      if (y < margin) dy = -speed;
      else if (y > height - margin) dy = speed;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-no-pan="true"]')) {
        dx = 0;
        dy = 0;
        return;
      }
      updatePanning(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    };

    const clampScroll = () => {
      const minScrollY = 300;
      const maxScrollY = 3650 - window.innerHeight;
      if (container.scrollTop < minScrollY) {
        container.scrollTop = minScrollY;
      } else if (container.scrollTop > maxScrollY) {
        container.scrollTop = maxScrollY;
      }
    };

    // 초기 Y 스크롤 위치 설정
    container.scrollTop = 300;

    const loop = () => {
      if (container) {
        if (dx !== 0 || dy !== 0) {
          container.scrollLeft += dx;
          container.scrollTop += dy;
        }
      }
      requestRef = requestAnimationFrame(loop);
    };

    const handleScroll = () => {
      clampScroll();
      setScrollPos(container.scrollLeft, container.scrollTop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('scroll', handleScroll);
    requestRef = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestRef);
    };
  }, [speed, margin, setScrollPos]);

  return containerRef;
};

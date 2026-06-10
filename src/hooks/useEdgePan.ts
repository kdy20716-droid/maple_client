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
      updatePanning(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    };

    const loop = () => {
      if (container) {
        if (dx !== 0 || dy !== 0) {
          container.scrollLeft += dx;
          container.scrollTop += dy;
        }
        setScrollPos(container.scrollLeft, container.scrollTop);
      }
      requestRef = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestRef = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef);
    };
  }, [speed, margin, setScrollPos]);

  return containerRef;
};

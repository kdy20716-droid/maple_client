import React, { useEffect, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [realMouse, setRealMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setRealMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999]"
      style={{ 
        left: realMouse.x, 
        top: realMouse.y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* 메이플스토리 스타일 커서 (이모지로 대체하거나 추후 이미지로 교체 가능) */}
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L11 20L13 13L20 11L4 4Z" fill="white" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default CustomCursor;

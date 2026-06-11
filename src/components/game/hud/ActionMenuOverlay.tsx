import React, { useState } from 'react';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled }) => {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <button
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={onClick}
      disabled={disabled}
      className="relative w-full h-full bg-slate-800 border-2 border-[#5a4b3c] hover:bg-slate-700 transition-colors flex items-center justify-center text-2xl shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      
      {showLabel && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/20 font-bold tracking-tight">
          {label}
        </div>
      )}
    </button>
  );
};

const ActionMenuOverlay: React.FC = () => {
  return (
    <div
      className="fixed bottom-0 right-0 bg-black/80 border-t-4 border-l-4 border-[#333] z-30 p-2 grid grid-cols-3 grid-rows-2 gap-2"
      style={{ width: '20vw', height: '20vw', minWidth: '200px', minHeight: '200px' }}
    >
      <ActionButton icon="🗡️" label="전사 판매" onClick={() => {}} />
      <ActionButton icon="🧙" label="마법사 판매" onClick={() => {}} />
      <ActionButton icon="🏹" label="궁수 판매" onClick={() => {}} />
      <ActionButton icon="📜" label="도감 등록 (준비 중)" onClick={() => {}} disabled />
      <ActionButton icon="💎" label="전설 교환 (준비 중)" onClick={() => {}} disabled />
      <ActionButton icon="🔥" label="신화 구현 (준비 중)" onClick={() => {}} disabled />
    </div>
  );
};

export default ActionMenuOverlay;

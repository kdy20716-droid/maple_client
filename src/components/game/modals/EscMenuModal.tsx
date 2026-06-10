import React, { useEffect } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useAppStore } from '../../../store/appStore';

const EscMenuModal: React.FC = () => {
  const { isEscMenuOpen, setEscMenuOpen, setProbModalOpen, setInventoryModalOpen } = useUIStore();
  const { setView } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscMenuOpen(!isEscMenuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEscMenuOpen, setEscMenuOpen]);

  if (!isEscMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="maple-panel w-80 shadow-2xl animate-in zoom-in duration-200">
        <div className="maple-panel-header">
          <span>⚙️ 게임 메뉴</span>
          <button onClick={() => setEscMenuOpen(false)} className="hover:text-red-200">✖</button>
        </div>
        
        <div className="p-6 flex flex-col gap-3">
          <button 
            onClick={() => setEscMenuOpen(false)}
            className="maple-button !py-3 text-lg"
          >
            계속하기
          </button>
          <button 
            onClick={() => { setProbModalOpen(true); setEscMenuOpen(false); }}
            className="maple-button !py-3 text-lg"
          >
            유닛 확률 보기
          </button>
          <button 
            onClick={() => { setInventoryModalOpen(true); setEscMenuOpen(false); }}
            className="maple-button !py-3 text-lg"
          >
            보유 유닛 보기
          </button>
          <hr className="border-[#dccfc4] my-1" />
          <button 
            onClick={() => {
              if (confirm('정말 로비로 나가시겠습니까?')) {
                setView('LOBBY');
                setEscMenuOpen(false);
              }
            }}
            className="maple-button !py-3 text-lg !bg-gradient-to-b !from-slate-400 !to-slate-600 !border-slate-700 !shadow-slate-700"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscMenuModal;

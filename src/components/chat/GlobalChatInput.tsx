import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';

const GlobalChatInput: React.FC = () => {
  const { isChatActive, setChatActive, addMessage } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isChatActive) {
          // 채팅창 열기
          setChatActive(true);
          e.preventDefault();
        } else {
          // 열려있는 상태에서 엔터 -> 전송
          if (inputValue.trim() !== '') {
            addMessage(`[나] ${inputValue}`, '#1d3d6b');
            setInputValue('');
          }
          setChatActive(false);
          e.preventDefault();
        }
      } else if (e.key === 'Escape' && isChatActive) {
        setChatActive(false);
        setInputValue('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatActive, inputValue, setChatActive, addMessage]);

  useEffect(() => {
    if (isChatActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatActive]);

  if (!isChatActive) return null;

  return (
    <div className="absolute bottom-4 left-6 z-50 flex items-center w-96 bg-white/95 border-2 border-[#dccfc4] rounded-md shadow-lg overflow-hidden">
      <span className="bg-[#fdfaf7] px-3 py-2 text-[#8e6d46] font-bold border-r-2 border-[#dccfc4]">전체</span>
      <input 
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => setChatActive(false)}
        className="flex-1 px-3 py-2 outline-none text-[#5a4b3c] font-bold bg-transparent"
        placeholder="채팅을 입력하세요... (Enter로 전송)"
      />
    </div>
  );
};

export default GlobalChatInput;

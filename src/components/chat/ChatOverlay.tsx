import React from 'react';
import { useChatStore } from '../../store/chatStore';

const ChatOverlay: React.FC = () => {
  const { messages } = useChatStore();

  if (messages.length === 0) return null;

  return (
    <div className="absolute bottom-[280px] left-6 flex flex-col justify-end gap-1 z-40 pointer-events-none w-80">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className="bg-white/90 border-2 border-[#dccfc4] text-[#5a4b3c] px-3 py-1.5 rounded-md shadow-md font-bold text-sm tracking-wide animate-fade-in-up backdrop-blur-sm"
          style={{ color: msg.color || '#5a4b3c' }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatOverlay;

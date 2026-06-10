import React from 'react';
import { useRoomStore } from '../../store/roomStore';
import { useAppStore } from '../../store/appStore';
import ChatOverlay from '../../components/chat/ChatOverlay';

const RoomView: React.FC = () => {
  const { currentRoom, leaveRoom, toggleSlot, setMode } = useRoomStore();
  const { setView } = useAppStore();

  if (!currentRoom) {
    setView('LOBBY');
    return null;
  }

  const handleStartGame = () => {
    // 실제로는 소켓 통신 등을 통해 모든 유저의 View를 GAME으로 변경해야 함
    setView('GAME');
  };

  const handleLeave = () => {
    leaveRoom();
    setView('LOBBY');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f8f4f0] p-8 items-center relative">
      <div className="maple-panel w-full max-w-[800px] h-full shadow-2xl flex flex-col relative z-10">
        <div className="maple-panel-header !text-2xl !py-4 flex justify-between">
          <span className="font-bold">{currentRoom.title}</span>
          <button onClick={handleLeave} className="text-sm bg-[#1d3d6b] text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
            나가기
          </button>
        </div>

        <div className="p-6 bg-[#fdfaf7] border-b border-[#eaddcf] flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              className={`px-4 py-2 font-bold rounded-md border-2 transition-colors ${currentRoom.mode === 'INDIVIDUAL' ? 'bg-blue-500 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-300'}`}
              onClick={() => setMode('INDIVIDUAL')}
            >
              개인전
            </button>
            <button 
              className={`px-4 py-2 font-bold rounded-md border-2 transition-colors ${currentRoom.mode === 'COOP' ? 'bg-green-500 text-white border-green-700' : 'bg-white text-gray-500 border-gray-300'}`}
              onClick={() => setMode('COOP')}
            >
              협동전
            </button>
          </div>

          <button 
            onClick={handleStartGame}
            className="maple-button !px-8 !py-3 !text-2xl !bg-gradient-to-b !from-orange-400 !to-red-500 !border-red-700 !shadow-red-700 !text-white"
          >
            게임 시작
          </button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-2 gap-6 bg-[#f8f4f0]">
          {currentRoom.slots.map((slot) => (
            <div 
              key={slot.id} 
              onClick={() => toggleSlot(slot.id)}
              className={`relative border-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-md overflow-hidden ${
                slot.status === 'PLAYER' ? 'border-blue-400 bg-white' : 
                slot.status === 'CLOSED' ? 'border-gray-400 bg-gray-200 opacity-70' : 
                'border-green-400 bg-[#fdfaf7] hover:bg-green-50'
              }`}
            >
              {slot.id === 1 && <span className="absolute top-2 left-2 bg-yellow-400 text-[#5a4b3c] text-xs px-2 py-1 rounded-full font-bold">방장</span>}
              
              <span className="text-6xl mb-4">
                {slot.status === 'PLAYER' ? '🍄' : slot.status === 'CLOSED' ? '🔒' : '➕'}
              </span>
              <span className="text-xl font-bold text-[#5a4b3c]">
                {slot.status === 'PLAYER' ? slot.playerName : slot.status === 'CLOSED' ? '닫힘' : '오픈'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 룸 전용 채팅 오버레이 (위치 조정) */}
      <div className="absolute bottom-8 left-8 z-20">
        <ChatOverlay />
      </div>
    </div>
  );
};

export default RoomView;

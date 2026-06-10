import React, { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import type { RoomInfo } from '../../store/roomStore';
import { useAppStore } from '../../store/appStore';

const ITEMS_PER_PAGE = 15;

const LobbyView: React.FC = () => {
  const { rooms, createRoom, joinRoom } = useRoomStore();
  const { setView } = useAppStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 및 페이징 처리
  const filteredRooms = rooms.filter(room => room.title.includes(searchQuery));
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE) || 1;
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateRoom = () => {
    const title = prompt('방 제목을 입력하세요:', '초보만 오세요');
    if (title) {
      createRoom(title, 'INDIVIDUAL');
      setView('ROOM');
    }
  };

  const handleJoinRoom = (room: RoomInfo) => {
    const openCount = room.slots.filter(s => s.status === 'OPEN').length;
    
    if (openCount === 0) {
      alert('방이 꽉 찼습니다!');
      return;
    }
    joinRoom(room.id);
    setView('ROOM');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f8f4f0] p-8 items-center">
      <div className="maple-panel w-full max-w-[1000px] h-full shadow-2xl flex flex-col">
        <div className="maple-panel-header !text-2xl !py-4">
          <span className="font-bold">메이플 운빨 디펜스 - 로비</span>
        </div>
        
        <div className="p-4 bg-[#fdfaf7] border-b border-[#eaddcf] flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="방 제목 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border-2 border-[#dccfc4] rounded-md outline-none text-[#5a4b3c] font-bold"
          />
          <button 
            onClick={handleCreateRoom}
            className="maple-button !px-6 !bg-gradient-to-b !from-green-400 !to-green-600 !border-green-700 !shadow-green-700 !text-white text-xl font-bold flex items-center gap-2"
          >
            <span>+</span> 방 만들기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {paginatedRooms.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#cbbba9] font-bold text-xl">
              방이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {paginatedRooms.map(room => {
                const players = room.slots.filter(s => s.status === 'PLAYER').length;
                return (
                  <div 
                    key={room.id} 
                    className="flex justify-between items-center bg-white border-2 border-[#eaddcf] p-4 rounded-md hover:border-[#cbbba9] transition-colors cursor-pointer shadow-sm group"
                    onClick={() => handleJoinRoom(room)}
                  >
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-[#5a4b3c] group-hover:text-blue-600 transition-colors">
                        {room.title}
                      </span>
                      <span className="text-sm text-[#8e6d46] font-semibold">
                        모드: {room.mode === 'INDIVIDUAL' ? '개인전' : '협동전'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#1d3d6b] bg-blue-100 px-3 py-1 rounded-full">
                        {players} / 4
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#fdfaf7] border-t border-[#eaddcf] flex justify-center items-center gap-6">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="maple-button !py-1 !px-4"
          >
            이전
          </button>
          <span className="font-bold text-[#5a4b3c] text-lg">
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="maple-button !py-1 !px-4"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyView;

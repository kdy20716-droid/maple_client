import React from 'react';
import MinimapOverlay from './components/game/hud/MinimapOverlay';
import UnitInfoOverlay from './components/game/hud/UnitInfoOverlay';
import ActionMenuOverlay from './components/game/hud/ActionMenuOverlay';
import EscMenuModal from './components/game/modals/EscMenuModal';
import BattleField from './features/combat/BattleField';
import GlobalChatInput from './components/chat/GlobalChatInput';
import CustomCursor from './components/ui/CustomCursor';
import GameHeader from './components/ui/GameHeader';
import LobbyView from './features/lobby/LobbyView';
import RoomView from './features/room/RoomView';
import { useAppStore } from './store/appStore';

const GameView: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col pt-14">
      {/* 상단 리소스 바 (White/Beige 테마) */}
      <GameHeader />

      {/* 전투 필드 - 이제 flex-1을 통해 남은 높이를 꽉 채웁니다. */}
      <div className="flex-1 relative overflow-hidden">
        <BattleField />
      </div>

      {/* 하단 HUD 3종 세트 (Overlay) */}
      <MinimapOverlay />
      <UnitInfoOverlay />
      <ActionMenuOverlay />

      {/* 각종 모달 및 시스템 UI */}
      <EscMenuModal />
    </div>
  );
};

const App: React.FC = () => {
  const { currentView } = useAppStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8f4f0] overflow-hidden">
      <CustomCursor />
      <GlobalChatInput />
      
      {currentView === 'LOBBY' && <LobbyView />}
      {currentView === 'ROOM' && <RoomView />}
      {currentView === 'GAME' && <GameView />}
    </div>
  );
};

export default App;

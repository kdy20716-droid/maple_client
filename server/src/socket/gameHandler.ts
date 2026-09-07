import { Server, Socket } from 'socket.io';

// 게임 상태 동기화 핸들러
// 나중에 실시간 멀티플레이어 동기화 로직을 여기에 추가합니다

export const registerGameHandler = (io: Server, socket: Socket) => {
  const username: string = (socket.handshake.auth as any).username || '익명';

  // ── 게임 상태 동기화 ─────────────────────────
  socket.on('game:state', ({ roomId, state }: { roomId: string; state: any }) => {
    // 같은 룸의 다른 플레이어들에게 브로드캐스트
    socket.to(roomId).emit('game:state', { playerId: socket.id, username, state });
  });

  // ── 유닛 이동 ─────────────────────────────────
  socket.on('game:unitMove', ({ roomId, unitId, position }: any) => {
    socket.to(roomId).emit('game:unitMove', { unitId, position });
  });

  // ── 적 처치 (골드 공유 등 나중에 추가) ──────────
  socket.on('game:enemyKill', ({ roomId, enemyId, reward }: any) => {
    io.to(roomId).emit('game:enemyKill', { enemyId, reward, killedBy: username });
  });

  // ── 게임 종료 ─────────────────────────────────
  socket.on('game:over', ({ roomId, score, wave }: any) => {
    io.to(roomId).emit('game:over', { score, wave, endedBy: username });
    console.log(`[게임] 종료: room=${roomId} score=${score} wave=${wave}`);
  });
};

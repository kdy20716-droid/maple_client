import { Server, Socket } from 'socket.io';

interface Room {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  players: { id: string; name: string; ready: boolean }[];
  maxPlayers: number;
  status: 'waiting' | 'playing';
}

// 메모리 내 룸 목록 (실제 서비스에선 Redis 사용 권장)
const rooms = new Map<string, Room>();

const generateRoomId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const registerRoomHandler = (io: Server, socket: Socket) => {
  const username: string = (socket.handshake.auth as any).username || '익명';

  // ── 룸 목록 요청 ──────────────────────────
  socket.on('room:list', () => {
    const list = Array.from(rooms.values()).map(r => ({
      id: r.id,
      title: r.title,
      hostName: r.hostName,
      playerCount: r.players.length,
      maxPlayers: r.maxPlayers,
      status: r.status,
    }));
    socket.emit('room:list', list);
  });

  // ── 룸 생성 ──────────────────────────────
  socket.on('room:create', ({ title, maxPlayers }: { title: string; maxPlayers: number }) => {
    const roomId = generateRoomId();
    const room: Room = {
      id: roomId,
      title: title || `${username}의 방`,
      hostId: socket.id,
      hostName: username,
      players: [{ id: socket.id, name: username, ready: false }],
      maxPlayers: maxPlayers || 4,
      status: 'waiting',
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room:created', { roomId, room });
    io.emit('room:updated');
    console.log(`[룸] 생성: ${roomId} by ${username}`);
  });

  // ── 룸 입장 ──────────────────────────────
  socket.on('room:join', ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) { socket.emit('room:error', '존재하지 않는 방입니다.'); return; }
    if (room.status === 'playing') { socket.emit('room:error', '이미 게임 중인 방입니다.'); return; }
    if (room.players.length >= room.maxPlayers) { socket.emit('room:error', '방이 가득 찼습니다.'); return; }

    room.players.push({ id: socket.id, name: username, ready: false });
    socket.join(roomId);
    io.to(roomId).emit('room:state', room);
    io.emit('room:updated');
    console.log(`[룸] 입장: ${roomId} | ${username}`);
  });

  // ── 준비 상태 토글 ────────────────────────
  socket.on('room:ready', ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) player.ready = !player.ready;
    io.to(roomId).emit('room:state', room);
  });

  // ── 게임 시작 (방장만) ────────────────────
  socket.on('room:start', ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    const allReady = room.players.every(p => p.id === room.hostId || p.ready);
    if (!allReady) { socket.emit('room:error', '모든 플레이어가 준비를 완료해야 합니다.'); return; }
    room.status = 'playing';
    io.to(roomId).emit('room:start');
    io.emit('room:updated');
    console.log(`[룸] 게임 시작: ${roomId}`);
  });

  // ── 퇴장 / 연결 해제 ─────────────────────
  const leaveRoom = () => {
    rooms.forEach((room, roomId) => {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) return;
      room.players.splice(idx, 1);

      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else if (room.hostId === socket.id) {
        // 방장 이전
        room.hostId = room.players[0].id;
        room.hostName = room.players[0].name;
      }

      socket.leave(roomId);
      io.to(roomId).emit('room:state', room);
      io.emit('room:updated');
    });
  };

  socket.on('room:leave', leaveRoom);
  socket.on('disconnect', leaveRoom);
};

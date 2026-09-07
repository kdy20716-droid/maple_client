import { Server, Socket } from 'socket.io';

interface ChatMessage {
  username: string;
  text: string;
  color?: string;
  roomId: string;
}

export const registerChatHandler = (io: Server, socket: Socket) => {
  // 룸 채팅 메시지 전송
  socket.on('chat:send', (data: ChatMessage) => {
    if (!data.text || !data.roomId) return;

    const msg = {
      username: data.username || '익명',
      text: data.text.slice(0, 200), // 최대 200자
      color: data.color || '#ffffff',
      timestamp: Date.now(),
    };

    // 같은 룸의 모든 사람에게 전송
    io.to(data.roomId).emit('chat:receive', msg);
    console.log(`[채팅] ${data.roomId} | ${msg.username}: ${msg.text}`);
  });
};

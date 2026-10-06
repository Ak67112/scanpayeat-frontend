import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://scanpayeat-backend.vercel.app'
    : 'http://localhost:5001');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message);
    });
  }

  return socket;
}

export function joinShopRoom(shopId: number) {
  const s = getSocket();
  if (s.connected) {
    s.emit('join_shop', { shopId });
  } else {
    s.once('connect', () => {
      s.emit('join_shop', { shopId });
    });
  }
}

export function joinOrderRoom(orderId: number) {
  const s = getSocket();
  if (s.connected) {
    s.emit('join_order', { orderId });
  } else {
    s.once('connect', () => {
      s.emit('join_order', { orderId });
    });
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

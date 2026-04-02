import { io } from 'socket.io-client';

const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';

export function connectSocket(token) {
  const socket = io(import.meta.env.VITE_SOCKET_URL || `http://${host}:4000`, {
    auth: { token }
  });

  return socket;
}

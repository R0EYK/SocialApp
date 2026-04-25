import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

const resolveSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || window.location.origin;
};

export const getSocket = (accessToken: string): Socket => {
  if (socketInstance) {
    socketInstance.auth = { token: accessToken };
    return socketInstance;
  }

  socketInstance = io(resolveSocketUrl(), {
    transports: ["websocket"],
    autoConnect: false,
    auth: { token: accessToken },
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) {
    return;
  }
  socketInstance.disconnect();
  socketInstance = null;
};

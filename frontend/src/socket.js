// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const createSocket = () => {
  const socket = io(SOCKET_URL, {
    // later we'll pass auth: { token: ... }
    withCredentials: true,
  });
  return socket;
};

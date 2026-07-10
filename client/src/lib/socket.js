import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000",
  {
    autoConnect: false,
    transports: ["websocket", "polling"],
  }
);
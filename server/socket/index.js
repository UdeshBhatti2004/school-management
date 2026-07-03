import { Server } from "socket.io";
import { socketAuth } from "./auth.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
      ],
      credentials: true,
    },
  });

  // Authenticate every socket connection
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      `🔌 ${socket.user.name} (${socket.user.role}) connected`
    );

    // ===========================
    // Join Rooms
    // ===========================

    // Every user joins their school's room
    socket.join(`school:${socket.user.school}`);

    // Every user joins their own private room
    socket.join(`user:${socket.user._id}`);

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Students join their classroom room
    if (socket.user.role === "student" && socket.user.classRoom) {
      socket.join(`class:${socket.user.classRoom._id}`);
    }

    console.log("Joined rooms:", [...socket.rooms]);

    socket.on("disconnect", () => {
      console.log(
        `❌ ${socket.user.name} disconnected`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};
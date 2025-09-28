import { Server } from "socket.io";
import dotenv from "dotenv";

let io;
const activeUsers = new Map();
dotenv.config();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("message:new", (msg) => {
      io.to(msg.chatId).emit("message:new", msg);
    });

    socket.on("message:update", (msg) => {
      io.to(msg.chatId).emit("message:update", msg);
    });

    socket.on("message:delete", ({ messageId, chatId }) => {
      io.to(chatId).emit("message:delete", { messageId, chatId });
    });

    socket.on("message:seen", ({ chatId, userId }) => {
      io.to(chatId).emit("message:seen", { chatId, userId });
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { chatId, userId });
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("stop-typing", { chatId, userId });
    });

    socket.on("chat:join", ({ chatId }) => {
      socket.join(chatId);
    });

    socket.on("chat:leave", ({ chatId }) => {
      socket.leave(chatId);
    });

    socket.on("user:join-global", ({ userId }) => {
      activeUsers.set(userId, socket.id);
      io.emit("users:online", Array.from(activeUsers.keys())); 
    });

    socket.on("user:leave-global", ({ userId }) => {
      activeUsers.delete(userId);
      io.emit("users:online", Array.from(activeUsers.keys())); 
    });

    socket.on("disconnect", () => {
      let userId = null;
      for (let [key, value] of activeUsers.entries()) {
        if (value === socket.id) {
          userId = key;
          break;
        }
      }
      if (userId) {
        activeUsers.delete(userId);
        io.emit("users:online", Array.from(activeUsers.keys())); 
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};
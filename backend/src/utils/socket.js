const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true
    }
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Auth token required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId    = decoded.id;
      socket.companyId = socket.handshake.auth?.companyId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join company room
    if (socket.companyId) {
      socket.join(`company:${socket.companyId}`);
    }
    // Join personal room
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit to everyone in a company
const emitToCompany = (companyId, event, data) => {
  if (io) io.to(`company:${companyId}`).emit(event, data);
};

// Emit to a specific user
const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToCompany, emitToUser };

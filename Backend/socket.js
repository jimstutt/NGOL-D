// Backend/socket.js — Socket.IO server (NGOL-D, MariaDB-only)
const { Server } = require('socket.io');
function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173' }
  });
  io.on('connection', socket => {
    console.log('🔌 Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Socket disconnected:', socket.id));
  });
  return io;
}
module.exports = { setupSocket };

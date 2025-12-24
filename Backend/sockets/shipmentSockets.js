function initShipmentSockets(io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket.IO client connected');
    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO client disconnected');
    });
  });
}
module.exports = { initShipmentSockets };

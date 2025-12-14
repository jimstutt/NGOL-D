// NGO Logistics — Socket.IO Real-time Shipment Updates (ESM)
import { Server } from 'socket.io';

/**
 * Initialize Socket.IO for real-time shipment tracking
 * @param {import('http').Server} server - HTTP server instance
 * @returns {import('socket.io').Server} - Socket.IO server
 */
export function initShipmentSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket.IO client connected:', socket.id);

    // Listen for shipment updates from clients
    socket.on('updateShipment', (shipment) => {
      // Validate shipment shape
      if (!shipment || typeof shipment.id !== 'number') {
        socket.emit('error', { message: 'Invalid shipment data' });
        return;
      }

      // Broadcast to all other clients
      socket.broadcast.emit('shipmentUpdated', shipment);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO client disconnected:', socket.id);
    });
  });

  return io;
}

export const setupShipmentSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join shipment room for specific tracking
    socket.on('join_shipment_room', (shipmentId) => {
      socket.join(`shipment_${shipmentId}`);
      console.log(`User ${socket.id} joined shipment room: ${shipmentId}`);
    });

    // Leave shipment room
    socket.on('leave_shipment_room', (shipmentId) => {
      socket.leave(`shipment_${shipmentId}`);
      console.log(`User ${socket.id} left shipment room: ${shipmentId}`);
    });

    // Real-time location updates from drivers/mobile apps
    socket.on('driver_location_update', (data) => {
      const { shipmentId, latitude, longitude } = data;
      
      // Broadcast to everyone tracking this shipment
      io.to(`shipment_${shipmentId}`).emit('shipment_location_update', {
        shipmentId,
        latitude,
        longitude,
        timestamp: new Date()
      });

      console.log(`Location update for shipment ${shipmentId}`);
    });

    // Status updates from drivers
    socket.on('driver_status_update', (data) => {
      const { shipmentId, status, message } = data;
      
      io.to(`shipment_${shipmentId}`).emit('shipment_status_update', {
        shipmentId,
        status,
        message,
        timestamp: new Date()
      });

      console.log(`Status update for shipment ${shipmentId}: ${status}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

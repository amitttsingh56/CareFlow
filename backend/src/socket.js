let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    // Client can join a specific hospital room or listen to global updates
    socket.on('join:hospital', (hospitalId) => {
      socket.join(`hospital:${hospitalId}`);
    });

    socket.on('leave:hospital', (hospitalId) => {
      socket.leave(`hospital:${hospitalId}`);
    });
  });
};

export const getIO = () => ioInstance;

export const broadcastHospitalUpdate = (hospitalId, payload) => {
  if (!ioInstance) return;
  const updateData = {
    hospitalId,
    payload,
    timestamp: new Date().toISOString(),
    message: 'Reported availability updated'
  };

  // Broadcast to specific hospital room
  ioInstance.to(`hospital:${hospitalId}`).emit('hospital:updated', updateData);
  // Broadcast to all clients on search/list/map
  ioInstance.emit('hospitals:changed', updateData);
};

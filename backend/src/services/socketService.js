let ioInstance = null;

export function setIo(io) {
  ioInstance = io;
}

export function emitVideoProgress({ tenantId, userId, videoId, progress, status, sensitivity }) {
  if (!ioInstance) return;

  ioInstance.to(`tenant:${tenantId}`).emit('video:progress', {
    videoId,
    progress,
    status,
    sensitivity
  });

  ioInstance.to(`user:${userId}`).emit('video:progress', {
    videoId,
    progress,
    status,
    sensitivity
  });
}

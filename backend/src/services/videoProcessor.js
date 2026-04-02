import fs from 'node:fs';
import { Video } from '../models/Video.js';
import { emitVideoProgress } from './socketService.js';

const inFlight = new Set();

function computeSensitivity(storedName, size) {
  const base = `${storedName}:${size}`;
  let score = 0;
  for (let i = 0; i < base.length; i += 1) {
    score += base.charCodeAt(i);
  }
  return score % 5 === 0 ? 'flagged' : 'safe';
}

function estimateDurationSeconds(sizeBytes) {
  const mb = sizeBytes / (1024 * 1024);
  return Math.max(5, Math.round(mb * 3));
}

export async function startVideoProcessing(videoId) {
  if (inFlight.has(videoId)) return;

  inFlight.add(videoId);

  const video = await Video.findById(videoId);
  if (!video) {
    inFlight.delete(videoId);
    return;
  }

  if (!fs.existsSync(video.filePath)) {
    video.status = 'failed';
    await video.save();
    inFlight.delete(videoId);
    return;
  }

  video.status = 'processing';
  video.processingProgress = 5;
  await video.save();

  emitVideoProgress({
    tenantId: video.tenantId,
    userId: video.ownerId.toString(),
    videoId: video._id.toString(),
    progress: video.processingProgress,
    status: video.status,
    sensitivity: video.sensitivity
  });

  const timer = setInterval(async () => {
    try {
      const current = await Video.findById(videoId);
      if (!current) {
        clearInterval(timer);
        inFlight.delete(videoId);
        return;
      }

      const increment = Math.floor(Math.random() * 15) + 8;
      current.processingProgress = Math.min(95, current.processingProgress + increment);
      await current.save();

      emitVideoProgress({
        tenantId: current.tenantId,
        userId: current.ownerId.toString(),
        videoId: current._id.toString(),
        progress: current.processingProgress,
        status: current.status,
        sensitivity: current.sensitivity
      });

      if (current.processingProgress >= 95) {
        current.processingProgress = 100;
        current.status = 'processed';
        current.sensitivity = computeSensitivity(current.storedName, current.size);
        current.durationSeconds = estimateDurationSeconds(current.size);
        await current.save();

        emitVideoProgress({
          tenantId: current.tenantId,
          userId: current.ownerId.toString(),
          videoId: current._id.toString(),
          progress: current.processingProgress,
          status: current.status,
          sensitivity: current.sensitivity
        });

        clearInterval(timer);
        inFlight.delete(videoId);
      }
    } catch {
      clearInterval(timer);
      inFlight.delete(videoId);
    }
  }, 1500);
}

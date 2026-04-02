import fs from 'node:fs';
import path from 'node:path';
import { Video } from '../models/Video.js';
import { httpError } from '../utils/httpError.js';
import { startVideoProcessing } from '../services/videoProcessor.js';

export async function uploadVideo(req, res, next) {
  try {
    if (!req.file) {
      return next(httpError(400, 'Video file is required'));
    }

    const { title, description, category } = req.body;
    if (!title) {
      return next(httpError(400, 'title is required'));
    }

    const video = await Video.create({
      tenantId: req.user.tenantId,
      ownerId: req.user.id,
      title,
      description: description || '',
      category: category || 'general',
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',
      sensitivity: 'unknown',
      processingProgress: 0
    });

    startVideoProcessing(video._id.toString());

    return res.status(201).json({ video });
  } catch (error) {
    return next(error);
  }
}

export async function listVideos(req, res, next) {
  try {
    const { status, sensitivity, category, q } = req.query;

    const filter = { tenantId: req.user.tenantId };

    if (status) filter.status = status;
    if (sensitivity) filter.sensitivity = sensitivity;
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { originalName: { $regex: q, $options: 'i' } }
      ];
    }

    const videos = await Video.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({ videos });
  } catch (error) {
    return next(error);
  }
}

export async function getVideo(req, res, next) {
  try {
    const { id } = req.params;
    const video = await Video.findOne({ _id: id, tenantId: req.user.tenantId }).lean();

    if (!video) {
      return next(httpError(404, 'Video not found'));
    }

    return res.json({ video });
  } catch (error) {
    return next(error);
  }
}

export async function deleteVideo(req, res, next) {
  try {
    const { id } = req.params;
    const video = await Video.findOne({ _id: id, tenantId: req.user.tenantId });

    if (!video) {
      return next(httpError(404, 'Video not found'));
    }

    if (video.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(httpError(403, 'You cannot delete this video'));
    }

    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await video.deleteOne();

    return res.json({ message: 'Video deleted' });
  } catch (error) {
    return next(error);
  }
}

export async function streamVideo(req, res, next) {
  try {
    const { id } = req.params;
    const video = await Video.findOne({ _id: id, tenantId: req.user.tenantId }).lean();

    if (!video) {
      return next(httpError(404, 'Video not found'));
    }

    if (video.status !== 'processed') {
      return next(httpError(409, 'Video is not ready for streaming'));
    }

    const filePath = path.resolve(video.filePath);
    if (!fs.existsSync(filePath)) {
      return next(httpError(404, 'Video file missing on server'));
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = Number(parts[0]);
    const end = parts[1] ? Number(parts[1]) : fileSize - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
      return next(httpError(416, 'Requested range not satisfiable'));
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': video.mimeType
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } catch (error) {
    return next(error);
  }
}

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import {
  deleteVideo,
  getVideo,
  listVideos,
  streamVideo,
  uploadVideo
} from '../controllers/videoController.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const allowedExt = new Set(['.mp4', '.mov', '.webm', '.mkv', '.avi']);

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.has(ext)) {
      cb(httpError(400, 'Unsupported video format'));
      return;
    }
    cb(null, true);
  }
});

router.use(requireAuth);

router.post('/', requireRole('editor', 'admin'), upload.single('video'), uploadVideo);
router.get('/', listVideos);
router.get('/:id', getVideo);
router.get('/:id/stream', streamVideo);
router.delete('/:id', requireRole('editor', 'admin'), deleteVideo);

export default router;

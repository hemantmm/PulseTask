import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general' },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded'
    },
    sensitivity: {
      type: String,
      enum: ['unknown', 'safe', 'flagged'],
      default: 'unknown'
    },
    processingProgress: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: null }
  },
  { timestamps: true }
);

videoSchema.index({ tenantId: 1, createdAt: -1 });
videoSchema.index({ tenantId: 1, status: 1, sensitivity: 1 });

export const Video = mongoose.model('Video', videoSchema);

import { prisma } from '@shopstack/db';
import { createStorage } from '@shopstack/storage';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../env';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { publicMediaUrl } from '../lib/serialize';

export const mediaRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const storage = createStorage(env.storageDriver);

mediaRouter.post(
  '/',
  requireStaff('media.write'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'file is required');
    const ext = (req.file.originalname.split('.').pop() ?? 'bin').toLowerCase();
    const key = `media/${randomUUID()}.${ext}`;
    const stored = await storage.put({
      key,
      body: req.file.buffer,
      mimeType: req.file.mimetype,
    });
    const asset = await prisma.mediaAsset.create({
      data: {
        key: stored.key,
        url: stored.url,
        driver: env.storageDriver === 'local' ? 'LOCAL' : env.storageDriver === 'minio' ? 'MINIO' : 'S3',
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        alt: req.body?.alt,
        folder: req.body?.folder,
      },
    });
    res.status(201).json({ ...asset, url: publicMediaUrl(asset.url) || asset.url });
  }),
);

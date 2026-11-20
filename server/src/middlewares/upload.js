import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_DIR } from '../utils/files.js';

const TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${TYPES[file.mimetype] || path.extname(file.originalname)}`),
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (TYPES[file.mimetype]) return cb(null, true);
    cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'), { status: 400 }));
  },
}).single('image');

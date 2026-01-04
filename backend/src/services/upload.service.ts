import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Base uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');

// Create subdirectories for different media types
const mediaFolders = ['images', 'videos', 'audios'];
mediaFolders.forEach((folder) => {
  const folderPath = path.join(uploadsDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[/\\:\0]/g, '_').replace(/\.\./g, '_');
};

// Get folder based on mime type
const getMediaFolder = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audios';
  return 'images'; // default
};

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = getMediaFolder(file.mimetype);
    cb(null, path.join(uploadsDir, folder));
  },
  filename: (_req, file, cb) => {
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.mov'];
    const safeExt = allowedExts.includes(ext) ? ext : '';
    const filename = `${uuidv4()}${safeExt}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/x-m4a',
    // Video
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Fayl turi qo'llab-quvvatlanmaydi: ${file.mimetype}`));
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Get file URL with folder
export const getFileUrl = (filename: string, mimeType: string): string => {
  const folder = getMediaFolder(mimeType);
  return `/uploads/${folder}/${filename}`;
};

// Delete file
export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

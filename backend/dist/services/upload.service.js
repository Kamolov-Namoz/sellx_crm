"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileUrl = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Base uploads directory
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
// Create subdirectories for different media types
const mediaFolders = ['images', 'videos', 'audios'];
mediaFolders.forEach((folder) => {
    const folderPath = path_1.default.join(uploadsDir, folder);
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    }
});
// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
    return filename.replace(/[/\\:\0]/g, '_').replace(/\.\./g, '_');
};
// Get folder based on mime type
const getMediaFolder = (mimeType) => {
    if (mimeType.startsWith('image/'))
        return 'images';
    if (mimeType.startsWith('video/'))
        return 'videos';
    if (mimeType.startsWith('audio/'))
        return 'audios';
    return 'images'; // default
};
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        const folder = getMediaFolder(file.mimetype);
        cb(null, path_1.default.join(uploadsDir, folder));
    },
    filename: (_req, file, cb) => {
        const sanitizedOriginal = sanitizeFilename(file.originalname);
        const ext = path_1.default.extname(sanitizedOriginal).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.mov'];
        const safeExt = allowedExts.includes(ext) ? ext : '';
        const filename = `${(0, uuid_1.v4)()}${safeExt}`;
        cb(null, filename);
    },
});
// File filter
const fileFilter = (_req, file, cb) => {
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
    }
    else {
        cb(new Error(`Fayl turi qo'llab-quvvatlanmaydi: ${file.mimetype}`));
    }
};
// Multer instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});
// Get file URL with folder
const getFileUrl = (filename, mimeType) => {
    const folder = getMediaFolder(mimeType);
    return `/uploads/${folder}/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Delete file
const deleteFile = (filePath) => {
    const fullPath = path_1.default.join(process.cwd(), filePath.replace(/^\//, ''));
    if (fs_1.default.existsSync(fullPath)) {
        fs_1.default.unlinkSync(fullPath);
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=upload.service.js.map
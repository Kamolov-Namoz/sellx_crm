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
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
    // Remove path separators and null bytes
    return filename.replace(/[/\\:\0]/g, '_').replace(/\.\./g, '_');
};
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const sanitizedOriginal = sanitizeFilename(file.originalname);
        const ext = path_1.default.extname(sanitizedOriginal).toLowerCase();
        // Only allow specific extensions
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
// Get file URL
const getFileUrl = (filename) => {
    return `/uploads/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Delete file
const deleteFile = (filename) => {
    const filepath = path_1.default.join(uploadsDir, filename);
    if (fs_1.default.existsSync(filepath)) {
        fs_1.default.unlinkSync(filepath);
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=upload.service.js.map
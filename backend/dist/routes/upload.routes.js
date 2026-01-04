"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_service_1 = require("../services/upload.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
/**
 * POST /api/upload
 * Upload a file (image, audio, video)
 */
router.post('/', upload_service_1.upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: { code: 'NO_FILE', message: 'Fayl yuklanmadi' },
            });
            return;
        }
        const fileUrl = (0, upload_service_1.getFileUrl)(req.file.filename);
        res.json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map